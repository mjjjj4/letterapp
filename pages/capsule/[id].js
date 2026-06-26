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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cart, setCart] = useState([])

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) { router.push('/'); return }
        if (!id) return

        const { data: arr, error: capsuleError } = await supabase
          .from('capsules').select('*').eq('id', id).eq('user_id', user.id)

        if (capsuleError) setError(`Failed to load capsule: ${capsuleError.message}`)
        else if (!arr || arr.length === 0) setError('Capsule not found.')
        else setCapsule(arr[0])

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
    const newItem = { capsuleId: capsule.id, title: capsule.title, deliveryDate: '', years: null, price: null }
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
            <button onClick={() => router.push('/dashboard')} style={{ padding: '10px 24px', backgroundColor: WINE, color: CREAM, border: 'none', borderRadius: 8, fontSize: 14, fontFamily: F.sans }}>
              Back to dashboard
            </button>
          </div>
        </div>
        <SiteFooter />
      </>
    )
  }

  const sc = statusColor(capsule.status)

  return (
    <>
      <Head>
        <title>{capsule.title} — The Letter</title>
      </Head>

      <SiteNav />

      <div style={st.page}>
        <div style={st.content}>

          {/* Header */}
          <div style={st.header}>
            <div style={st.meta}>
              <span style={{ ...st.statusBadge, backgroundColor: sc.bg, color: sc.text }}>
                {capsule.status.charAt(0).toUpperCase() + capsule.status.slice(1)}
              </span>
              {capsule.status !== 'draft' && capsule.deliver_at && (
                <span style={st.deliveryDate}>Opens {formatDate(capsule.deliver_at)}</span>
              )}
            </div>
            <h1 style={st.title}>{capsule.title}</h1>
            <p style={st.created}>Created {formatDate(capsule.created_at)}</p>
          </div>

          {/* Message */}
          <div style={st.section}>
            <h2 style={st.sectionTitle}>Your message</h2>
            <div style={st.messageBox}>
              <p style={st.messageText}>{capsule.message}</p>
            </div>
          </div>

          {/* Snapshot */}
          {(capsule.age || capsule.city || capsule.favorite_song || capsule.favorite_show ||
            capsule.future_vision || (capsule.personality_words && capsule.personality_words.length > 0)) && (
            <div style={st.section}>
              <h2 style={st.sectionTitle}>Snapshot of you</h2>
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
                  <p style={st.visionLabel}>Your future vision</p>
                  <p style={st.visionText}>{capsule.future_vision}</p>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          {isDraft && (
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

          {!isDraft && (
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

  header: {
    backgroundColor: CREAM, border: `1px solid ${BORDER}`,
    borderRadius: 10, padding: '28px 28px 24px', marginBottom: 20,
  },
  meta: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 },
  statusBadge: {
    fontFamily: F.sans, fontSize: 11, fontWeight: 700,
    padding: '3px 12px', borderRadius: 20,
    textTransform: 'uppercase', letterSpacing: '0.5px',
  },
  deliveryDate: { fontFamily: F.sans, fontSize: 13, color: MUTED },
  title: {
    fontFamily: F.serif, fontSize: 28, fontWeight: 600,
    color: MAROON, margin: '0 0 8px', lineHeight: 1.3, wordBreak: 'break-word',
  },
  created: { fontFamily: F.sans, fontSize: 13, color: MUTED, margin: 0 },

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
    border: 'none', borderRadius: 8, fontSize: 17, fontWeight: 600, fontFamily: F.sans,
  },
  viewCartBtn: {
    width: '100%', padding: 16, backgroundColor: 'transparent', color: WINE,
    border: `2px solid ${WINE}`, borderRadius: 8, fontSize: 16, fontWeight: 600, fontFamily: F.sans,
  },
  backBtn: {
    width: '100%', padding: 14, backgroundColor: CREAM, color: MUTED,
    border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 14, fontFamily: F.sans,
  },
}
