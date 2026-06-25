import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import { calcPrice, loadCart, saveCart } from '../lib/cart'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [capsules, setCapsules] = useState([])
  const [loading, setLoading] = useState(true)
  const [loggingOut, setLoggingOut] = useState(false)
  const [cart, setCart] = useState([])
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error || !user) { router.push('/login'); return }
        setUser(user)
        const { data, error: capsuleError } = await supabase
          .from('capsules')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
        if (!capsuleError) setCapsules(data || [])
        setLoading(false)
      } catch {
        router.push('/login')
      }
    }
    init()
  }, [router])

  useEffect(() => { setCart(loadCart()) }, [])
  useEffect(() => { saveCart(cart) }, [cart])

  const handleLogout = async () => {
    setLoggingOut(true)
    await supabase.auth.signOut()
    router.push('/login')
  }

  const formatDate = (ds) =>
    new Date(ds).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  // Save to localStorage synchronously before navigating so cart page sees the item immediately
  const addToCart = (capsule) => {
    const existingDate = capsule.deliver_at ? capsule.deliver_at.split('T')[0] : ''
    const pricing = calcPrice(existingDate)
    const newItem = {
      capsuleId: capsule.id,
      title: capsule.title,
      deliveryDate: pricing ? existingDate : '',
      years: pricing ? pricing.years : null,
      price: pricing ? pricing.price : null,
    }
    const currentCart = loadCart()
    const newCart = [...currentCart.filter(x => x.capsuleId !== capsule.id), newItem]
    saveCart(newCart)   // synchronous — localStorage is updated before push
    setCart(newCart)
    router.push('/cart')
  }

  const deleteDraft = async (capsule) => {
    if (!window.confirm(`Delete "${capsule.title}"? This can't be undone.`)) return
    setDeleting(capsule.id)
    const { error } = await supabase.from('capsules').delete().eq('id', capsule.id)
    if (error) {
      alert('Failed to delete: ' + error.message)
      setDeleting(null)
      return
    }
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
    return <div style={s.loadingScreen}><p style={s.loadingText}>Loading...</p></div>
  }

  const drafts = capsules.filter(c => c.status === 'draft')
  const sealed = capsules.filter(c => c.status === 'sealed')
  const delivered = capsules.filter(c => c.status === 'delivered')
  const isFirstEver = capsules.length === 0

  return (
    <div style={s.page}>
      {/* NAV */}
      <nav style={s.nav}>
        <span style={s.navBrand}>The Letter</span>
        <div style={s.navRight}>
          <button
            onClick={() => router.push('/cart')}
            style={cart.length > 0 ? s.cartBtnActive : s.cartBtnEmpty}
          >
            {cart.length > 0 ? `Cart (${cart.length})` : 'Cart'}
          </button>
          <button onClick={handleLogout} style={s.logoutBtn} disabled={loggingOut}>
            {loggingOut ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </nav>

      <div style={s.body}>
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
                        {inCart && <span style={s.inCartBadge}>&#10003; In cart</span>}
                      </div>
                      <h3 style={s.cardTitle}>{c.title}</h3>
                    </div>
                    {c.message && (
                      <p style={s.messagePreview}>
                        {c.message.length > 160 ? c.message.substring(0, 160) + '...' : c.message}
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
                      <button onClick={() => router.push(`/capsule/${c.id}`)} style={s.editBtn}>
                        Edit
                      </button>
                      <button
                        onClick={() => deleteDraft(c)}
                        style={s.deleteBtn}
                        disabled={deleting === c.id}
                        title="Delete draft"
                      >
                        {deleting === c.id ? '...' : '🗑'}
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
              <span style={s.sectionCount}>{sealed.length}</span>
            </div>
            <div style={s.cardList}>
              {sealed.map(c => (
                <div key={c.id} style={s.sealedCard}>
                  <div style={s.sealedInner}>
                    <div style={s.sealedLeft}>
                      <div style={s.sealedTop}>
                        <span style={s.lockIcon}>&#128274;</span>
                        <span style={s.sealedBadge}>Sealed</span>
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
              <span style={{ ...s.sectionCount, backgroundColor: '#d1fae5', color: '#065f46' }}>
                {delivered.length}
              </span>
            </div>
            <div style={s.deliveredBanner}>
              <span style={s.deliveredBannerIcon}>&#127881;</span>
              <span style={s.deliveredBannerText}>A letter from your past self has arrived.</span>
            </div>
            <div style={s.cardList}>
              {delivered.map(c => (
                <div key={c.id} style={s.deliveredCard}>
                  <div style={s.deliveredHeader}>
                    <div style={{ flex: 1 }}>
                      <span style={s.deliveredBadge}>Delivered</span>
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
                        {c.message.length > 240 ? c.message.substring(0, 240) + '...' : c.message}
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
  )
}

const s = {
  page: { minHeight: '100vh', backgroundColor: '#f7f7f5', fontFamily: "'Georgia','Times New Roman',serif" },
  loadingScreen: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontSize: '16px', color: '#888', fontFamily: 'Arial,sans-serif' },

  nav: { backgroundColor: '#1a1a1a', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  navBrand: { fontSize: '20px', fontWeight: 'bold', color: '#fff', letterSpacing: '0.5px' },
  navRight: { display: 'flex', alignItems: 'center', gap: '10px' },
  cartBtnActive: { padding: '8px 16px', backgroundColor: '#f59e0b', color: '#1a1a1a', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Arial,sans-serif' },
  cartBtnEmpty: { padding: '8px 16px', backgroundColor: 'transparent', color: '#888', border: '1px solid #555', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontFamily: 'Arial,sans-serif' },
  logoutBtn: { padding: '8px 16px', backgroundColor: 'transparent', color: '#aaa', border: '1px solid #444', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' },

  body: { maxWidth: '680px', margin: '0 auto', padding: '24px 16px 60px' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' },
  welcomeLabel: { fontSize: '12px', color: '#888', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.8px', fontFamily: 'Arial,sans-serif' },
  welcomeEmail: { fontSize: '15px', color: '#333', margin: 0, fontFamily: 'Arial,sans-serif', fontWeight: 'bold' },
  newBtn: { padding: '10px 18px', backgroundColor: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Arial,sans-serif', whiteSpace: 'nowrap' },

  section: { marginBottom: '40px' },
  sectionHeading: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' },
  sectionTitle: { fontSize: '13px', fontWeight: 'bold', color: '#555', textTransform: 'uppercase', letterSpacing: '1px', fontFamily: 'Arial,sans-serif' },
  sectionCount: { fontSize: '12px', fontWeight: 'bold', color: '#555', backgroundColor: '#e8e8e8', padding: '2px 8px', borderRadius: '20px', fontFamily: 'Arial,sans-serif' },
  cardList: { display: 'flex', flexDirection: 'column', gap: '12px' },

  emptyCard: { backgroundColor: '#fff', border: '2px dashed #ddd', borderRadius: '12px', padding: '40px 24px', textAlign: 'center' },
  emptyIcon: { fontSize: '36px', margin: '0 0 12px' },
  emptyHeadline: { fontSize: '18px', fontWeight: 'bold', color: '#333', margin: '0 0 8px', fontFamily: 'Arial,sans-serif' },
  emptyBody: { fontSize: '14px', color: '#888', margin: '0 auto 24px', lineHeight: '1.6', fontFamily: 'Arial,sans-serif', maxWidth: '320px' },
  emptyBtn: { padding: '12px 24px', backgroundColor: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Arial,sans-serif' },

  draftCard: { backgroundColor: '#fff', border: '1px solid #e8e8e8', borderLeft: '4px solid #f59e0b', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  draftTop: { marginBottom: '14px' },
  badgeRow: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' },
  draftBadge: { display: 'inline-block', fontSize: '11px', fontWeight: 'bold', color: '#92400e', backgroundColor: '#fef3c7', padding: '3px 10px', borderRadius: '20px', fontFamily: 'Arial,sans-serif', textTransform: 'uppercase', letterSpacing: '0.5px' },
  inCartBadge: { display: 'inline-block', fontSize: '11px', fontWeight: 'bold', color: '#065f46', backgroundColor: '#d1fae5', padding: '3px 10px', borderRadius: '20px', fontFamily: 'Arial,sans-serif' },
  cardTitle: { fontSize: '18px', fontWeight: 'bold', color: '#1a1a1a', margin: 0, lineHeight: '1.3', wordBreak: 'break-word' },
  messagePreview: { fontSize: '15px', color: '#555', lineHeight: '1.7', margin: '0 0 20px', fontStyle: 'italic', borderLeft: '3px solid #fde68a', paddingLeft: '14px' },
  draftActions: { display: 'flex', gap: '10px' },
  sealBtn: { flex: 1, padding: '13px', backgroundColor: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Arial,sans-serif' },
  viewCartBtn: { flex: 1, padding: '13px', backgroundColor: '#f59e0b', color: '#1a1a1a', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Arial,sans-serif' },
  editBtn: { padding: '13px 20px', backgroundColor: '#fff', color: '#555', border: '1px solid #ddd', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Arial,sans-serif' },
  deleteBtn: { padding: '13px 14px', backgroundColor: '#fff', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '8px', fontSize: '15px', cursor: 'pointer', lineHeight: 1 },

  sealedCard: { backgroundColor: '#f5f5f5', border: '1px solid #e0e0e0', borderRadius: '12px', padding: '18px 20px', opacity: 0.75 },
  sealedInner: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' },
  sealedLeft: { flex: 1 },
  sealedTop: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' },
  lockIcon: { fontSize: '14px' },
  sealedBadge: { fontSize: '11px', fontWeight: 'bold', color: '#0e7490', backgroundColor: '#cffafe', padding: '3px 10px', borderRadius: '20px', fontFamily: 'Arial,sans-serif', textTransform: 'uppercase', letterSpacing: '0.5px' },
  sealedTitle: { fontSize: '17px', fontWeight: 'bold', color: '#444', margin: '0 0 4px', wordBreak: 'break-word' },
  sealedDate: { fontSize: '13px', color: '#888', margin: '0 0 4px', fontFamily: 'Arial,sans-serif' },
  sealedHint: { fontSize: '12px', color: '#aaa', margin: 0, fontFamily: 'Arial,sans-serif', fontStyle: 'italic' },
  viewSealedBtn: { padding: '10px 18px', backgroundColor: 'transparent', color: '#888', border: '1px solid #ccc', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Arial,sans-serif', whiteSpace: 'nowrap' },

  deliveredBanner: { display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '14px 16px', marginBottom: '14px' },
  deliveredBannerIcon: { fontSize: '20px', flexShrink: 0 },
  deliveredBannerText: { fontSize: '14px', color: '#166534', fontFamily: 'Arial,sans-serif', lineHeight: '1.4' },
  deliveredCard: { backgroundColor: '#fff', border: '1px solid #d1fae5', borderLeft: '4px solid #10b981', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(16,185,129,0.08)' },
  deliveredHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' },
  deliveredBadge: { display: 'inline-block', fontSize: '11px', fontWeight: 'bold', color: '#065f46', backgroundColor: '#d1fae5', padding: '3px 10px', borderRadius: '20px', marginBottom: '8px', fontFamily: 'Arial,sans-serif', textTransform: 'uppercase', letterSpacing: '0.5px' },
  deliveredTitle: { fontSize: '18px', fontWeight: 'bold', color: '#1a1a1a', margin: '0 0 4px', wordBreak: 'break-word' },
  deliveredDate: { fontSize: '13px', color: '#888', margin: 0, fontFamily: 'Arial,sans-serif' },
  viewDeliveredBtn: { padding: '10px 18px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Arial,sans-serif', whiteSpace: 'nowrap', flexShrink: 0 },
  deliveredMessageBox: { borderLeft: '3px solid #6ee7b7', paddingLeft: '14px', marginBottom: '16px' },
  deliveredMessage: { fontSize: '15px', color: '#333', lineHeight: '1.8', margin: 0, fontStyle: 'italic', whiteSpace: 'pre-wrap', wordBreak: 'break-word' },
  snapshotRow: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  chip: { backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '6px 12px', display: 'flex', flexDirection: 'column', gap: '2px' },
  chipLabel: { fontSize: '10px', fontWeight: 'bold', color: '#6ee7b7', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: 'Arial,sans-serif' },
  chipValue: { fontSize: '13px', color: '#065f46', fontFamily: 'Arial,sans-serif', fontWeight: 'bold' },
}
