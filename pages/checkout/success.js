import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import SiteNav from '../../components/SiteNav'
import SiteFooter from '../../components/SiteFooter'

const MAROON = '#4D0000'
const WINE = '#8A2323'
const CREAM = '#FFFBF5'
const BORDER = 'rgba(77, 0, 0, 0.15)'
const INK = '#3A2418'
const MUTED = '#7A6A5A'
const F = { serif: "'Playfair Display','Georgia',serif", sans: "'Inter',Arial,sans-serif" }

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

            {order && !order.isFounderPromo && order.total > 0 && (
              <div style={ss.donationBox}>
                <span style={ss.donationHeart}>💛</span>
                <p style={ss.donationText}>
                  Your purchase includes a{' '}
                  <strong style={{ color: '#92400e' }}>
                    ${+(order.total * 0.05).toFixed(2)}
                  </strong>{' '}
                  donation to the{' '}
                  <a
                    href="https://nationalpcf.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={ss.npcfLink}
                  >
                    National Pediatric Cancer Foundation
                  </a>
                  , funding research for safer childhood cancer treatments.
                </p>
              </div>
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
    backgroundColor: CREAM, borderRadius: 10,
    padding: '40px 32px', textAlign: 'center',
    border: `1px solid ${BORDER}`,
  },
  iconWrap: { fontSize: 48, marginBottom: 16 },
  title: {
    fontFamily: F.serif, fontSize: 28, fontWeight: 600,
    color: MAROON, margin: '0 0 12px',
  },
  subtitle: {
    fontFamily: F.sans, fontSize: 15, color: MUTED,
    lineHeight: 1.7, margin: '0 0 4px',
  },
  divider: { borderTop: `1px solid ${BORDER}`, margin: '24px 0' },
  sectionLabel: {
    fontFamily: F.sans, fontSize: 11, fontWeight: 700, color: MUTED,
    textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 14px', textAlign: 'left',
  },
  itemList: { display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 },
  item: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    backgroundColor: 'rgba(77,0,0,0.04)', borderRadius: 8, padding: '14px 16px', gap: 12,
  },
  itemLeft: { flex: 1, textAlign: 'left' },
  itemTitle: { fontFamily: F.sans, fontSize: 14, fontWeight: 700, color: INK, margin: '0 0 4px' },
  itemDate: { fontFamily: F.sans, fontSize: 12, color: MUTED, margin: '0 0 2px' },
  itemYears: { fontFamily: F.sans, fontSize: 11, color: MUTED, margin: 0 },
  itemPrice: { fontFamily: F.sans, fontSize: 16, fontWeight: 700, color: WINE, margin: 0, flexShrink: 0 },
  totalRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: 'rgba(77,0,0,0.06)', borderRadius: 8, padding: '14px 16px',
  },
  totalLabel: { fontFamily: F.sans, fontSize: 14, color: INK, fontWeight: 700 },
  totalAmount: { fontFamily: F.sans, fontSize: 22, fontWeight: 700, color: WINE },
  emailNote: {
    fontFamily: F.sans, fontSize: 13, color: MUTED, margin: '0 0 20px', lineHeight: 1.5,
  },
  donationBox: {
    display: 'flex', alignItems: 'flex-start', gap: 10,
    backgroundColor: '#fffbeb', borderRadius: 10, padding: '14px 16px',
    border: '1px solid #fde68a', margin: '16px 0 0', textAlign: 'left',
  },
  donationHeart: { fontSize: 16, flexShrink: 0, marginTop: 1 },
  donationText: {
    fontFamily: F.sans, fontSize: 13, color: MUTED, margin: 0, lineHeight: 1.6,
  },
  npcfLink: { color: WINE, fontWeight: 600, textDecoration: 'none' },
  dashBtn: {
    width: '100%', padding: 14, backgroundColor: WINE, color: CREAM,
    border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 600, fontFamily: F.sans,
  },
}
