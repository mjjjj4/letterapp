import Stripe from 'stripe'
import { supabase } from '../../lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { capsuleId, userEmail } = req.body

  // Validate inputs
  if (!capsuleId || !userEmail) {
    return res.status(400).json({ error: 'Missing capsuleId or userEmail' })
  }

  try {
    // Verify the capsule exists and belongs to the user
    const { data: capsule, error: fetchError } = await supabase
      .from('capsules')
      .select('*')
      .eq('id', capsuleId)
      .single()

    if (fetchError || !capsule) {
      return res.status(404).json({ error: 'Capsule not found' })
    }

    if (capsule.status !== 'draft') {
      return res.status(400).json({ error: 'Only draft capsules can be sealed' })
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Seal Capsule: "${capsule.title}"`,
              description: `Seal and preserve your time capsule. It will be delivered on ${new Date(capsule.deliver_at).toLocaleDateString()}.`,
            },
            unit_amount: 1900, // $19.00 in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/capsule/${capsuleId}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/capsule/${capsuleId}`,
      customer_email: userEmail,
      metadata: {
        capsuleId: capsuleId,
        userId: capsule.user_id,
      },
    })

    return res.status(200).json({ url: session.url })
  } catch (err) {
    console.error('Stripe error:', err)
    return res.status(500).json({ error: err.message })
  }
}
