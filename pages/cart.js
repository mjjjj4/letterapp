import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import { loadCart, saveCart } from '../lib/cart'

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
      if (!user) { router.push('/login'); return }
      setUser(user)
      setCart(loadCart())
      setLoading(false)
    }
    init()
  }, [router])

  useEffect(() => { saveCart(cart) }, [cart])

  const removeItem = (capsuleId) => setCart(prev => prev.filter(x => x.capsuleId !== capsuleId))

  const total = +(cart.reduce((sum, item) => sum + item.price, 0)).toFixed(2)

  const handleCheckout = async () => {
    if (cart.length === 0 || !user) return
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

      // Persist cart for success page before leaving
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
        <span style={cs.navBrand}>The Letter</span>
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
              {cart.map(item => (
                <div key={item.capsuleId} style={cs.cartItem}>
                  <div style={cs.itemMain}>
                    <h3 style={cs.itemTitle}>{item.title}</h3>
                    <p style={cs.itemDate}>Delivers {formatDate(item.deliveryDate)}</p>
                    <p style={cs.itemYears}>
                      {item.years} year{item.years !== 1 ? 's' : ''} &times; $1.85/year
                    </p>
                  </div>
                  <div style={cs.itemRight}>
                    <p style={cs.itemPrice}>${item.price.toFixed(2)}</p>
                    <button onClick={() => removeItem(item.capsuleId)} style={cs.removeBtn}>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div style={cs.summary}>
              <div style={cs.summaryHeader}>
                <span style={cs.summaryCount}>
                  {cart.length} capsule{cart.length !== 1 ? 's' : ''} in cart
                </span>
                <span style={cs.summaryTotal}>${total.toFixed(2)}</span>
              </div>
              <p style={cs.summaryBreakdown}>
                {cart.map((item, i) => (
                  <span key={item.capsuleId} style={cs.breakdownItem}>
                    {item.years}yr &times; $1.85{i < cart.length - 1 ? ' + ' : ''}
                  </span>
                ))}
                {' = '}
                <strong>${total.toFixed(2)}</strong>
              </p>
            </div>

            <div style={cs.actions}>
              <button
                onClick={handleCheckout}
                disabled={checkingOut}
                style={{ ...cs.checkoutBtn, opacity: checkingOut ? 0.7 : 1 }}
              >
                {checkingOut ? 'Redirecting to payment...' : `Pay $${total.toFixed(2)} →`}
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
  navBrand: { fontSize: '20px', fontWeight: 'bold', color: '#fff', letterSpacing: '0.5px' },
  backBtn: { padding: '8px 16px', backgroundColor: 'transparent', color: '#aaa', border: '1px solid #444', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontFamily: 'Arial,sans-serif' },

  body: { maxWidth: '600px', margin: '0 auto', padding: '32px 16px 60px' },
  pageTitle: { fontSize: '28px', fontWeight: 'bold', color: '#1a1a1a', margin: '0 0 24px', fontFamily: 'Arial,sans-serif' },

  emptyCart: { backgroundColor: '#fff', border: '2px dashed #ddd', borderRadius: '12px', padding: '48px 24px', textAlign: 'center' },
  emptyIcon: { fontSize: '40px', margin: '0 0 14px' },
  emptyHeadline: { fontSize: '20px', fontWeight: 'bold', color: '#333', margin: '0 0 10px', fontFamily: 'Arial,sans-serif' },
  emptyBody: { fontSize: '14px', color: '#888', margin: '0 auto 28px', lineHeight: '1.6', fontFamily: 'Arial,sans-serif', maxWidth: '340px' },
  dashBtn: { padding: '12px 28px', backgroundColor: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Arial,sans-serif' },

  errorBox: { backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '14px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', fontFamily: 'Arial,sans-serif' },

  itemList: { display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' },
  cartItem: { backgroundColor: '#fff', border: '1px solid #e8e8e8', borderLeft: '4px solid #f59e0b', borderRadius: '12px', padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' },
  itemMain: { flex: 1 },
  itemTitle: { fontSize: '16px', fontWeight: 'bold', color: '#1a1a1a', margin: '0 0 6px', wordBreak: 'break-word' },
  itemDate: { fontSize: '13px', color: '#555', margin: '0 0 4px', fontFamily: 'Arial,sans-serif' },
  itemYears: { fontSize: '12px', color: '#888', margin: 0, fontFamily: 'Arial,sans-serif' },
  itemRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', flexShrink: 0 },
  itemPrice: { fontSize: '20px', fontWeight: 'bold', color: '#1a1a1a', margin: 0, fontFamily: 'Arial,sans-serif' },
  removeBtn: { padding: '5px 12px', backgroundColor: 'transparent', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontFamily: 'Arial,sans-serif', whiteSpace: 'nowrap' },

  summary: { backgroundColor: '#fff', border: '1px solid #e8e8e8', borderRadius: '12px', padding: '20px', marginBottom: '20px' },
  summaryHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  summaryCount: { fontSize: '14px', color: '#555', fontFamily: 'Arial,sans-serif' },
  summaryTotal: { fontSize: '28px', fontWeight: 'bold', color: '#1a1a1a', fontFamily: 'Arial,sans-serif' },
  summaryBreakdown: { fontSize: '13px', color: '#888', margin: 0, fontFamily: 'Arial,sans-serif' },
  breakdownItem: {},

  actions: { display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' },
  checkoutBtn: { width: '100%', padding: '16px', backgroundColor: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '17px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Arial,sans-serif' },
  continueBtn: { width: '100%', padding: '14px', backgroundColor: '#fff', color: '#555', border: '1px solid #ddd', borderRadius: '10px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Arial,sans-serif' },
  secureNote: { textAlign: 'center', fontSize: '12px', color: '#aaa', margin: 0, fontFamily: 'Arial,sans-serif' },
}
