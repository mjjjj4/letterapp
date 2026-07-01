export const PRICE_PER_YEAR = 1.85
export const GIFT_PRICE_PER_YEAR = 5.00

// Returns { years, price, rate } or null if date is invalid / in the past
// Pass isGift=true to use $5.00/year gift pricing
export function calcPrice(dateStr, isGift = false) {
  if (!dateStr) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const deliver = new Date(dateStr)
  deliver.setHours(0, 0, 0, 0)
  if (deliver <= today) return null
  const ms = deliver - today
  const years = Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24 * 365.25)))
  const rate = isGift ? GIFT_PRICE_PER_YEAR : PRICE_PER_YEAR
  return { years, price: +(years * rate).toFixed(2), rate }
}

// Founder promo: free if delivery is 30–180 days (1–6 months) from today.
// Returns: { tooSoon: true } | { promo: true } | { standard: true } | null
export function getPromoInfo(dateStr) {
  if (!dateStr) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const deliver = new Date(dateStr)
  deliver.setHours(0, 0, 0, 0)
  const days = Math.round((deliver - today) / (1000 * 60 * 60 * 24))
  if (days < 30) return { tooSoon: true }
  if (days <= 180) return { promo: true }
  return { standard: true }
}

// "5 years, 2 months" / "1 year" / "8 months"
export function describeTime(dateStr) {
  const today = new Date()
  const deliver = new Date(dateStr)
  let y = deliver.getFullYear() - today.getFullYear()
  let m = deliver.getMonth() - today.getMonth()
  if (deliver.getDate() < today.getDate()) m--
  if (m < 0) { y--; m += 12 }
  const parts = []
  if (y > 0) parts.push(`${y} year${y !== 1 ? 's' : ''}`)
  if (m > 0) parts.push(`${m} month${m !== 1 ? 's' : ''}`)
  return parts.length ? parts.join(', ') : 'less than 1 month'
}

// Minimum selectable date: 1 month from today
export function getMinDate() {
  const d = new Date()
  d.setMonth(d.getMonth() + 1)
  return d.toISOString().split('T')[0]
}

export function loadCart() {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem('letterCart')
    return stored ? JSON.parse(stored) : []
  } catch { return [] }
}

export function saveCart(cart) {
  if (typeof window === 'undefined') return
  try { localStorage.setItem('letterCart', JSON.stringify(cart)) } catch {}
}
