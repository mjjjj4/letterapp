import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { supabase } from '../lib/supabase'
import { calcPrice, getPromoInfo, describeTime, getMinDate, loadCart, saveCart } from '../lib/cart'
import SiteNav from '../components/SiteNav'
import SiteFooter from '../components/SiteFooter'

const WINE = '#952323'
const CREAM = '#FFE6E1'
const BLUSH = '#EDBFC6'
const CHARCOAL = '#393232'
const F = { serif: "'Lora','Georgia',serif", sans: "'Inter',Arial,sans-serif" }

export default function Cart() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(true)
  const [checkingOut, setCheckingOut] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/'); return }
      setUser(user)
      setCart(loadCart())
      setLoading(false)
    }
    init()
  }, [router])

  const removeItem = (capsuleId) => {
    setCart(prev => {
      const updated = prev.filter(x => x.capsuleId !== capsuleId)
      saveCart(updated)
      return updated
    })
  }

  const updateDate = (capsuleId, dateStr) => {
    const info = getPromoInfo(dateStr)
    let years = null
    let price = null
    let isFounderPromo = false
    let dateError = null

    if (!dateStr) {
      // no date selected
    } else if (info?.tooSoon) {
      dateError = 'Must wait at least 1 month from today'
    } else if (info?.promo) {
      isFounderPromo = true
      price = 0
    } else if (info?.standard) {
      const pricing = calcPrice(dateStr)
      if (pricing) { years = pricing.years; price = pricing.price }
    }

    setCart(prev => {
      const updated = prev.map(item => {
        if (item.capsuleId !== capsuleId) return item
        return { ...item, deliveryDate: dateStr, years, price, isFounderPromo, dateError }
      })
      saveCart(updated)
      return updated
    })
  }

  // An item is "ready" if it has a date, no error, and price is set (0 is valid for promo)
  const allDatesSet = cart.length > 0 && cart.every(
    item => item.deliveryDate && !item.dateError && item.price !== null
  )
  const total = +(cart.reduce((sum, item) => sum + (item.price || 0), 0)).toFixed(2)
  const allPromo = cart.length > 0 && cart.every(item => item.isFounderPromo)

  const handleCheckout = async () => {
    if (!allDatesSet || !user) return
    setCheckingOut(true)
    setError('')
    try {
      const response = await fetch('/api/checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartItems: cart, userId: user.id, userEmail: user.email }),
      })
      const data = await response.json()
      if (!response.ok) { setError(data.error || 'Failed to create checkout session'); setCheckingOut(false); return }
      try {
        localStorage.setItem('pendingOrder', JSON.stringify({
          cartItems: cart, total, isFounderPromo: allPromo,
          timestamp: new Date().toISOString(),
        }))
      } catch {}
      window.location.href = data.url
    } catch (err) {
      setError(err.message || 'Something went wrong')
      setCheckingOut(false)
    }
  }

  const formatDate = (ds) =>
    new Date(ds).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: CREAM }}>
        <p style={{ fontFamily: F.sans, fontSize: 16, color: '#888' }}>Loading…</p>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Cart — The Letter</title>
      </Head>

      <SiteNav />

      <div style={cs.page}>
        <div style={cs.body}>
          <h1 style={cs.pageTitle}>Your cart</h1>

          {cart.length === 0 ? (
            <div style={cs.emptyCart}>
              <p style={cs.emptyIcon}>🛒</p>
              <p style={cs.emptyHeadline}>Your cart is empty</p>
              <p style={cs.emptyBody}>
                Go back to your dashboard and click &ldquo;Seal &amp; Pay&rdquo; on a draft capsule to add it here.
              </p>
              <button onClick={() => router.push('/dashboard')} style={cs.dashBtn}>
                Back to dashboard
              </button>
            </div>
          ) : (
            <>
              {/* Promo banner */}
              <div style={cs.promoBanner}>
                <span style={cs.promoBannerIcon}>🎉</span>
                <p style={cs.promoBannerText}>
                  <strong>Founder Promotion:</strong> Select a delivery date 1–6 months from today and seal your capsule for <strong>free</strong>.
                </p>
              </div>

              {error && <div style={cs.errorBox}>{error}</div>}

              <div style={cs.itemList}>
                {cart.map(item => {
                  const hasValidDate = !!(item.deliveryDate && !item.dateError && item.price !== null)

                  return (
                    <div key={item.capsuleId} style={cs.cartItem}>
                      <div style={cs.itemHeader}>
                        <h3 style={cs.itemTitle}>{item.title}</h3>
                        <button onClick={() => removeItem(item.capsuleId)} style={cs.removeBtn}>Remove</button>
                      </div>

                      <div style={cs.dateSection}>
                        <label style={cs.dateLabel}>When should this be delivered?</label>
                        <input
                          type="date"
                          min={getMinDate()}
                          value={item.deliveryDate || ''}
                          onChange={e => updateDate(item.capsuleId, e.target.value)}
                          style={
                            item.dateError ? cs.dateInputError
                            : hasValidDate ? cs.dateInputValid
                            : cs.dateInputEmpty
                          }
                        />
                        {item.dateError && (
                          <p style={cs.dateError}>{item.dateError}</p>
                        )}
                      </div>

                      {hasValidDate && (
                        item.isFounderPromo ? (
                          <div style={cs.promoBreakdown}>
                            <div style={cs.promoRow}>
                              <div>
                                <p style={cs.promoTag}>🎉 Founder Promo</p>
                                <p style={cs.promoDelivery}>Delivers {formatDate(item.deliveryDate)}</p>
                                <p style={cs.promoWindow}>{describeTime(item.deliveryDate)} from today</p>
                              </div>
                              <span style={cs.promoFree}>FREE</span>
                            </div>
                          </div>
                        ) : (
                          <div style={cs.priceBreakdown}>
                            <div style={cs.priceRow}>
                              <span style={cs.priceLabel}>Delivery</span>
                              <span style={cs.priceValue}>{formatDate(item.deliveryDate)}</span>
                            </div>
                            <div style={cs.priceRow}>
                              <span style={cs.priceLabel}>Storage</span>
                              <span style={cs.priceValue}>{describeTime(item.deliveryDate)}</span>
                            </div>
                            <div style={cs.priceRow}>
                              <span style={cs.priceLabel}>Rate</span>
                              <span style={cs.priceValue}>$1.85/year</span>
                            </div>
                            <div style={{ ...cs.priceRow, borderTop: `1px solid ${BLUSH}`, paddingTop: 10, marginTop: 4 }}>
                              <span style={{ ...cs.priceLabel, fontWeight: 700, color: CHARCOAL }}>
                                {item.years} yr &times; $1.85
                              </span>
                              <span style={cs.itemPrice}>${item.price.toFixed(2)}</span>
                            </div>
                          </div>
                        )
                      )}

                      {!item.deliveryDate && (
                        <p style={cs.dateMissing}>↑ Select a delivery date to see pricing</p>
                      )}
                    </div>
                  )
                })}
              </div>

              <div style={cs.summary}>
                <div style={cs.summaryHeader}>
                  <span style={cs.summaryCount}>{cart.length} capsule{cart.length !== 1 ? 's' : ''}</span>
                  {allDatesSet ? (
                    <span style={cs.summaryTotal}>
                      {total === 0 ? 'FREE' : `$${total.toFixed(2)}`}
                    </span>
                  ) : (
                    <span style={cs.summaryPending}>Set all dates to see total</span>
                  )}
                </div>
                {allDatesSet && (
                  <p style={cs.summaryBreakdown}>
                    {cart.map((item, i) => (
                      <span key={item.capsuleId}>
                        {item.isFounderPromo ? 'Founder Promo' : `${item.years}yr × $1.85`}
                        {i < cart.length - 1 ? ' + ' : ''}
                      </span>
                    ))}
                    {' = '}
                    <strong>{total === 0 ? 'FREE' : `$${total.toFixed(2)}`}</strong>
                  </p>
                )}
              </div>

              {!allDatesSet && (
                <p style={cs.allDatesHint}>🔒 Set a delivery date for each capsule above before checking out.</p>
              )}

              <div style={cs.actions}>
                <button
                  onClick={handleCheckout}
                  disabled={!allDatesSet || checkingOut}
                  style={{
                    ...cs.checkoutBtn,
                    opacity: allDatesSet && !checkingOut ? 1 : 0.45,
                    cursor: allDatesSet && !checkingOut ? 'pointer' : 'not-allowed',
                  }}
                >
                  {checkingOut
                    ? (allPromo ? 'Sealing your capsule…' : 'Redirecting to payment…')
                    : !allDatesSet
                      ? 'Set all delivery dates to continue'
                      : allPromo
                        ? 'Seal for Free →'
                        : `Pay $${total.toFixed(2)} →`}
                </button>
                <button onClick={() => router.push('/dashboard')} style={cs.continueBtn}>
                  + Add more capsules
                </button>
              </div>

              {allPromo
                ? <p style={cs.promoNote}>🎉 No payment required — Founder Promotion applies</p>
                : <p style={cs.secureNote}>🔒 Secure checkout powered by Stripe</p>
              }
            </>
          )}
        </div>
      </div>

      <SiteFooter />
    </>
  )
}

const cs = {
  page: { minHeight: 'calc(100vh - 64px)', backgroundColor: CREAM },
  body: { maxWidth: 620, margin: '0 auto', padding: '32px 16px 80px' },
  pageTitle: {
    fontFamily: F.serif, fontSize: 32, fontWeight: 700,
    color: CHARCOAL, margin: '0 0 20px',
  },

  promoBanner: {
    display: 'flex', alignItems: 'flex-start', gap: 12,
    backgroundColor: '#fff', border: `1px solid ${BLUSH}`,
    borderLeft: `4px solid ${WINE}`, borderRadius: 10,
    padding: '14px 16px', marginBottom: 20,
  },
  promoBannerIcon: { fontSize: 18, flexShrink: 0 },
  promoBannerText: { fontFamily: F.sans, fontSize: 14, color: CHARCOAL, lineHeight: 1.6, margin: 0 },

  emptyCart: {
    backgroundColor: '#fff', border: `2px dashed ${BLUSH}`,
    borderRadius: 12, padding: '48px 24px', textAlign: 'center',
  },
  emptyIcon: { fontSize: 40, margin: '0 0 14px' },
  emptyHeadline: {
    fontFamily: F.serif, fontSize: 20, fontWeight: 700,
    color: CHARCOAL, margin: '0 0 10px',
  },
  emptyBody: {
    fontFamily: F.sans, fontSize: 14, color: '#888',
    margin: '0 auto 28px', lineHeight: 1.6, maxWidth: 340,
  },
  dashBtn: {
    padding: '12px 28px', backgroundColor: WINE, color: '#fff',
    border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, fontFamily: F.sans,
  },

  errorBox: {
    backgroundColor: '#fdf2f2', border: '1px solid #fecaca',
    color: '#991b1b', padding: '14px 16px', borderRadius: 8,
    marginBottom: 20, fontSize: 14, fontFamily: F.sans,
  },

  itemList: { display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 },
  cartItem: {
    backgroundColor: '#fff', border: `1px solid ${BLUSH}`,
    borderLeft: `4px solid ${WINE}`, borderRadius: 12, padding: 20,
    boxShadow: '0 2px 10px rgba(149,35,35,0.06)',
  },
  itemHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', gap: 12, marginBottom: 16,
  },
  itemTitle: {
    fontFamily: F.serif, fontSize: 16, fontWeight: 700,
    color: CHARCOAL, margin: 0, wordBreak: 'break-word', flex: 1, lineHeight: 1.4,
  },
  removeBtn: {
    padding: '5px 12px', backgroundColor: 'transparent', color: '#dc2626',
    border: '1px solid #fecaca', borderRadius: 6, fontSize: 12,
    fontFamily: F.sans, whiteSpace: 'nowrap', flexShrink: 0,
  },

  dateSection: { marginBottom: 12 },
  dateLabel: {
    display: 'block', fontFamily: F.sans, fontSize: 11, fontWeight: 700,
    color: '#666', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px',
  },
  dateInputEmpty: {
    width: '100%', padding: '10px 12px',
    border: `1.5px dashed ${BLUSH}`, borderRadius: 8,
    fontSize: 14, fontFamily: F.sans, boxSizing: 'border-box', backgroundColor: '#fdfbfa',
  },
  dateInputValid: {
    width: '100%', padding: '10px 12px',
    border: '1.5px solid #10b981', borderRadius: 8,
    fontSize: 14, fontFamily: F.sans, boxSizing: 'border-box', backgroundColor: '#f0fdf4',
  },
  dateInputError: {
    width: '100%', padding: '10px 12px',
    border: '1.5px solid #dc2626', borderRadius: 8,
    fontSize: 14, fontFamily: F.sans, boxSizing: 'border-box', backgroundColor: '#fef2f2',
  },
  dateError: { fontFamily: F.sans, fontSize: 12, color: '#dc2626', margin: '6px 0 0' },

  // Founder promo breakdown
  promoBreakdown: {
    backgroundColor: `${BLUSH}30`, border: `1px solid ${BLUSH}`,
    borderRadius: 8, padding: '12px 14px', marginTop: 4,
  },
  promoRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
  },
  promoTag: {
    fontFamily: F.sans, fontSize: 13, fontWeight: 700, color: WINE,
    margin: '0 0 4px',
  },
  promoDelivery: { fontFamily: F.sans, fontSize: 12, color: CHARCOAL, margin: '0 0 2px' },
  promoWindow: { fontFamily: F.sans, fontSize: 11, color: '#888', margin: 0 },
  promoFree: {
    fontFamily: F.sans, fontSize: 22, fontWeight: 700, color: WINE,
    flexShrink: 0,
  },

  // Standard price breakdown
  priceBreakdown: {
    backgroundColor: '#fdfbfa', border: `1px solid ${BLUSH}`,
    borderRadius: 8, padding: '12px 14px', marginTop: 4,
  },
  priceRow: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', paddingBottom: 6, marginBottom: 6,
  },
  priceLabel: { fontFamily: F.sans, fontSize: 12, color: '#777' },
  priceValue: { fontFamily: F.sans, fontSize: 12, color: CHARCOAL, fontWeight: 700 },
  itemPrice: { fontFamily: F.sans, fontSize: 18, fontWeight: 700, color: WINE },
  dateMissing: { fontFamily: F.sans, fontSize: 12, color: '#aaa', margin: '4px 0 0', fontStyle: 'italic' },

  summary: {
    backgroundColor: '#fff', border: `1px solid ${BLUSH}`,
    borderRadius: 12, padding: '18px 20px', marginBottom: 14,
  },
  summaryHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  summaryCount: { fontFamily: F.sans, fontSize: 14, color: '#888' },
  summaryTotal: { fontFamily: F.sans, fontSize: 26, fontWeight: 700, color: WINE },
  summaryPending: { fontFamily: F.sans, fontSize: 13, color: '#aaa', fontStyle: 'italic' },
  summaryBreakdown: { fontFamily: F.sans, fontSize: 13, color: '#888', margin: 0 },

  allDatesHint: {
    fontFamily: F.sans, fontSize: 13, color: '#888',
    textAlign: 'center', margin: '0 0 16px',
  },

  actions: { display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 },
  checkoutBtn: {
    width: '100%', padding: 16, backgroundColor: WINE, color: '#fff',
    border: 'none', borderRadius: 10, fontSize: 17, fontWeight: 600, fontFamily: F.sans,
  },
  continueBtn: {
    width: '100%', padding: 14, backgroundColor: '#fff', color: '#666',
    border: `1px solid ${BLUSH}`, borderRadius: 10, fontSize: 15,
    fontWeight: 600, fontFamily: F.sans,
  },
  secureNote: {
    textAlign: 'center', fontFamily: F.sans, fontSize: 12, color: '#aaa', margin: 0,
  },
  promoNote: {
    textAlign: 'center', fontFamily: F.sans, fontSize: 12, color: WINE,
    fontWeight: 600, margin: 0,
  },
}
