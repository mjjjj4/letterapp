import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const resend = new Resend(process.env.RESEND_API_KEY)

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export const config = { api: { bodyParser: false } }

function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', chunk => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

function formatDate(ds) {
  return new Date(ds).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default async function handler(req, res) {
  console.log('=== Stripe Webhook Hit ===', new Date().toISOString())

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('STRIPE_WEBHOOK_SECRET not set')
    return res.status(500).json({ error: 'Webhook secret not configured' })
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('SUPABASE_SERVICE_ROLE_KEY not set')
    return res.status(500).json({ error: 'Service role key not configured' })
  }

  let rawBody
  try {
    rawBody = await getRawBody(req)
    console.log('Raw body length:', rawBody.length)
  } catch (err) {
    console.error('Failed to read raw body:', err.message)
    return res.status(400).json({ error: 'Failed to read request body' })
  }

  let event
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      req.headers['stripe-signature'],
      process.env.STRIPE_WEBHOOK_SECRET
    )
    console.log('Event verified:', event.type, event.id)
  } catch (err) {
    console.error('Signature verification failed:', err.message)
    return res.status(400).json({ error: `Webhook signature error: ${err.message}` })
  }

  if (event.type !== 'checkout.session.completed') {
    console.log('Ignoring event type:', event.type)
    return res.status(200).json({ received: true })
  }

  const session = event.data.object
  console.log('Session ID:', session.id, '| payment status:', session.payment_status)
  console.log('Metadata:', JSON.stringify(session.metadata))

  const userId = session.metadata?.userId
  const userEmail = session.customer_email
  const capsuleCount = parseInt(session.metadata?.capsule_count || '0', 10)

  if (!userId || capsuleCount === 0) {
    console.error('Missing userId or capsule_count in metadata')
    return res.status(400).json({ error: 'Missing required metadata' })
  }

  // Parse capsule items from indexed metadata keys
  const capsuleItems = []
  for (let i = 0; i < capsuleCount; i++) {
    const raw = session.metadata[`capsule_${i}`]
    if (!raw) { console.warn(`Missing capsule_${i} in metadata`); continue }
    const [capsuleId, deliveryDate, priceStr] = raw.split('|')
    capsuleItems.push({ capsuleId, deliveryDate, price: parseFloat(priceStr) })
  }

  console.log(`Processing ${capsuleItems.length} capsule(s) for user ${userId}`)

  // Seal each capsule and set the delivery date
  const results = []
  for (const item of capsuleItems) {
    console.log(`Sealing capsule ${item.capsuleId} → deliver_at: ${item.deliveryDate}`)
    const { data, error } = await supabaseAdmin
      .from('capsules')
      .update({ status: 'sealed', deliver_at: item.deliveryDate })
      .eq('id', item.capsuleId)
      .select('id, title')

    if (error) {
      console.error(`Failed to seal capsule ${item.capsuleId}:`, error.message)
      results.push({ ...item, title: '(unknown)', success: false, error: error.message })
    } else {
      const title = data?.[0]?.title || '(unknown)'
      console.log(`Sealed: "${title}"`)
      results.push({ ...item, title, success: true })
    }
  }

  const succeeded = results.filter(r => r.success)
  const failed = results.filter(r => !r.success)
  console.log(`Sealed: ${succeeded.length} | Failed: ${failed.length}`)

  // Send confirmation email
  if (userEmail && succeeded.length > 0) {
    try {
      const total = succeeded.reduce((sum, r) => sum + (r.price || 0), 0)

      const capsuleRows = succeeded
        .map(r => `
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #eee;font-size:14px;color:#333;">${r.title}</td>
            <td style="padding:10px 0;border-bottom:1px solid #eee;font-size:14px;color:#555;text-align:right;">${formatDate(r.deliveryDate)}</td>
            <td style="padding:10px 0;border-bottom:1px solid #eee;font-size:14px;font-weight:bold;color:#333;text-align:right;">$${r.price.toFixed(2)}</td>
          </tr>`)
        .join('')

      await resend.emails.send({
        from: 'The Letter <noreply@theletter.app>',
        to: userEmail,
        subject: succeeded.length === 1
          ? `Your capsule "${succeeded[0].title}" is sealed 🔒`
          : `${succeeded.length} capsules sealed 🔒`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#333;">
            <h2 style="font-size:22px;margin:0 0 8px;">Your capsule${succeeded.length !== 1 ? 's are' : ' is'} sealed 🔒</h2>
            <p style="font-size:15px;color:#555;line-height:1.6;margin:0 0 24px;">
              ${succeeded.length === 1
                ? `We'll deliver <strong>${succeeded[0].title}</strong> to your inbox on <strong>${formatDate(succeeded[0].deliveryDate)}</strong>.`
                : `We'll deliver each one to your inbox on the dates below. Future you is going to love this.`}
            </p>

            <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
              <thead>
                <tr>
                  <th style="text-align:left;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:0.8px;padding-bottom:8px;">Capsule</th>
                  <th style="text-align:right;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:0.8px;padding-bottom:8px;">Delivery Date</th>
                  <th style="text-align:right;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:0.8px;padding-bottom:8px;">Cost</th>
                </tr>
              </thead>
              <tbody>${capsuleRows}</tbody>
            </table>

            <div style="background:#f0fdf4;border-radius:8px;padding:14px 16px;display:flex;justify-content:space-between;margin-bottom:28px;">
              <span style="font-size:14px;color:#166534;font-weight:bold;">Total charged</span>
              <span style="font-size:18px;color:#065f46;font-weight:bold;">$${total.toFixed(2)}</span>
            </div>

            <p style="font-size:13px;color:#888;line-height:1.6;margin:0;">
              — The Letter Team
            </p>
          </div>
        `,
      })
      console.log('Confirmation email sent to:', userEmail)
    } catch (emailErr) {
      console.error('Email send failed (non-fatal):', emailErr.message)
    }
  }

  console.log('=== Webhook complete ===')
  return res.status(200).json({ received: true, sealed: succeeded.length, failed: failed.length })
}
