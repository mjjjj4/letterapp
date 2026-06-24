import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const resend = new Resend(process.env.RESEND_API_KEY)

// Service role client — bypasses RLS, safe for server-only use
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Must disable body parser so we can read the raw body for Stripe signature verification
export const config = {
  api: {
    bodyParser: false,
  },
}

// Read raw body from request stream (required for Stripe signature verification)
function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

export default async function handler(req, res) {
  console.log('=== Stripe Webhook Received ===')
  console.log('Method:', req.method)

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Read raw body for signature verification
  let rawBody
  try {
    rawBody = await getRawBody(req)
    console.log('Raw body read, length:', rawBody.length)
  } catch (err) {
    console.error('Failed to read raw body:', err.message)
    return res.status(400).json({ error: 'Failed to read request body' })
  }

  // Verify Stripe signature
  const sig = req.headers['stripe-signature']
  console.log('Stripe signature present:', !!sig)
  console.log('Webhook secret present:', !!process.env.STRIPE_WEBHOOK_SECRET)

  let event
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )
    console.log('Signature verified. Event type:', event.type, 'ID:', event.id)
  } catch (err) {
    console.error('Signature verification failed:', err.message)
    return res.status(400).json({ error: `Webhook signature error: ${err.message}` })
  }

  // Only handle checkout.session.completed
  if (event.type !== 'checkout.session.completed') {
    console.log('Ignoring event type:', event.type)
    return res.status(200).json({ received: true })
  }

  const session = event.data.object
  console.log('=== Processing checkout.session.completed ===')
  console.log('Session ID:', session.id)
  console.log('Payment status:', session.payment_status)
  console.log('Full metadata:', JSON.stringify(session.metadata))
  console.log('Customer email:', session.customer_email)

  const capsuleId = session.metadata?.capsuleId
  const userId = session.metadata?.userId
  const userEmail = session.customer_email

  console.log('Extracted capsuleId:', capsuleId)
  console.log('Extracted userId:', userId)
  console.log('Extracted userEmail:', userEmail)

  if (!capsuleId) {
    console.error('No capsuleId in metadata — cannot update capsule')
    return res.status(400).json({ error: 'Missing capsuleId in Stripe metadata' })
  }

  if (!userId) {
    console.error('No userId in metadata — cannot update capsule')
    return res.status(400).json({ error: 'Missing userId in Stripe metadata' })
  }

  // Fetch the capsule using admin client
  console.log('Fetching capsule from Supabase...')
  const { data: capsules, error: fetchError } = await supabaseAdmin
    .from('capsules')
    .select('*')
    .eq('id', capsuleId)

  console.log('Fetch error:', fetchError)
  console.log('Capsules found:', capsules?.length)
  console.log('Capsule data:', JSON.stringify(capsules))

  if (fetchError) {
    console.error('Supabase fetch error:', fetchError.message)
    return res.status(500).json({ error: `Fetch failed: ${fetchError.message}` })
  }

  if (!capsules || capsules.length === 0) {
    console.error('Capsule not found for ID:', capsuleId)
    return res.status(404).json({ error: `Capsule ${capsuleId} not found` })
  }

  const capsule = capsules[0]
  console.log('Capsule current status:', capsule.status)

  // Update status to sealed using admin client
  console.log('Updating capsule status to sealed...')
  const { data: updateData, error: updateError } = await supabaseAdmin
    .from('capsules')
    .update({ status: 'sealed' })
    .eq('id', capsuleId)
    .select()

  console.log('Update error:', updateError)
  console.log('Update result:', JSON.stringify(updateData))

  if (updateError) {
    console.error('Failed to update capsule:', updateError.message)
    return res.status(500).json({ error: `Update failed: ${updateError.message}` })
  }

  console.log('Capsule successfully sealed in Supabase')

  // Send confirmation email
  if (userEmail) {
    try {
      const deliveryDate = new Date(capsule.deliver_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })

      console.log('Sending confirmation email to:', userEmail)

      await resend.emails.send({
        from: 'The Letter <noreply@theletter.app>',
        to: userEmail,
        subject: `Your capsule "${capsule.title}" has been sealed!`,
        html: `
          <h2>Your Capsule is Sealed</h2>
          <p>Your time capsule "<strong>${capsule.title}</strong>" has been sealed and will be delivered on <strong>${deliveryDate}</strong>.</p>
          <p>— The Letter Team</p>
        `,
      })
      console.log('Confirmation email sent')
    } catch (emailError) {
      console.error('Email send failed (non-fatal):', emailError.message)
    }
  }

  console.log('=== Webhook complete ===')
  return res.status(200).json({ received: true })
}
