import Stripe from 'stripe'
import { supabase } from '../../lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  console.log('=== Checkout Session API ===')
  console.log('Method:', req.method)

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { capsuleId, userEmail } = req.body

  console.log('Request body:', { capsuleId, userEmail })

  // Validate inputs
  if (!capsuleId || !userEmail) {
    const error = 'Missing capsuleId or userEmail'
    console.error('Validation error:', error)
    return res.status(400).json({ error, received: { capsuleId, userEmail } })
  }

  try {
    console.log('Fetching capsule with ID:', capsuleId)

    // Verify the capsule exists and belongs to the user
    const { data: capsule, error: fetchError } = await supabase
      .from('capsules')
      .select('*')
      .eq('id', capsuleId)
      .single()

    console.log('Supabase fetch error:', fetchError)
    console.log('Supabase capsule data:', capsule)

    if (fetchError) {
      console.error('Supabase error details:', fetchError)
      return res.status(404).json({
        error: `Failed to fetch capsule: ${fetchError.message}`,
        supabaseError: fetchError,
      })
    }

    if (!capsule) {
      console.error('Capsule not found for ID:', capsuleId)
      return res.status(404).json({
        error: 'Capsule not found',
        capsuleId: capsuleId,
      })
    }

    console.log('Capsule found:', {
      id: capsule.id,
      title: capsule.title,
      status: capsule.status,
      userId: capsule.user_id,
    })

    if (capsule.status !== 'draft') {
      console.error('Capsule is not in draft status:', capsule.status)
      return res.status(400).json({
        error: `Only draft capsules can be sealed. Current status: ${capsule.status}`,
      })
    }

    console.log('Creating Stripe checkout session...')
    console.log('Base URL:', process.env.NEXT_PUBLIC_BASE_URL)

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

    console.log('Stripe session created:', {
      sessionId: session.id,
      url: session.url,
      metadata: session.metadata,
    })

    return res.status(200).json({ url: session.url })
  } catch (err) {
    console.error('Error in checkout-session:', err.message)
    console.error('Full error:', err)
    return res.status(500).json({
      error: `Server error: ${err.message}`,
      type: err.type,
    })
  }
}
