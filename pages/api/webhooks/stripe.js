import Stripe from 'stripe'
import { supabase } from '../../../lib/supabase'
import { Resend } from 'resend'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const resend = new Resend(process.env.RESEND_API_KEY)

// Stripe webhook signature secret
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const sig = req.headers['stripe-signature']

  let event

  try {
    // Verify the webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return res.status(400).json({ error: `Webhook Error: ${err.message}` })
  }

  // Handle the event
  try {
    console.log('=== Webhook Event Received ===')
    console.log('Event type:', event.type)
    console.log('Event ID:', event.id)

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object

      console.log('=== Processing Checkout Session ===')
      console.log('Session ID:', session.id)
      console.log('Session metadata:', session.metadata)
      console.log('Customer email:', session.customer_email)
      console.log('Payment status:', session.payment_status)

      const capsuleId = session.metadata?.capsuleId
      const userId = session.metadata?.userId
      const userEmail = session.customer_email

      console.log('Extracted values:')
      console.log('  capsuleId:', capsuleId)
      console.log('  userId:', userId)
      console.log('  userEmail:', userEmail)

      if (!capsuleId) {
        console.error('No capsuleId in metadata:', session.metadata)
        return res.status(400).json({
          error: 'Missing capsuleId in metadata',
          metadata: session.metadata,
        })
      }

      console.log(`Fetching capsule with ID: ${capsuleId}`)

      // Fetch the capsule
      const { data: capsule, error: fetchError } = await supabase
        .from('capsules')
        .select('*')
        .eq('id', capsuleId)
        .single()

      console.log('Supabase fetch error:', fetchError)
      console.log('Supabase capsule:', capsule)

      if (fetchError) {
        console.error('Error fetching capsule:', fetchError)
        return res.status(404).json({
          error: `Capsule not found: ${fetchError.message}`,
          capsuleId: capsuleId,
        })
      }

      if (!capsule) {
        console.error('Capsule is null, ID:', capsuleId)
        return res.status(404).json({
          error: 'Capsule not found',
          capsuleId: capsuleId,
        })
      }

      console.log('Capsule found:', {
        id: capsule.id,
        title: capsule.title,
        status: capsule.status,
      })

      console.log('Updating capsule status to sealed...')

      // Update capsule status to "sealed"
      const { error: updateError } = await supabase
        .from('capsules')
        .update({ status: 'sealed' })
        .eq('id', capsuleId)
        .eq('user_id', userId)

      console.log('Update error:', updateError)

      if (updateError) {
        console.error('Error updating capsule:', updateError)
        return res.status(500).json({
          error: `Failed to update capsule: ${updateError.message}`,
          capsuleId: capsuleId,
        })
      }

      console.log('Capsule status updated successfully')

      // Send confirmation email via Resend
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
            <p>Congratulations! Your time capsule "<strong>${capsule.title}</strong>" has been successfully sealed and will be opened on <strong>${deliveryDate}</strong>.</p>
            <p>You can view your capsule at any time in your dashboard, but the message will remain sealed until the delivery date.</p>
            <p>This is a special moment—you've preserved a piece of yourself for the future.</p>
            <br>
            <p>— The Letter Team</p>
          `,
        })
        console.log('Confirmation email sent successfully')
      } catch (emailError) {
        console.error('Error sending email:', emailError)
        // Don't fail the webhook if email fails, just log it
      }

      console.log('Webhook processing complete')
      return res.status(200).json({ received: true })
    }

    // Handle other events if needed
    console.log('Unhandled event type:', event.type)
    return res.status(200).json({ received: true })
  } catch (err) {
    console.error('Error processing webhook:', err.message)
    console.error('Full error:', err)
    return res.status(500).json({
      error: `Webhook error: ${err.message}`,
      type: err.type,
    })
  }
}

// Disable body parsing for Stripe webhook (needed for signature verification)
export const config = {
  api: {
    bodyParser: false,
  },
}
