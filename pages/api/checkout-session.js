import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// Service role client — bypasses RLS, required for server-side queries
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

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

    // Verify the capsule exists and belongs to the user (admin client bypasses RLS)
    console.log('Querying capsule — capsuleId:', capsuleId, '| userId filter:', userId)
    console.log('Using service role key:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)

    const { data: capsuleArray, error: fetchError } = await supabaseAdmin
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
      console.error('Capsule not found — capsuleId:', capsuleId, '| userId:', userId)

      // Debug: check if capsule exists at all (no user_id filter) to distinguish "wrong user" vs "missing"
      const { data: anyMatch, error: anyError } = await supabaseAdmin
        .from('capsules')
        .select('id, user_id, title, status')
        .eq('id', capsuleId)

      console.log('Debug lookup (no user filter) — error:', anyError, '| data:', anyMatch)

      const debugInfo = anyMatch && anyMatch.length > 0
        ? `Capsule exists but user_id mismatch — capsule.user_id: ${anyMatch[0].user_id} | requested userId: ${userId}`
        : 'Capsule does not exist in database at all'

      console.error('Debug info:', debugInfo)

      return res.status(404).json({
        error: `Capsule with ID "${capsuleId}" not found or you don't have access`,
        capsuleId,
        userId,
        debugInfo,
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

    // Get and validate base URL
    let baseUrl = process.env.NEXT_PUBLIC_APP_URL
    console.log('Raw NEXT_PUBLIC_APP_URL:', baseUrl)

    // Validate base URL is set
    if (!baseUrl) {
      console.error('NEXT_PUBLIC_APP_URL environment variable is not set')
      return res.status(500).json({
        error: 'Server configuration error: NEXT_PUBLIC_APP_URL is not set',
        details: 'Contact support. Environment: ' + (process.env.NODE_ENV || 'unknown'),
      })
    }

    // Ensure base URL has https:// scheme
    if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
      console.warn('Base URL missing scheme, adding https://')
      baseUrl = 'https://' + baseUrl
    }

    // Remove trailing slash if present
    baseUrl = baseUrl.replace(/\/$/, '')

    const successUrl = `${baseUrl}/capsule/${capsuleId}/success`
    const cancelUrl = `${baseUrl}/capsule/${capsuleId}`

    console.log('Stripe URLs:')
    console.log('  Success URL:', successUrl)
    console.log('  Cancel URL:', cancelUrl)

    // Validate URLs have proper scheme
    if (!successUrl.startsWith('https://') && !successUrl.startsWith('http://')) {
      console.error('Success URL missing scheme:', successUrl)
      return res.status(500).json({
        error: 'Invalid success URL configuration',
        successUrl: successUrl,
      })
    }

    // Calculate price: $1.85 per year between today and deliver_at (minimum 1 year)
    const today = new Date()
    const deliverDate = new Date(capsule.deliver_at)
    const msPerYear = 1000 * 60 * 60 * 24 * 365.25
    const years = Math.max(1, Math.ceil((deliverDate - today) / msPerYear))
    const pricePerYear = 1.85
    const totalDollars = +(years * pricePerYear).toFixed(2)
    const unitAmount = Math.round(totalDollars * 100) // Stripe expects cents

    console.log(`Pricing: ${years} year(s) × $${pricePerYear} = $${totalDollars} (${unitAmount} cents)`)

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Seal Capsule: "${capsule.title}"`,
              description: `${years} year${years !== 1 ? 's' : ''} × $${pricePerYear}/year — delivered ${new Date(capsule.deliver_at).toLocaleDateString()}.`,
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
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
