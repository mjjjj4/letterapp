import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import SiteNav from '../../components/SiteNav'
import SiteFooter from '../../components/SiteFooter'

const WINE = '#952323'
const CREAM = '#FFE6E1'
const BLUSH = '#EDBFC6'
const CHARCOAL = '#393232'
const F = { serif: "'Lora','Georgia',serif", sans: "'Inter',Arial,sans-serif" }

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
    <>
      <Head>
        <title>Capsules Sealed — The Letter</title>
      </Head>

      <SiteNav />

      <div style={ss.page}>
        <div style={ss.body}>
          <div style={ss.card}>
            <div style={ss.iconWrap}>{order?.isFounderPromo ? '🎉' : '🔒'}</div>
            <h1 style={ss.title}>
              {order?.isFounderPromo ? 'Your capsule is sealed — free!' : 'Your capsules are sealed!'}
            </h1>
            <p style={ss.subtitle}>
              {order?.isFounderPromo
                ? "Sealed as a Founder member. It'll arrive in your inbox on the date you chose."
                : "They'll arrive in your inbox on the dates you chose. Don't peek — future you is looking forward to it."}
            </p>

            {order?.cartItems?.length > 0 && (
              <>
                <div style={ss.divider} />
                <p style={ss.sectionLabel}>What you sealed</p>
                <div style={ss.itemList}>
                  {order.cartItems.map(item => (
                    <div key={item.capsuleId} style={ss.item}>
                      <div style={ss.itemLeft}>
                        <p style={ss.itemTitle}>{item.title}</p>
                        <p style={ss.itemDate}>Delivers {formatDate(item.deliveryDate)}</p>
                        <p style={ss.itemYears}>
                          {item.isFounderPromo ? 'Founder Promotion' : `${item.years} year${item.years !== 1 ? 's' : ''} × $1.85/year`}
                        </p>
                      </div>
                      <p style={ss.itemPrice}>
                        {item.isFounderPromo ? 'FREE' : `$${(item.price || 0).toFixed(2)}`}
                      </p>
                    </div>
                  ))}
                </div>
                <div style={ss.totalRow}>
                  <span style={ss.totalLabel}>{order.isFounderPromo ? 'Total' : 'Total charged'}</span>
                  <span style={ss.totalAmount}>
                    {order.isFounderPromo ? 'FREE' : `$${(order.total || 0).toFixed(2)}`}
                  </span>
                </div>
              </>
            )}

            <div style={ss.divider} />
            <p style={ss.emailNote}>A confirmation email has been sent with your capsule details.</p>

            <button onClick={() => router.push('/dashboard')} style={ss.dashBtn}>
              Back to dashboard
            </button>
          </div>
        </div>
      </div>

      <SiteFooter />
    </>
  )
}

const ss = {
  page: { minHeight: 'calc(100vh - 64px)', backgroundColor: CREAM },
  body: { maxWidth: 560, margin: '0 auto', padding: '40px 16px 80px' },
  card: {
    backgroundColor: '#fff', borderRadius: 16,
    padding: '40px 32px', textAlign: 'center',
    boxShadow: '0 8px 40px rgba(149,35,35,0.08)',
    border: `1px solid ${BLUSH}`,
  },
  iconWrap: { fontSize: 48, marginBottom: 16 },
  title: {
    fontFamily: F.serif, fontSize: 28, fontWeight: 700,
    color: CHARCOAL, margin: '0 0 12px',
  },
  subtitle: {
    fontFamily: F.sans, fontSize: 15, color: '#666',
    lineHeight: 1.7, margin: '0 0 4px',
  },
  divider: { borderTop: `1px solid ${BLUSH}`, margin: '24px 0' },
  sectionLabel: {
    fontFamily: F.sans, fontSize: 11, fontWeight: 700, color: '#888',
    textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 14px', textAlign: 'left',
  },
  itemList: { display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 },
  item: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    backgroundColor: CREAM, borderRadius: 8, padding: '14px 16px', gap: 12,
  },
  itemLeft: { flex: 1, textAlign: 'left' },
  itemTitle: { fontFamily: F.sans, fontSize: 14, fontWeight: 700, color: CHARCOAL, margin: '0 0 4px' },
  itemDate: { fontFamily: F.sans, fontSize: 12, color: '#666', margin: '0 0 2px' },
  itemYears: { fontFamily: F.sans, fontSize: 11, color: '#aaa', margin: 0 },
  itemPrice: { fontFamily: F.sans, fontSize: 16, fontWeight: 700, color: WINE, margin: 0, flexShrink: 0 },
  totalRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: `${BLUSH}44`, borderRadius: 8, padding: '14px 16px',
  },
  totalLabel: { fontFamily: F.sans, fontSize: 14, color: CHARCOAL, fontWeight: 700 },
  totalAmount: { fontFamily: F.sans, fontSize: 22, fontWeight: 700, color: WINE },
  emailNote: {
    fontFamily: F.sans, fontSize: 13, color: '#888', margin: '0 0 20px', lineHeight: 1.5,
  },
  dashBtn: {
    width: '100%', padding: 14, backgroundColor: WINE, color: '#fff',
    border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 600, fontFamily: F.sans,
  },
}
