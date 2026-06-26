import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { supabase } from '../lib/supabase'
import { loadCart, saveCart } from '../lib/cart'
import SiteNav from '../components/SiteNav'
import SiteFooter from '../components/SiteFooter'

const MAROON = '#4D0000'
const WINE = '#8A2323'
const CREAM = '#FFFBF5'
const BORDER = 'rgba(77, 0, 0, 0.15)'
const INK = '#3A2418'
const MUTED = '#7A6A5A'
const F = { serif: "'Playfair Display','Georgia',serif", sans: "'Inter',Arial,sans-serif" }

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [capsules, setCapsules] = useState([])
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState([])
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error || !user) { router.push('/'); return }
        setUser(user)
        const { data, error: capsuleError } = await supabase
          .from('capsules')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
        if (!capsuleError) setCapsules(data || [])
        setLoading(false)
      } catch {
        router.push('/')
      }
    }
    init()
  }, [router])

  useEffect(() => { setCart(loadCart()) }, [])

  const formatDate = (ds) =>
    new Date(ds).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  const addToCart = (capsule) => {
    const newItem = { capsuleId: capsule.id, title: capsule.title, deliveryDate: '', years: null, price: null }
    const currentCart = loadCart()
    const newCart = [...currentCart.filter(x => x.capsuleId !== capsule.id), newItem]
    saveCart(newCart)
    setCart(newCart)
    router.push('/cart')
  }

  const deleteDraft = async (capsule) => {
    if (!window.confirm(`Delete "${capsule.title}"? This can't be undone.`)) return
    setDeleting(capsule.id)
    const { error } = await supabase.from('capsules').delete().eq('id', capsule.id)
    if (error) { alert('Failed to delete: ' + error.message); setDeleting(null); return }
    setCapsules(prev => prev.filter(c => c.id !== capsule.id))
    setCart(prev => {
      const updated = prev.filter(x => x.capsuleId !== capsule.id)
      saveCart(updated)
      return updated
    })
    setDeleting(null)
  }

  const isInCart = (id) => cart.some(x => x.capsuleId === id)

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: CREAM }}>
        <p style={{ fontFamily: F.sans, fontSize: 16, color: MUTED }}>Loading…</p>
      </div>
    )
  }

  const drafts = capsules.filter(c => c.status === 'draft')
  const sealed = capsules.filter(c => c.status === 'sealed')
  const delivered = capsules.filter(c => c.status === 'delivered')
  const isFirstEver = capsules.length === 0

  return (
    <>
      <Head>
        <title>My Capsules — The Letter</title>
      </Head>

      <SiteNav />

      <div style={s.page}>
        <div style={s.body}>

          {/* Welcome bar */}
          <div style={s.topBar}>
            <div>
              <p style={s.welcomeLabel}>Welcome back</p>
              <p style={s.welcomeEmail}>{user?.email}</p>
            </div>
            <button onClick={() => router.push('/create')} style={s.newBtn}>
              + New capsule
            </button>
          </div>

          {/* DRAFT SECTION */}
          <section style={s.section}>
            <div style={s.sectionHeading}>
              <span style={s.sectionTitle}>Drafts</span>
              <span style={s.sectionCount}>{drafts.length}</span>
            </div>

            {drafts.length === 0 ? (
              <div style={s.emptyCard}>
                <p style={s.emptyIcon}>&#9993;</p>
                {isFirstEver ? (
                  <>
                    <p style={s.emptyHeadline}>Write your first capsule</p>
                    <p style={s.emptyBody}>Send a letter to your future self — sealed until the date you choose.</p>
                    <button onClick={() => router.push('/create')} style={s.emptyBtn}>
                      Create your first capsule
                    </button>
                  </>
                ) : (
                  <>
                    <p style={s.emptyHeadline}>No drafts</p>
                    <p style={s.emptyBody}>All caught up. Write another capsule anytime.</p>
                    <button onClick={() => router.push('/create')} style={s.emptyBtn}>
                      Add another capsule
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div style={s.cardList}>
                {drafts.map(c => {
                  const inCart = isInCart(c.id)
                  return (
                    <div key={c.id} style={s.draftCard}>
                      <div style={s.draftTop}>
                        <div style={s.badgeRow}>
                          <span style={s.draftBadge}>Draft</span>
                          {inCart && <span style={s.inCartBadge}>✓ In cart</span>}
                        </div>
                        <h3 style={s.cardTitle}>{c.title}</h3>
                      </div>
                      {c.message && (
                        <p style={s.messagePreview}>
                          {c.message.length > 160 ? c.message.substring(0, 160) + '…' : c.message}
                        </p>
                      )}
                      <div style={s.draftActions}>
                        {inCart ? (
                          <button onClick={() => router.push('/cart')} style={s.viewCartBtn}>
                            View cart &rarr;
                          </button>
                        ) : (
                          <button onClick={() => addToCart(c)} style={s.sealBtn}>
                            Seal &amp; Pay
                          </button>
                        )}
                        <button onClick={() => router.push(`/create?id=${c.id}&mode=edit`)} style={s.editBtn}>
                          Edit draft
                        </button>
                        <button
                          onClick={() => deleteDraft(c)}
                          style={s.deleteBtn}
                          disabled={deleting === c.id}
                          title="Delete draft"
                        >
                          {deleting === c.id ? '…' : '🗑'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          {/* SEALED SECTION */}
          {sealed.length > 0 && (
            <section style={s.section}>
              <div style={s.sectionHeading}>
                <span style={s.sectionTitle}>Sealed</span>
                <span style={{ ...s.sectionCount, backgroundColor: '#e8f0f7', color: '#1a4a7a' }}>{sealed.length}</span>
              </div>
              <div style={s.cardList}>
                {sealed.map(c => (
                  <div key={c.id} style={s.sealedCard}>
                    <div style={s.sealedInner}>
                      <div style={s.sealedLeft}>
                        <div style={s.sealedTop}>
                          <span style={s.lockIcon}>🔒</span>
                          <span style={s.sealedBadge}>Sealed</span>
                          {c.is_founder_promo && <span style={s.founderBadge}>Founder Promo</span>}
                        </div>
                        <h3 style={s.sealedTitle}>{c.title}</h3>
                        <p style={s.sealedDate}>Opens {formatDate(c.deliver_at)}</p>
                        <p style={s.sealedHint}>Message hidden until delivery</p>
                      </div>
                      <button onClick={() => router.push(`/capsule/${c.id}`)} style={s.viewSealedBtn}>
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* DELIVERED SECTION */}
          {delivered.length > 0 && (
            <section style={s.section}>
              <div style={s.sectionHeading}>
                <span style={s.sectionTitle}>Delivered</span>
                <span style={{ ...s.sectionCount, backgroundColor: '#e8f5ee', color: '#1a6640' }}>{delivered.length}</span>
              </div>
              <div style={s.deliveredBanner}>
                <span style={s.deliveredBannerIcon}>🎉</span>
                <span style={s.deliveredBannerText}>A letter from your past self has arrived.</span>
              </div>
              <div style={s.cardList}>
                {delivered.map(c => (
                  <div key={c.id} style={s.deliveredCard}>
                    <div style={s.deliveredHeader}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 2 }}>
                          <span style={s.deliveredBadge}>Delivered</span>
                          {c.is_founder_promo && <span style={s.founderBadge}>Founder Promo</span>}
                        </div>
                        <h3 style={s.deliveredTitle}>{c.title}</h3>
                        <p style={s.deliveredDate}>Delivered {formatDate(c.deliver_at)}</p>
                      </div>
                      <button onClick={() => router.push(`/capsule/${c.id}`)} style={s.viewDeliveredBtn}>
                        Open
                      </button>
                    </div>
                    {c.message && (
                      <div style={s.deliveredMessageBox}>
                        <p style={s.deliveredMessage}>
                          {c.message.length > 240 ? c.message.substring(0, 240) + '…' : c.message}
                        </p>
                      </div>
                    )}
                    {(c.age || c.city || c.favorite_song || c.favorite_show) && (
                      <div style={s.snapshotRow}>
                        {c.age && <div style={s.chip}><span style={s.chipLabel}>Age</span><span style={s.chipValue}>{c.age}</span></div>}
                        {c.city && <div style={s.chip}><span style={s.chipLabel}>City</span><span style={s.chipValue}>{c.city}</span></div>}
                        {c.favorite_song && <div style={s.chip}><span style={s.chipLabel}>Song</span><span style={s.chipValue}>{c.favorite_song}</span></div>}
                        {c.favorite_show && <div style={s.chip}><span style={s.chipLabel}>Show</span><span style={s.chipValue}>{c.favorite_show}</span></div>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>
      </div>

      <SiteFooter />
    </>
  )
}

const s = {
  page: { minHeight: 'calc(100vh - 64px)', backgroundColor: CREAM },

  body: { maxWidth: 700, margin: '0 auto', padding: '32px 16px 80px' },
  topBar: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    marginBottom: 32, flexWrap: 'wrap', gap: 12,
  },
  welcomeLabel: {
    fontFamily: F.sans, fontSize: 11, color: MUTED, margin: '0 0 2px',
    textTransform: 'uppercase', letterSpacing: '0.8px',
  },
  welcomeEmail: { fontFamily: F.sans, fontSize: 15, color: INK, margin: 0, fontWeight: 600 },
  newBtn: {
    padding: '10px 20px', backgroundColor: WINE, color: CREAM,
    border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600,
    fontFamily: F.sans, whiteSpace: 'nowrap',
  },

  section: { marginBottom: 40 },
  sectionHeading: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 },
  sectionTitle: {
    fontFamily: F.sans, fontSize: 12, fontWeight: 700, color: MUTED,
    textTransform: 'uppercase', letterSpacing: '1px',
  },
  sectionCount: {
    fontFamily: F.sans, fontSize: 12, fontWeight: 700, color: MUTED,
    backgroundColor: 'rgba(77,0,0,0.08)', padding: '2px 10px', borderRadius: 20,
  },
  cardList: { display: 'flex', flexDirection: 'column', gap: 12 },

  emptyCard: {
    backgroundColor: CREAM, border: `2px dashed ${BORDER}`,
    borderRadius: 10, padding: '40px 24px', textAlign: 'center',
  },
  emptyIcon: { fontSize: 36, margin: '0 0 12px' },
  emptyHeadline: {
    fontFamily: F.serif, fontSize: 20, fontWeight: 600,
    color: MAROON, margin: '0 0 8px',
  },
  emptyBody: {
    fontFamily: F.sans, fontSize: 14, color: MUTED,
    margin: '0 auto 24px', lineHeight: 1.6, maxWidth: 320,
  },
  emptyBtn: {
    padding: '12px 24px', backgroundColor: WINE, color: CREAM,
    border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600,
    fontFamily: F.sans,
  },

  draftCard: {
    backgroundColor: CREAM,
    border: `1px solid ${BORDER}`, borderLeft: `4px solid ${WINE}`,
    borderRadius: 10, padding: 20,
  },
  draftTop: { marginBottom: 14 },
  badgeRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 },
  draftBadge: {
    fontFamily: F.sans, fontSize: 11, fontWeight: 700, color: WINE,
    backgroundColor: 'rgba(77,0,0,0.08)', padding: '3px 10px', borderRadius: 20,
    textTransform: 'uppercase', letterSpacing: '0.5px',
  },
  inCartBadge: {
    fontFamily: F.sans, fontSize: 11, fontWeight: 700, color: '#065f46',
    backgroundColor: '#d1fae5', padding: '3px 10px', borderRadius: 20,
  },
  cardTitle: {
    fontFamily: F.serif, fontSize: 20, fontWeight: 600,
    color: INK, margin: 0, lineHeight: 1.3, wordBreak: 'break-word',
  },
  messagePreview: {
    fontFamily: F.sans, fontSize: 14, color: MUTED,
    lineHeight: 1.75, margin: '0 0 20px',
    fontStyle: 'italic', borderLeft: `3px solid ${BORDER}`, paddingLeft: 14,
  },
  draftActions: { display: 'flex', gap: 10 },
  sealBtn: {
    flex: 1, padding: 13, backgroundColor: WINE, color: CREAM,
    border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, fontFamily: F.sans,
  },
  viewCartBtn: {
    flex: 1, padding: 13, backgroundColor: 'transparent', color: WINE,
    border: `1.5px solid ${WINE}`, borderRadius: 8, fontSize: 14, fontWeight: 600, fontFamily: F.sans,
  },
  editBtn: {
    padding: '13px 20px', backgroundColor: CREAM, color: INK,
    border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 14, fontFamily: F.sans,
  },
  deleteBtn: {
    padding: '13px 14px', backgroundColor: CREAM, color: '#dc2626',
    border: '1px solid #fecaca', borderRadius: 8, fontSize: 15, lineHeight: 1,
  },

  sealedCard: {
    backgroundColor: CREAM, border: `1px solid ${BORDER}`,
    borderRadius: 10, padding: '18px 20px', opacity: 0.8,
  },
  sealedInner: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  sealedLeft: { flex: 1 },
  sealedTop: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 },
  lockIcon: { fontSize: 14 },
  sealedBadge: {
    fontFamily: F.sans, fontSize: 11, fontWeight: 700, color: '#1a4a7a',
    backgroundColor: '#e8f0f7', padding: '3px 10px', borderRadius: 20,
    textTransform: 'uppercase', letterSpacing: '0.5px',
  },
  founderBadge: {
    fontFamily: F.sans, fontSize: 11, fontWeight: 700, color: WINE,
    backgroundColor: 'rgba(77,0,0,0.08)', padding: '3px 10px', borderRadius: 20,
    textTransform: 'uppercase', letterSpacing: '0.5px',
  },
  sealedTitle: {
    fontFamily: F.serif, fontSize: 17, fontWeight: 600,
    color: MUTED, margin: '0 0 4px', wordBreak: 'break-word',
  },
  sealedDate: { fontFamily: F.sans, fontSize: 13, color: MUTED, margin: '0 0 4px' },
  sealedHint: { fontFamily: F.sans, fontSize: 12, color: '#aaa', margin: 0, fontStyle: 'italic' },
  viewSealedBtn: {
    padding: '10px 18px', backgroundColor: 'transparent', color: MUTED,
    border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 13, fontFamily: F.sans, whiteSpace: 'nowrap',
  },

  deliveredBanner: {
    display: 'flex', alignItems: 'center', gap: 10,
    backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0',
    borderRadius: 10, padding: '14px 16px', marginBottom: 14,
  },
  deliveredBannerIcon: { fontSize: 20, flexShrink: 0 },
  deliveredBannerText: { fontFamily: F.sans, fontSize: 14, color: '#166534', lineHeight: 1.4 },
  deliveredCard: {
    backgroundColor: CREAM, border: '1px solid #d1fae5',
    borderLeft: '4px solid #10b981', borderRadius: 10, padding: 20,
  },
  deliveredHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', gap: 12, marginBottom: 16,
  },
  deliveredBadge: {
    fontFamily: F.sans, fontSize: 11, fontWeight: 700,
    color: '#065f46', backgroundColor: '#d1fae5',
    padding: '3px 10px', borderRadius: 20,
    textTransform: 'uppercase', letterSpacing: '0.5px',
  },
  deliveredTitle: {
    fontFamily: F.serif, fontSize: 18, fontWeight: 600,
    color: INK, margin: '0 0 4px', wordBreak: 'break-word',
  },
  deliveredDate: { fontFamily: F.sans, fontSize: 13, color: MUTED, margin: 0 },
  viewDeliveredBtn: {
    padding: '10px 18px', backgroundColor: '#10b981', color: '#fff',
    border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600,
    fontFamily: F.sans, whiteSpace: 'nowrap', flexShrink: 0,
  },
  deliveredMessageBox: { borderLeft: '3px solid #6ee7b7', paddingLeft: 14, marginBottom: 16 },
  deliveredMessage: {
    fontFamily: F.serif, fontSize: 15, color: INK,
    lineHeight: 1.8, margin: 0, fontStyle: 'italic',
    whiteSpace: 'pre-wrap', wordBreak: 'break-word',
  },
  snapshotRow: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  chip: {
    backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0',
    borderRadius: 8, padding: '6px 12px',
    display: 'flex', flexDirection: 'column', gap: 2,
  },
  chipLabel: {
    fontFamily: F.sans, fontSize: 10, fontWeight: 700,
    color: '#6ee7b7', textTransform: 'uppercase', letterSpacing: '0.5px',
  },
  chipValue: { fontFamily: F.sans, fontSize: 13, color: '#065f46', fontWeight: 700 },
}
