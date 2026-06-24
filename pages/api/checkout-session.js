import Stripe from 'stripe'
import { supabase } from '../../lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  console.log('=== Checkout Session API ===')
  console.log('Method:', req.method)

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { capsuleId, userId, userEmail } = req.body

  console.log('Request body:', { capsuleId, userId, userEmail })

  // Validate inputs
  if (!capsuleId || !userEmail || !userId) {
    const error = 'Missing capsuleId, userId, or userEmail'
    console.error('Validation error:', error)
    return res.status(400).json({ error, received: { capsuleId, userId, userEmail } })
  }

  try {
    console.log('Fetching capsule with ID:', capsuleId, 'for user:', userId)

    // Verify the capsule exists and belongs to the user
    const { data: capsuleArray, error: fetchError } = await supabase
      .from('capsules')
      .select('*')
      .eq('id', capsuleId)
      .eq('user_id', userId)

    console.log('Supabase fetch error:', fetchError)
    console.log('Supabase response (array):', capsuleArray)
    console.log('Response length:', capsuleArray?.length)

    if (fetchError) {
      console.error('Supabase error details:', fetchError)
      return res.status(404).json({
        error: `Failed to fetch capsule: ${fetchError.message}`,
        supabaseError: fetchError,
        capsuleId: capsuleId,
      })
    }

    if (!capsuleArray || capsuleArray.length === 0) {
      console.error('Capsule not found for ID:', capsuleId, 'and user:', userId)

      // Try to fetch without user_id to see if it's an RLS issue
      const { data: allCapsules, error: allError } = await supabase
        .from('capsules')
        .select('id, user_id, title, status')
        .eq('id', capsuleId)

      console.log('Debug: Capsule lookup without user_id filter:')
      console.log('  Error:', allError)
      console.log('  Data:', allCapsules)

      return res.status(404).json({
        error: `Capsule with ID "${capsuleId}" not found or you don't have access`,
        capsuleId: capsuleId,
        userId: userId,
        found: false,
        debugInfo: allCapsules ? 'Capsule exists but RLS may be blocking access' : 'Capsule does not exist',
      })
    }

    if (capsuleArray.length > 1) {
      console.error('Multiple capsules found for ID:', capsuleId)
      return res.status(500).json({
        error: 'Database error: multiple capsules with same ID',
        capsuleId: capsuleId,
      })
    }

    const capsule = capsuleArray[0]

    console.log('Capsule fetched successfully:', {
      id: capsule.id,
      title: capsule.title,
      status: capsule.status,
      userId: capsule.user_id,
    })

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
