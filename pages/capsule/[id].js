import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { supabase } from '../../lib/supabase'
import { loadCart, saveCart } from '../../lib/cart'
import SiteNav from '../../components/SiteNav'
import SiteFooter from '../../components/SiteFooter'

const MAROON = '#4D0000'
const WINE = '#8A2323'
const CREAM = '#FFFBF5'
const BORDER = 'rgba(77, 0, 0, 0.15)'
const INK = '#3A2418'
const MUTED = '#7A6A5A'
const F = { serif: "'Playfair Display','Georgia',serif", sans: "'Inter',Arial,sans-serif" }

export default function CapsuleDetail() {
  const router = useRouter()
  const { id } = router.query
  const [capsule, setCapsule] = useState(null)
  const [isRecipientView, setIsRecipientView] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cart, setCart] = useState([])

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) { router.push('/'); return }
        if (!id) return

        // Try as owner first
        const { data: ownerData, error: ownerError } = await supabase
          .from('capsules').select('*').eq('id', id).eq('user_id', user.id)

        if (!ownerError && ownerData && ownerData.length > 0) {
          setCapsule(ownerData[0])
          setIsRecipientView(false)
          setLoading(false)
          return
        }

        // Try as gift recipient (requires RLS policy: is_gift=true AND gift_recipient_email=auth email)
        const { data: giftData, error: giftError } = await supabase
          .from('capsules').select('*')
          .eq('id', id)
          .eq('is_gift', true)
          .eq('gift_recipient_email', user.email)

        if (!giftError && giftData && giftData.length > 0) {
          setCapsule(giftData[0])
          setIsRecipientView(true)
          setLoading(false)
          return
        }

        setError('Capsule not found.')
        setLoading(false)
      } catch (err) {
        setError(`An error occurred: ${err.message}`)
        setLoading(false)
      }
    }
    init()
  }, [router, id])

  useEffect(() => { setCart(loadCart()) }, [])

  const formatDate = (ds) =>
    new Date(ds).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  const addToCart = () => {
    if (!capsule) return
    const newItem = {
      capsuleId: capsule.id,
      title: capsule.title,
      isGift: capsule.is_gift || false,
      giftFromName: capsule.gift_from_name || null,
      giftRecipientEmail: capsule.gift_recipient_email || null,
      deliveryDate: '',
      years: null,
      price: null,
      isFounderPromo: false,
      dateError: null,
    }
    const currentCart = loadCart()
    const newCart = [...currentCart.filter(x => x.capsuleId !== capsule.id), newItem]
    saveCart(newCart)
    setCart(newCart)
    router.push('/cart')
  }

  const inCart = capsule && cart.some(x => x.capsuleId === capsule.id)
  const isDraft = capsule?.status === 'draft'

  const statusColor = (status) => {
    if (status === 'draft') return { bg: 'rgba(77,0,0,0.08)', text: WINE }
    if (status === 'sealed') return { bg: '#e8f0f7', text: '#1a4a7a' }
    if (status === 'delivered') return { bg: '#d1fae5', text: '#065f46' }
    return { bg: '#eee', text: '#555' }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: CREAM }}>
        <p style={{ fontFamily: F.sans, fontSize: 16, color: MUTED }}>Loading…</p>
      </div>
    )
  }

  if (error || !capsule) {
    return (
      <>
        <SiteNav />
        <div style={{ minHeight: 'calc(100vh - 64px)', backgroundColor: CREAM, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: F.serif, fontSize: 20, color: INK, marginBottom: 16 }}>
              {error || 'Capsule not found'}
            </p>
            <button onClick={() => router.push('/dashboard')} style={{ padding: '10px 24px', backgroundColor: WINE, color: CREAM, border: 'none', borderRadius: 8, fontSize: 14, fontFamily: F.sans, cursor: 'pointer' }}>
              Back to dashboard
            </button>
          </div>
        </div>
        <SiteFooter />
      </>
    )
  }

  const sc = statusColor(capsule.status)
  const isGift = capsule.is_gift || false

  return (
    <>
      <Head>
        <title>{capsule.title} — The Letter</title>
      </Head>

      <SiteNav />

      <div style={st.page}>
        <div style={st.content}>

          {/* Gift banner for recipient */}
          {isGift && isRecipientView && (
            <div style={st.giftBanner}>
              <span style={st.giftBannerIcon}>🎁</span>
              <div>
                <p style={st.giftBannerFrom}>A message from <strong>{capsule.gift_from_name}</strong></p>
                <p style={st.giftBannerSub}>This time capsule was written for you.</p>
              </div>
            </div>
          )}

          {/* Header */}
          <div style={st.header}>
            <div style={st.meta}>
              <span style={{ ...st.statusBadge, backgroundColor: sc.bg, color: sc.text }}>
                {capsule.status.charAt(0).toUpperCase() + capsule.status.slice(1)}
              </span>
              {isGift && !isRecipientView && (
                <span style={st.giftBadge}>🎁 Gift</span>
              )}
              {capsule.status !== 'draft' && capsule.deliver_at && (
                <span style={st.deliveryDate}>
                  {capsule.status === 'delivered' ? 'Delivered' : 'Opens'} {formatDate(capsule.deliver_at)}
                </span>
              )}
            </div>
            <h1 style={st.title}>{capsule.title}</h1>
            {isGift && isRecipientView ? (
              <p style={st.created}>From {capsule.gift_from_name}</p>
            ) : (
              <p style={st.created}>Created {formatDate(capsule.created_at)}</p>
            )}

            {/* Gift info for the gifter */}
            {isGift && !isRecipientView && (
              <div style={st.giftInfoBox}>
                <p style={st.giftInfoLine}>🎁 Gifted to <strong>{capsule.gift_recipient_email}</strong></p>
                <p style={st.giftInfoLine}>From name shown to recipient: <strong>{capsule.gift_from_name}</strong></p>
              </div>
            )}
          </div>

          {/* Message */}
          <div style={st.section}>
            <h2 style={st.sectionTitle}>{isGift && isRecipientView ? 'Your message' : 'Message'}</h2>
            <div style={st.messageBox}>
              <p style={st.messageText}>{capsule.message}</p>
            </div>
          </div>

          {/* Snapshot */}
          {(capsule.age || capsule.city || capsule.favorite_song || capsule.favorite_show ||
            capsule.future_vision || (capsule.personality_words && capsule.personality_words.length > 0)) && (
            <div style={st.section}>
              <h2 style={st.sectionTitle}>Snapshot</h2>
              <div style={st.snapshotGrid}>
                {capsule.age && <div style={st.snapshotItem}><p style={st.snapshotLabel}>Age</p><p style={st.snapshotValue}>{capsule.age}</p></div>}
                {capsule.city && <div style={st.snapshotItem}><p style={st.snapshotLabel}>City</p><p style={st.snapshotValue}>{capsule.city}</p></div>}
                {capsule.favorite_song && <div style={st.snapshotItem}><p style={st.snapshotLabel}>Favorite song</p><p style={st.snapshotValue}>{capsule.favorite_song}</p></div>}
                {capsule.favorite_show && <div style={st.snapshotItem}><p style={st.snapshotLabel}>Favorite show</p><p style={st.snapshotValue}>{capsule.favorite_show}</p></div>}
                {capsule.personality_words?.length > 0 && (
                  <div style={st.snapshotItem}><p style={st.snapshotLabel}>Personality</p><p style={st.snapshotValue}>{capsule.personality_words.join(', ')}</p></div>
                )}
              </div>
              {capsule.future_vision && (
                <div style={st.visionBox}>
                  <p style={st.visionLabel}>Future vision</p>
                  <p style={st.visionText}>{capsule.future_vision}</p>
                </div>
              )}
            </div>
          )}

          {/* Actions — only for owner on draft */}
          {isDraft && !isRecipientView && (
            <div style={st.actions}>
              {inCart ? (
                <button onClick={() => router.push('/cart')} style={st.viewCartBtn}>
                  In cart — View cart →
                </button>
              ) : (
                <button onClick={addToCart} style={st.sealBtn}>
                  Seal &amp; Pay
                </button>
              )}
              <button onClick={() => router.push('/dashboard')} style={st.backBtn}>
                ← Back to dashboard
              </button>
            </div>
          )}

          {(!isDraft || isRecipientView) && (
            <div style={{ marginBottom: 40 }}>
              <button onClick={() => router.push('/dashboard')} style={st.backBtn}>
                ← Back to dashboard
              </button>
            </div>
          )}

        </div>
      </div>

      <SiteFooter />
    </>
  )
}

const st = {
  page: { minHeight: 'calc(100vh - 64px)', backgroundColor: CREAM },
  content: { maxWidth: 760, margin: '0 auto', padding: '32px 16px 80px' },

  giftBanner: {
    display: 'flex', alignItems: 'flex-start', gap: 16,
    backgroundColor: 'rgba(138,35,35,0.06)', border: `1.5px solid ${WINE}`,
    borderRadius: 10, padding: '20px 24px', marginBottom: 20,
  },
  giftBannerIcon: { fontSize: 28, flexShrink: 0 },
  giftBannerFrom: { fontFamily: F.sans, fontSize: 16, color: INK, margin: '0 0 4px' },
  giftBannerSub: { fontFamily: F.sans, fontSize: 13, color: MUTED, margin: 0 },

  header: {
    backgroundColor: CREAM, border: `1px solid ${BORDER}`,
    borderRadius: 10, padding: '28px 28px 24px', marginBottom: 20,
  },
  meta: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' },
  statusBadge: {
    fontFamily: F.sans, fontSize: 11, fontWeight: 700,
    padding: '3px 12px', borderRadius: 20,
    textTransform: 'uppercase', letterSpacing: '0.5px',
  },
  giftBadge: {
    fontFamily: F.sans, fontSize: 11, fontWeight: 700,
    color: '#92400e', backgroundColor: '#fdf4e7',
    padding: '3px 10px', borderRadius: 20,
  },
  deliveryDate: { fontFamily: F.sans, fontSize: 13, color: MUTED },
  title: {
    fontFamily: F.serif, fontSize: 28, fontWeight: 600,
    color: MAROON, margin: '0 0 8px', lineHeight: 1.3, wordBreak: 'break-word',
  },
  created: { fontFamily: F.sans, fontSize: 13, color: MUTED, margin: '0 0 0' },

  giftInfoBox: {
    marginTop: 14, padding: '12px 16px',
    backgroundColor: 'rgba(77,0,0,0.04)', border: `1px solid ${BORDER}`,
    borderRadius: 8,
  },
  giftInfoLine: { fontFamily: F.sans, fontSize: 13, color: MUTED, margin: '0 0 4px' },

  section: {
    backgroundColor: CREAM, border: `1px solid ${BORDER}`,
    borderRadius: 10, padding: '24px 28px', marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: F.serif, fontSize: 18, fontWeight: 600,
    color: MAROON, marginBottom: 16,
  },
  messageBox: { borderLeft: `3px solid ${BORDER}`, paddingLeft: 16 },
  messageText: {
    fontFamily: F.serif, fontSize: 16, color: INK,
    lineHeight: 1.85, margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
  },

  snapshotGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 14, marginBottom: 16,
  },
  snapshotItem: {
    backgroundColor: CREAM, border: `1px solid ${BORDER}`,
    borderRadius: 8, padding: '12px 14px',
  },
  snapshotLabel: { fontFamily: F.sans, fontSize: 10, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 6px' },
  snapshotValue: { fontFamily: F.sans, fontSize: 15, color: INK, margin: 0, fontWeight: 600 },
  visionBox: {
    backgroundColor: CREAM, border: `1px solid ${BORDER}`,
    borderRadius: 8, padding: '16px 18px',
  },
  visionLabel: { fontFamily: F.sans, fontSize: 11, fontWeight: 700, color: WINE, textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 8px' },
  visionText: { fontFamily: F.serif, fontSize: 15, color: INK, lineHeight: 1.8, margin: 0, whiteSpace: 'pre-wrap' },

  actions: { display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 40 },
  sealBtn: {
    width: '100%', padding: 18, backgroundColor: WINE, color: CREAM,
    border: 'none', borderRadius: 8, fontSize: 17, fontWeight: 600, fontFamily: F.sans, cursor: 'pointer',
  },
  viewCartBtn: {
    width: '100%', padding: 16, backgroundColor: 'transparent', color: WINE,
    border: `2px solid ${WINE}`, borderRadius: 8, fontSize: 16, fontWeight: 600, fontFamily: F.sans, cursor: 'pointer',
  },
  backBtn: {
    width: '100%', padding: 14, backgroundColor: CREAM, color: MUTED,
    border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 14, fontFamily: F.sans, cursor: 'pointer',
  },
}
