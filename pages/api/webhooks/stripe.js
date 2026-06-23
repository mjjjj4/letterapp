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
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object

      const capsuleId = session.metadata.capsuleId
      const userId = session.metadata.userId
      const userEmail = session.customer_email

      console.log(`Processing payment for capsule ${capsuleId}`)

      // Fetch the capsule
      const { data: capsule, error: fetchError } = await supabase
        .from('capsules')
        .select('*')
        .eq('id', capsuleId)
        .single()

      if (fetchError || !capsule) {
        console.error('Capsule not found:', fetchError)
        return res.status(404).json({ error: 'Capsule not found' })
      }

      // Update capsule status to "sealed"
      const { error: updateError } = await supabase
        .from('capsules')
        .update({ status: 'sealed' })
        .eq('id', capsuleId)
        .eq('user_id', userId)

      if (updateError) {
        console.error('Error updating capsule:', updateError)
        return res.status(500).json({ error: 'Failed to update capsule' })
      }

      // Send confirmation email via Resend
      try {
        const deliveryDate = new Date(capsule.deliver_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })

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
        console.log('Confirmation email sent to:', userEmail)
      } catch (emailError) {
        console.error('Error sending email:', emailError)
        // Don't fail the webhook if email fails, just log it
      }

      return res.status(200).json({ received: true })
    }

    // Handle other events if needed
    return res.status(200).json({ received: true })
  } catch (err) {
    console.error('Error processing webhook:', err)
    return res.status(500).json({ error: err.message })
  }
}

// Disable body parsing for Stripe webhook (needed for signature verification)
export const config = {
  api: {
    bodyParser: false,
  },
}
