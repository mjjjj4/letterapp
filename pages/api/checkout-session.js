import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const resend = new Resend(process.env.RESEND_API_KEY)

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const PRICE_PER_YEAR = 1.85

function getAppUrl() {
  let url = process.env.NEXT_PUBLIC_APP_URL || 'https://letterapp-black.vercel.app'
  if (!url.startsWith('http')) url = 'https://' + url
  return url.replace(/\/$/, '')
}

function serverGetDays(deliveryDate) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const deliver = new Date(deliveryDate)
  deliver.setHours(0, 0, 0, 0)
  return Math.round((deliver - today) / (1000 * 60 * 60 * 24))
}

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

function formatDate(ds) {
  return new Date(ds).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

function founderPromoEmailHtml(capsules, appUrl) {
  const capsuleList = capsules
    .map(c => `
      <div style="background:#F5E8E8;border-left:3px solid #8A2323;border-radius:4px;padding:14px 18px;margin-bottom:10px;">
        <p style="margin:0 0 4px;font-size:16px;color:#3A2418;font-weight:bold;">${c.title}</p>
        <p style="margin:0;font-size:13px;color:#7A6A5A;">Opens ${formatDate(c.deliveryDate)}</p>
      </div>`)
    .join('')

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
            <td style="padding:48px 48px 24px;text-align:center;">
              <p style="margin:0 0 12px;font-size:12px;letter-spacing:3px;color:#8A2323;text-transform:uppercase;font-family:Arial,sans-serif;">The Letter &mdash; Founder Promotion</p>
              <h1 style="margin:0 0 14px;font-size:26px;color:#4D0000;font-weight:normal;line-height:1.4;">
                Your capsule${capsules.length !== 1 ? 's are' : ' is'} sealed &mdash; free. 🎉
              </h1>
              <p style="margin:0;font-size:15px;color:#7A6A5A;line-height:1.7;font-family:Arial,sans-serif;">
                Thank you for being an early member of The Letter. Your capsule will arrive in your inbox when the time comes.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 48px 28px;">${capsuleList}</td>
          </tr>
          <tr>
            <td style="padding:0 48px 40px;text-align:center;">
              <p style="margin:0 0 28px;font-size:15px;color:#3A2418;line-height:1.8;font-family:Arial,sans-serif;">
                As a Founder member, you sealed this capsule free as part of our early access program. Your feedback means everything to us.
              </p>
              <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="background:#8A2323;border-radius:8px;text-align:center;">
                    <a href="${appUrl}/dashboard"
                       style="display:inline-block;padding:16px 40px;font-size:15px;color:#FFFBF5;text-decoration:none;font-family:Arial,sans-serif;font-weight:bold;">
                      View your capsules
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background:#FFFBF5;padding:20px 48px;border-top:1px solid rgba(77,0,0,0.15);text-align:center;">
              <p style="margin:0;font-size:12px;color:rgba(77,0,0,0.4);line-height:1.8;font-family:Arial,sans-serif;">
                The Letter &mdash; Time capsules for your future self.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim()
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

  const appUrl = getAppUrl()

  try {
    const validatedItems = []

    for (const item of cartItems) {
      const { capsuleId, deliveryDate } = item

      if (!capsuleId || !deliveryDate) {
        return res.status(400).json({ error: 'Each cart item needs capsuleId and deliveryDate' })
      }

      // Verify capsule exists, belongs to user, and is a draft
      const { data, error } = await supabaseAdmin
        .from('capsules')
        .select('id, title, status, user_id')
        .eq('id', capsuleId)
        .eq('user_id', userId)

      if (error) return res.status(500).json({ error: `Database error: ${error.message}` })
      if (!data || data.length === 0) return res.status(404).json({ error: `Capsule "${capsuleId}" not found or access denied` })
      if (data[0].status !== 'draft') return res.status(400).json({ error: `Capsule "${data[0].title}" is no longer a draft` })

      // Server-side date validation
      const days = serverGetDays(deliveryDate)
      if (days < 30) {
        return res.status(400).json({ error: `Delivery date for "${data[0].title}" must be at least 1 month from today` })
      }

      const isPromo = days <= 180

      if (isPromo) {
        validatedItems.push({ capsuleId, title: data[0].title, deliveryDate, years: null, price: 0, isFounderPromo: true })
      } else {
        const pricing = serverCalcPrice(deliveryDate)
        if (!pricing) return res.status(400).json({ error: `Invalid delivery date for "${data[0].title}"` })
        validatedItems.push({ capsuleId, title: data[0].title, deliveryDate, years: pricing.years, price: pricing.price, isFounderPromo: false })
      }

      console.log(`  "${data[0].title}" | days: ${days} | ${isPromo ? 'PROMO FREE' : `$${validatedItems[validatedItems.length - 1].price}`}`)
    }

    const promoItems = validatedItems.filter(i => i.isFounderPromo)
    const paidItems = validatedItems.filter(i => !i.isFounderPromo)

    // Seal promo items immediately for free
    if (promoItems.length > 0) {
      for (const item of promoItems) {
        const { error: sealError } = await supabaseAdmin
          .from('capsules')
          .update({ status: 'sealed', deliver_at: item.deliveryDate, is_founder_promo: true, donation_amount: 0 })
          .eq('id', item.capsuleId)

        if (sealError) {
          console.error(`Failed to seal promo capsule ${item.capsuleId}:`, sealError.message)
          return res.status(500).json({ error: `Failed to seal "${item.title}": ${sealError.message}` })
        }
        console.log(`  Sealed (free): "${item.title}" → ${item.deliveryDate}`)
      }

      // Send promo confirmation email (non-fatal)
      try {
        await resend.emails.send({
          from: 'The Letter <noreply@theletter.app>',
          to: userEmail,
          subject: promoItems.length === 1
            ? `Your capsule is sealed — free! 🎉 (Founder Promo)`
            : `${promoItems.length} capsules sealed free — Founder Promo 🎉`,
          html: founderPromoEmailHtml(promoItems, appUrl),
        })
        console.log('  Promo confirmation email sent to:', userEmail)
      } catch (emailErr) {
        console.error('  Promo email failed (non-fatal):', emailErr.message)
      }
    }

    // If no paid items, we're done — redirect to success page directly
    if (paidItems.length === 0) {
      console.log('All items were promo — no Stripe session needed')
      return res.status(200).json({ url: `${appUrl}/checkout/success` })
    }

    // Build Stripe session for paid items only
    const runningTotal = paidItems.reduce((sum, i) => sum + i.price, 0)
    const total = +runningTotal.toFixed(2)
    const unitAmount = Math.round(total * 100)

    console.log('Paid total:', total, '| cents:', unitAmount)

    const metadata = {
      userId,
      capsule_count: String(paidItems.length),
    }
    paidItems.forEach((item, i) => {
      metadata[`capsule_${i}`] = `${item.capsuleId}|${item.deliveryDate}|${item.price}`
    })

    const productName = paidItems.length === 1
      ? `Seal capsule: "${paidItems[0].title}"`
      : `Seal ${paidItems.length} time capsules`

    const description = paidItems
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
      success_url: `${appUrl}/checkout/success`,
      cancel_url: `${appUrl}/cart`,
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
