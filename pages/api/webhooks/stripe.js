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
  return new Date(ds).toLocaleDateString('en-US', {
    timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric',
  })
}

function emailShell(bodyContent) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#FFFBF5;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFFBF5;padding:48px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#FFFBF5;border-radius:10px;overflow:hidden;border:1px solid rgba(77,0,0,0.15);">
          <tr>
            <td style="background:#4D0000;padding:20px 16px;text-align:center;">
              <p style="margin:0;font-size:22px;color:#FFFBF5;font-family:Georgia,'Times New Roman',serif;font-weight:normal;letter-spacing:1px;">The Letter</p>
            </td>
          </tr>
          ${bodyContent}
          <tr>
            <td style="background:#393232;padding:16px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#FFFBF5;font-family:Arial,sans-serif;">&copy; 2026 The Letter &nbsp;|&nbsp; hello@theletter.app</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim()
}

// Confirmation email sent to the capsule owner/gifter after paid seal
function sealConfirmationHtml(results, total) {
  const totalDonation = +(total * 0.05).toFixed(2)

  const capsuleRows = results
    .map(r => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid rgba(77,0,0,0.12);font-size:14px;color:#3A2418;">${r.title}${r.isGift ? ' 🎁' : ''}</td>
        <td style="padding:10px 0;border-bottom:1px solid rgba(77,0,0,0.12);font-size:14px;color:#7A6A5A;text-align:right;">${formatDate(r.deliveryDate)}</td>
        <td style="padding:10px 0;border-bottom:1px solid rgba(77,0,0,0.12);font-size:14px;font-weight:bold;color:#3A2418;text-align:right;">$${r.price.toFixed(2)}</td>
      </tr>`)
    .join('')

  const hasPaidSelfCapsules = results.some(r => !r.isGift)

  return emailShell(`
    <tr>
      <td style="padding:40px 48px 24px;">
        <h2 style="font-size:22px;margin:0 0 8px;color:#4D0000;font-family:Georgia,serif;font-weight:normal;">
          Your capsule${results.length !== 1 ? 's are' : ' is'} sealed 🔒
        </h2>
        <p style="font-size:15px;color:#7A6A5A;line-height:1.6;margin:0 0 24px;font-family:Arial,sans-serif;">
          ${results.length === 1
            ? `We'll deliver <strong style="color:#3A2418;">${results[0].title}</strong> on <strong style="color:#3A2418;">${formatDate(results[0].deliveryDate)}</strong>.`
            : `We'll deliver each one to the right inbox on the dates below.`}
        </p>

        <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
          <thead>
            <tr>
              <th style="text-align:left;font-size:11px;color:#7A6A5A;text-transform:uppercase;letter-spacing:0.8px;padding-bottom:8px;font-family:Arial,sans-serif;">Capsule</th>
              <th style="text-align:right;font-size:11px;color:#7A6A5A;text-transform:uppercase;letter-spacing:0.8px;padding-bottom:8px;font-family:Arial,sans-serif;">Delivery Date</th>
              <th style="text-align:right;font-size:11px;color:#7A6A5A;text-transform:uppercase;letter-spacing:0.8px;padding-bottom:8px;font-family:Arial,sans-serif;">Cost</th>
            </tr>
          </thead>
          <tbody>${capsuleRows}</tbody>
        </table>

        <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
          <tr>
            <td style="background:rgba(77,0,0,0.06);border-radius:8px;padding:14px 16px;border:1px solid rgba(77,0,0,0.15);">
              <table style="width:100%;">
                <tr>
                  <td style="font-size:14px;color:#3A2418;font-weight:bold;font-family:Arial,sans-serif;">Total charged</td>
                  <td style="font-size:18px;color:#8A2323;font-weight:bold;text-align:right;font-family:Arial,sans-serif;">$${total.toFixed(2)}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        ${hasPaidSelfCapsules ? `
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="background:#fffbeb;border-radius:8px;padding:14px 16px;border-left:3px solid #f59e0b;">
              <p style="font-size:13px;color:#7A6A5A;margin:0;line-height:1.6;font-family:Arial,sans-serif;">
                💛 Your purchase includes a <strong style="color:#3A2418;">$${totalDonation.toFixed(2)}</strong> donation to the
                <a href="https://nationalpcf.org" style="color:#8A2323;text-decoration:none;font-weight:600;">National Pediatric Cancer Foundation</a>.
              </p>
            </td>
          </tr>
        </table>
        ` : ''}
      </td>
    </tr>
  `)
}

// Notification sent to gift RECIPIENT when their gift is sealed
function giftSealedNotificationHtml(fromName, deliveryDate) {
  return emailShell(`
    <tr>
      <td style="padding:56px 48px;text-align:center;background:#FFFBF5;">
        <h1 style="margin:0 0 24px;font-size:28px;color:#4D0000;font-weight:normal;line-height:1.5;font-family:Georgia,serif;">
          You received a gift. 🎁
        </h1>
        <p style="margin:0 0 20px;font-size:17px;color:#393232;line-height:1.9;font-family:Arial,sans-serif;">
          <strong>${fromName}</strong> sent you a time capsule message.
        </p>
        <p style="margin:0;font-size:16px;color:#7A6A5A;line-height:1.8;font-family:Arial,sans-serif;">
          It will open on <strong style="color:#3A2418;">${formatDate(deliveryDate)}</strong>.<br/>
          On that day, you&rsquo;ll receive a link to open it.
        </p>
      </td>
    </tr>
  `)
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

  const capsuleItems = []
  for (let i = 0; i < capsuleCount; i++) {
    const raw = session.metadata[`capsule_${i}`]
    if (!raw) { console.warn(`Missing capsule_${i} in metadata`); continue }
    // Format: capsuleId|deliveryDate|price|giftEmail|smsFlag
    const parts = raw.split('|')
    const [capsuleId, deliveryDate, priceStr, giftEmail, smsFlag] = parts
    capsuleItems.push({
      capsuleId,
      deliveryDate,
      price: parseFloat(priceStr),
      giftRecipientEmail: giftEmail || null,
      sendSms: smsFlag === '1',
    })
  }

  console.log(`Processing ${capsuleItems.length} capsule(s) for user ${userId}`)

  const results = []
  for (const item of capsuleItems) {
    const donationAmount = +(item.price * 0.05).toFixed(2)
    console.log(`Sealing capsule ${item.capsuleId} → deliver_at: ${item.deliveryDate} | donation: $${donationAmount}`)

    const sealFields = {
      status: 'sealed',
      deliver_at: item.deliveryDate,
      donation_amount: donationAmount,
      ...(item.giftRecipientEmail ? { gift_recipient_email: item.giftRecipientEmail } : {}),
      ...(item.sendSms ? { send_sms_notification: true } : {}),
    }
    const { data, error } = await supabaseAdmin
      .from('capsules')
      .update(sealFields)
      .eq('id', item.capsuleId)
      .select('id, title, is_gift, gift_recipient_email, gift_from_name')

    if (error) {
      console.error(`Failed to seal capsule ${item.capsuleId}:`, error.message)
      results.push({ ...item, donationAmount, title: '(unknown)', isGift: false, success: false, error: error.message })
    } else {
      const row = data?.[0] || {}
      console.log(`Sealed: "${row.title}"${row.is_gift ? ' (gift)' : ''}`)
      results.push({
        ...item,
        donationAmount,
        title: row.title || '(unknown)',
        isGift: row.is_gift || false,
        giftRecipientEmail: row.gift_recipient_email || null,
        giftFromName: row.gift_from_name || null,
        success: true,
      })
    }
  }

  const succeeded = results.filter(r => r.success)
  const failed = results.filter(r => !r.success)
  console.log(`Sealed: ${succeeded.length} | Failed: ${failed.length}`)

  // Send gift notification emails to recipients (non-fatal)
  for (const r of succeeded.filter(r => r.isGift && r.giftRecipientEmail)) {
    try {
      await resend.emails.send({
        from: 'The Letter <noreply@theletter.app>',
        to: r.giftRecipientEmail,
        subject: `You received a gift from ${r.giftFromName} 🎁`,
        html: giftSealedNotificationHtml(r.giftFromName, r.deliveryDate),
      })
      console.log(`Gift notification sent to: ${r.giftRecipientEmail}`)
    } catch (emailErr) {
      console.error(`Gift notification failed for ${r.giftRecipientEmail} (non-fatal):`, emailErr.message)
    }
  }

  // Send confirmation to capsule owner/gifter
  if (userEmail && succeeded.length > 0) {
    try {
      const total = succeeded.reduce((sum, r) => sum + (r.price || 0), 0)
      await resend.emails.send({
        from: 'The Letter <noreply@theletter.app>',
        to: userEmail,
        subject: succeeded.length === 1
          ? `Your capsule "${succeeded[0].title}" is sealed 🔒`
          : `${succeeded.length} capsules sealed 🔒`,
        html: sealConfirmationHtml(succeeded, +total.toFixed(2)),
      })
      console.log('Confirmation email sent to:', userEmail)
    } catch (emailErr) {
      console.error('Email send failed (non-fatal):', emailErr.message)
    }
  }

  console.log('=== Webhook complete ===')
  return res.status(200).json({ received: true, sealed: succeeded.length, failed: failed.length })
}
