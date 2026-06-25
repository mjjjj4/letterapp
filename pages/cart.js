import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import { calcPrice, describeTime, getMinDate, loadCart, saveCart } from '../lib/cart'

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
    const pricing = calcPrice(dateStr)
    setCart(prev => {
      const updated = prev.map(item => {
        if (item.capsuleId !== capsuleId) return item
        return {
          ...item,
          deliveryDate: dateStr,
          years: pricing ? pricing.years : null,
          price: pricing ? pricing.price : null,
        }
      })
      saveCart(updated)
      return updated
    })
  }

  const allDatesSet = cart.length > 0 && cart.every(item => item.deliveryDate && item.price)
  const total = +(cart.reduce((sum, item) => sum + (item.price || 0), 0)).toFixed(2)

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

      if (!response.ok) {
        setError(data.error || 'Failed to create checkout session')
        setCheckingOut(false)
        return
      }

      try {
        localStorage.setItem('pendingOrder', JSON.stringify({
          cartItems: cart,
          total,
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

  if (loading) return <div style={cs.loadingScreen}><p style={cs.loadingText}>Loading...</p></div>

  return (
    <div style={cs.page}>
      <nav style={cs.nav}>
        <span style={cs.navBrand} onClick={() => router.push('/dashboard')}>The Letter</span>
        <button onClick={() => router.push('/dashboard')} style={cs.backBtn}>
          ← Dashboard
        </button>
      </nav>

      <div style={cs.body}>
        <h1 style={cs.pageTitle}>Your cart</h1>

        {cart.length === 0 ? (
          <div style={cs.emptyCart}>
            <p style={cs.emptyIcon}>&#128722;</p>
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
            {error && <div style={cs.errorBox}>{error}</div>}

            <div style={cs.itemList}>
              {cart.map(item => {
                const pricing = item.deliveryDate ? calcPrice(item.deliveryDate) : null
                const hasValidDate = !!(item.deliveryDate && pricing)

                return (
                  <div key={item.capsuleId} style={cs.cartItem}>
                    {/* Item header */}
                    <div style={cs.itemHeader}>
                      <h3 style={cs.itemTitle}>{item.title}</h3>
                      <button onClick={() => removeItem(item.capsuleId)} style={cs.removeBtn}>
                        Remove
                      </button>
                    </div>

                    {/* Delivery date picker */}
                    <div style={cs.dateSection}>
                      <label style={cs.dateLabel}>When should this be delivered?</label>
                      <input
                        type="date"
                        min={getMinDate()}
                        value={item.deliveryDate || ''}
                        onChange={e => updateDate(item.capsuleId, e.target.value)}
                        style={hasValidDate ? cs.dateInputValid : cs.dateInputEmpty}
                      />
                      {item.deliveryDate && !pricing && (
                        <p style={cs.dateError}>Please select a date at least 1 month in the future.</p>
                      )}
                    </div>

                    {/* Price breakdown — only when date is valid */}
                    {hasValidDate && (
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
                        <div style={{ ...cs.priceRow, borderTop: '1px solid #e8e8e8', paddingTop: '10px', marginTop: '4px' }}>
                          <span style={{ ...cs.priceLabel, fontWeight: 'bold', color: '#1a1a1a' }}>
                            {pricing.years} yr &times; $1.85
                          </span>
                          <span style={cs.itemPrice}>${pricing.price.toFixed(2)}</span>
                        </div>
                      </div>
                    )}

                    {/* Nudge when no date */}
                    {!item.deliveryDate && (
                      <p style={cs.dateMissing}>&#8593; Select a delivery date to see pricing</p>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Summary + checkout */}
            <div style={cs.summary}>
              <div style={cs.summaryHeader}>
                <span style={cs.summaryCount}>
                  {cart.length} capsule{cart.length !== 1 ? 's' : ''}
                </span>
                {allDatesSet ? (
                  <span style={cs.summaryTotal}>${total.toFixed(2)}</span>
                ) : (
                  <span style={cs.summaryPending}>Set all dates to see total</span>
                )}
              </div>
              {allDatesSet && (
                <p style={cs.summaryBreakdown}>
                  {cart.map((item, i) => (
                    <span key={item.capsuleId}>
                      {item.years}yr &times; $1.85{i < cart.length - 1 ? ' + ' : ''}
                    </span>
                  ))}
                  {' = '}<strong>${total.toFixed(2)}</strong>
                </p>
              )}
            </div>

            {!allDatesSet && (
              <p style={cs.allDatesHint}>
                &#128274; Set a delivery date for each capsule above before checking out.
              </p>
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
                  ? 'Redirecting to payment...'
                  : allDatesSet
                    ? `Pay $${total.toFixed(2)} →`
                    : 'Set all delivery dates to continue'}
              </button>
              <button onClick={() => router.push('/dashboard')} style={cs.continueBtn}>
                + Add more capsules
              </button>
            </div>

            <p style={cs.secureNote}>&#128274; Secure checkout powered by Stripe</p>
          </>
        )}
      </div>
    </div>
  )
}

const cs = {
  page: { minHeight: '100vh', backgroundColor: '#f7f7f5', fontFamily: "'Georgia','Times New Roman',serif" },
  loadingScreen: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontSize: '16px', color: '#888', fontFamily: 'Arial,sans-serif' },

  nav: { backgroundColor: '#1a1a1a', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  navBrand: { fontSize: '20px', fontWeight: 'bold', color: '#fff', letterSpacing: '0.5px', cursor: 'pointer' },
  backBtn: { padding: '8px 16px', backgroundColor: 'transparent', color: '#aaa', border: '1px solid #444', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontFamily: 'Arial,sans-serif' },

  body: { maxWidth: '600px', margin: '0 auto', padding: '32px 16px 60px' },
  pageTitle: { fontSize: '28px', fontWeight: 'bold', color: '#1a1a1a', margin: '0 0 24px', fontFamily: 'Arial,sans-serif' },

  emptyCart: { backgroundColor: '#fff', border: '2px dashed #ddd', borderRadius: '12px', padding: '48px 24px', textAlign: 'center' },
  emptyIcon: { fontSize: '40px', margin: '0 0 14px' },
  emptyHeadline: { fontSize: '20px', fontWeight: 'bold', color: '#333', margin: '0 0 10px', fontFamily: 'Arial,sans-serif' },
  emptyBody: { fontSize: '14px', color: '#888', margin: '0 auto 28px', lineHeight: '1.6', fontFamily: 'Arial,sans-serif', maxWidth: '340px' },
  dashBtn: { padding: '12px 28px', backgroundColor: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Arial,sans-serif' },

  errorBox: { backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '14px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', fontFamily: 'Arial,sans-serif' },

  itemList: { display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' },
  cartItem: { backgroundColor: '#fff', border: '1px solid #e8e8e8', borderLeft: '4px solid #f59e0b', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' },

  itemHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' },
  itemTitle: { fontSize: '16px', fontWeight: 'bold', color: '#1a1a1a', margin: 0, wordBreak: 'break-word', flex: 1, lineHeight: '1.4' },
  removeBtn: { padding: '5px 12px', backgroundColor: 'transparent', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontFamily: 'Arial,sans-serif', whiteSpace: 'nowrap', flexShrink: 0 },

  dateSection: { marginBottom: '12px' },
  dateLabel: { display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#555', marginBottom: '6px', fontFamily: 'Arial,sans-serif', textTransform: 'uppercase', letterSpacing: '0.5px' },
  dateInputEmpty: { width: '100%', padding: '10px 12px', border: '1.5px dashed #ddd', borderRadius: '8px', fontSize: '14px', fontFamily: 'Arial,sans-serif', boxSizing: 'border-box', backgroundColor: '#fafafa' },
  dateInputValid: { width: '100%', padding: '10px 12px', border: '1.5px solid #10b981', borderRadius: '8px', fontSize: '14px', fontFamily: 'Arial,sans-serif', boxSizing: 'border-box', backgroundColor: '#f0fdf4' },
  dateError: { fontSize: '12px', color: '#dc2626', margin: '6px 0 0', fontFamily: 'Arial,sans-serif' },

  priceBreakdown: { backgroundColor: '#f9f9f7', borderRadius: '8px', padding: '12px 14px', marginTop: '4px' },
  priceRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '6px', marginBottom: '6px' },
  priceLabel: { fontSize: '12px', color: '#777', fontFamily: 'Arial,sans-serif' },
  priceValue: { fontSize: '12px', color: '#333', fontFamily: 'Arial,sans-serif', fontWeight: 'bold' },
  itemPrice: { fontSize: '18px', fontWeight: 'bold', color: '#1a1a1a', fontFamily: 'Arial,sans-serif' },

  dateMissing: { fontSize: '12px', color: '#aaa', margin: '4px 0 0', fontFamily: 'Arial,sans-serif', fontStyle: 'italic' },

  summary: { backgroundColor: '#fff', border: '1px solid #e8e8e8', borderRadius: '12px', padding: '18px 20px', marginBottom: '14px' },
  summaryHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' },
  summaryCount: { fontSize: '14px', color: '#555', fontFamily: 'Arial,sans-serif' },
  summaryTotal: { fontSize: '26px', fontWeight: 'bold', color: '#1a1a1a', fontFamily: 'Arial,sans-serif' },
  summaryPending: { fontSize: '13px', color: '#aaa', fontFamily: 'Arial,sans-serif', fontStyle: 'italic' },
  summaryBreakdown: { fontSize: '13px', color: '#888', margin: 0, fontFamily: 'Arial,sans-serif' },

  allDatesHint: { fontSize: '13px', color: '#888', textAlign: 'center', margin: '0 0 16px', fontFamily: 'Arial,sans-serif' },

  actions: { display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' },
  checkoutBtn: { width: '100%', padding: '16px', backgroundColor: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '17px', fontWeight: 'bold', fontFamily: 'Arial,sans-serif' },
  continueBtn: { width: '100%', padding: '14px', backgroundColor: '#fff', color: '#555', border: '1px solid #ddd', borderRadius: '10px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Arial,sans-serif' },
  secureNote: { textAlign: 'center', fontSize: '12px', color: '#aaa', margin: 0, fontFamily: 'Arial,sans-serif' },
}
