import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

export default function CheckoutSuccess() {
  const router = useRouter()
  const [order, setOrder] = useState(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('pendingOrder')
      if (stored) {
        setOrder(JSON.parse(stored))
        localStorage.removeItem('pendingOrder')
        localStorage.removeItem('letterCart')
      }
    } catch {}
  }, [])

  const formatDate = (ds) =>
    new Date(ds).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div style={ss.page}>
      <nav style={ss.nav}>
        <span style={ss.navBrand}>The Letter</span>
      </nav>

      <div style={ss.body}>
        <div style={ss.card}>
          <div style={ss.iconWrap}>&#128274;</div>
          <h1 style={ss.title}>Your capsules are sealed!</h1>
          <p style={ss.subtitle}>
            They&rsquo;ll arrive in your inbox on the dates you chose. Don&rsquo;t peek — future you is looking forward to it.
          </p>

          {order && order.cartItems && order.cartItems.length > 0 && (
            <>
              <div style={ss.divider} />
              <p style={ss.sectionLabel}>What you sealed</p>
              <div style={ss.itemList}>
                {order.cartItems.map(item => (
                  <div key={item.capsuleId} style={ss.item}>
                    <div style={ss.itemLeft}>
                      <p style={ss.itemTitle}>{item.title}</p>
                      <p style={ss.itemDate}>Delivers {formatDate(item.deliveryDate)}</p>
                      <p style={ss.itemYears}>{item.years} year{item.years !== 1 ? 's' : ''} &times; $1.85/year</p>
                    </div>
                    <p style={ss.itemPrice}>${item.price.toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <div style={ss.totalRow}>
                <span style={ss.totalLabel}>Total charged</span>
                <span style={ss.totalAmount}>${order.total.toFixed(2)}</span>
              </div>
            </>
          )}

          <div style={ss.divider} />

          <p style={ss.emailNote}>
            A confirmation email has been sent with your capsule details.
          </p>

          <button onClick={() => router.push('/dashboard')} style={ss.dashBtn}>
            Back to dashboard
          </button>
        </div>
      </div>
    </div>
  )
}

const ss = {
  page: { minHeight: '100vh', backgroundColor: '#f7f7f5', fontFamily: "'Georgia','Times New Roman',serif" },
  nav: { backgroundColor: '#1a1a1a', padding: '16px 20px' },
  navBrand: { fontSize: '20px', fontWeight: 'bold', color: '#fff', letterSpacing: '0.5px' },
  body: { maxWidth: '560px', margin: '0 auto', padding: '40px 16px 60px' },
  card: { backgroundColor: '#fff', borderRadius: '16px', padding: '36px 28px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', textAlign: 'center' },
  iconWrap: { fontSize: '48px', marginBottom: '16px' },
  title: { fontSize: '26px', fontWeight: 'bold', color: '#1a1a1a', margin: '0 0 12px', fontFamily: 'Arial,sans-serif' },
  subtitle: { fontSize: '15px', color: '#666', lineHeight: '1.7', margin: '0 0 4px', fontFamily: 'Arial,sans-serif' },
  divider: { borderTop: '1px solid #eee', margin: '24px 0' },
  sectionLabel: { fontSize: '12px', fontWeight: 'bold', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 14px', fontFamily: 'Arial,sans-serif', textAlign: 'left' },
  itemList: { display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' },
  item: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', backgroundColor: '#f9f9f7', borderRadius: '8px', padding: '14px 16px', gap: '12px' },
  itemLeft: { flex: 1, textAlign: 'left' },
  itemTitle: { fontSize: '14px', fontWeight: 'bold', color: '#1a1a1a', margin: '0 0 4px', fontFamily: 'Arial,sans-serif' },
  itemDate: { fontSize: '12px', color: '#555', margin: '0 0 2px', fontFamily: 'Arial,sans-serif' },
  itemYears: { fontSize: '11px', color: '#aaa', margin: 0, fontFamily: 'Arial,sans-serif' },
  itemPrice: { fontSize: '16px', fontWeight: 'bold', color: '#1a1a1a', margin: 0, fontFamily: 'Arial,sans-serif', flexShrink: 0 },
  totalRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f0fdf4', borderRadius: '8px', padding: '14px 16px' },
  totalLabel: { fontSize: '14px', color: '#166534', fontFamily: 'Arial,sans-serif', fontWeight: 'bold' },
  totalAmount: { fontSize: '22px', fontWeight: 'bold', color: '#065f46', fontFamily: 'Arial,sans-serif' },
  emailNote: { fontSize: '13px', color: '#888', margin: '0 0 20px', fontFamily: 'Arial,sans-serif', lineHeight: '1.5' },
  dashBtn: { width: '100%', padding: '14px', backgroundColor: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Arial,sans-serif' },
}
