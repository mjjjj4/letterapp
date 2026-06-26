import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  // Cache for 1 hour at CDN, allow stale-while-revalidate
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=600')

  try {
    const { data, error } = await supabaseAdmin
      .from('capsules')
      .select('donation_amount')
      .in('status', ['sealed', 'delivered'])
      .gt('donation_amount', 0)

    if (error) throw error

    const total = data.reduce((sum, c) => sum + (Number(c.donation_amount) || 0), 0)
    return res.status(200).json({ total: +total.toFixed(2) })
  } catch {
    return res.status(200).json({ total: 0 })
  }
}
