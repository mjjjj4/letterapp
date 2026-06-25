import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const PRICE_PER_YEAR = 1.85

function serverCalcPrice(deliveryDate) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const deliver = new Date(deliveryDate)
  deliver.setHours(0, 0, 0, 0)
  const ms = deliver - today
  if (ms <= 0) return null
  const years = Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24 * 365.25)))
  return { years, price: +(years * PRICE_PER_YEAR).toFixed(2) }
}

export default async function handler(req, res) {
  console.log('=== Checkout Session API ===', new Date().toISOString())
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { cartItems, userId, userEmail } = req.body

  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    return res.status(400).json({ error: 'cartItems must be a non-empty array' })
  }
  if (!userId || !userEmail) {
    return res.status(400).json({ error: 'Missing userId or userEmail' })
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: 'Server configuration error: SUPABASE_SERVICE_ROLE_KEY not set' })
  }

  console.log('Cart items:', cartItems.length, '| userId:', userId)

  try {
    // Validate each capsule and recalculate prices server-side
    let runningTotal = 0
    const validatedItems = []

    for (const item of cartItems) {
      const { capsuleId, deliveryDate } = item

      if (!capsuleId || !deliveryDate) {
        return res.status(400).json({ error: 'Each cart item needs capsuleId and deliveryDate' })
      }

      // Verify capsule exists, belongs to user, and is still a draft
      const { data, error } = await supabaseAdmin
        .from('capsules')
        .select('id, title, status, user_id')
        .eq('id', capsuleId)
        .eq('user_id', userId)

      if (error) {
        console.error('Supabase error for capsule', capsuleId, error.message)
        return res.status(500).json({ error: `Database error: ${error.message}` })
      }
      if (!data || data.length === 0) {
        return res.status(404).json({ error: `Capsule "${capsuleId}" not found or access denied` })
      }
      if (data[0].status !== 'draft') {
        return res.status(400).json({ error: `Capsule "${data[0].title}" is no longer a draft (status: ${data[0].status})` })
      }

      // Recalculate server-side to prevent price spoofing
      const pricing = serverCalcPrice(deliveryDate)
      if (!pricing) {
        return res.status(400).json({ error: `Delivery date "${deliveryDate}" for "${data[0].title}" must be in the future` })
      }

      runningTotal += pricing.price
      validatedItems.push({
        capsuleId,
        title: data[0].title,
        deliveryDate,
        years: pricing.years,
        price: pricing.price,
      })

      console.log(`  Capsule: "${data[0].title}" | ${pricing.years}yr | $${pricing.price}`)
    }

    const total = +runningTotal.toFixed(2)
    const unitAmount = Math.round(total * 100)

    console.log('Total:', total, '| unit amount (cents):', unitAmount)

    // Build base URL
    let baseUrl = process.env.NEXT_PUBLIC_APP_URL || ''
    if (!baseUrl.startsWith('http')) baseUrl = 'https://' + baseUrl
    baseUrl = baseUrl.replace(/\/$/, '')

    // Store capsule data in Stripe metadata using indexed keys.
    // Each capsule_N value: "{uuid}|{YYYY-MM-DD}|{price}" — well under Stripe's 500-char limit per value.
    const metadata = {
      userId,
      capsule_count: String(validatedItems.length),
    }
    validatedItems.forEach((item, i) => {
      metadata[`capsule_${i}`] = `${item.capsuleId}|${item.deliveryDate}|${item.price}`
    })

    const productName = validatedItems.length === 1
      ? `Seal capsule: "${validatedItems[0].title}"`
      : `Seal ${validatedItems.length} time capsules`

    const description = validatedItems
      .map(item => `${item.title} — ${item.years}yr × $${PRICE_PER_YEAR}/yr = $${item.price.toFixed(2)}`)
      .join('; ')

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: productName, description },
          unit_amount: unitAmount,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${baseUrl}/checkout/success`,
      cancel_url: `${baseUrl}/cart`,
      customer_email: userEmail,
      metadata,
    })

    console.log('Stripe session created:', session.id)
    return res.status(200).json({ url: session.url })
  } catch (err) {
    console.error('Checkout session error:', err.message)
    return res.status(500).json({ error: err.message })
  }
}
