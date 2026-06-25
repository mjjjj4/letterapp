import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import { calcPrice, describeTime, getMinDate, loadCart, saveCart } from '../lib/cart'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [capsules, setCapsules] = useState([])
  const [loading, setLoading] = useState(true)
  const [loggingOut, setLoggingOut] = useState(false)
  const [cart, setCart] = useState([])
  const [modalCapsule, setModalCapsule] = useState(null)
  const [selectedDate, setSelectedDate] = useState('')

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

  const openModal = (capsule) => {
    setModalCapsule(capsule)
    const minDate = getMinDate()
    const existing = capsule.deliver_at ? capsule.deliver_at.split('T')[0] : ''
    setSelectedDate(existing >= minDate ? existing : '')
  }

  const closeModal = () => { setModalCapsule(null); setSelectedDate('') }

  const addToCart = () => {
    const pricing = calcPrice(selectedDate)
    if (!pricing || !modalCapsule) return
    setCart(prev => {
      const filtered = prev.filter(x => x.capsuleId !== modalCapsule.id)
      return [...filtered, {
        capsuleId: modalCapsule.id,
        title: modalCapsule.title,
        deliveryDate: selectedDate,
        years: pricing.years,
        price: pricing.price,
      }]
    })
    closeModal()
    router.push('/cart')
  }

  const isInCart = (id) => cart.some(x => x.capsuleId === id)

  if (loading) {
    return <div style={s.loadingScreen}><p style={s.loadingText}>Loading...</p></div>
  }

  const drafts = capsules.filter(c => c.status === 'draft')
  const sealed = capsules.filter(c => c.status === 'sealed')
  const delivered = capsules.filter(c => c.status === 'delivered')
  const pricing = calcPrice(selectedDate)

  return (
    <div style={s.page}>

      {/* DATE SELECTION MODAL */}
      {modalCapsule && (
        <div style={s.backdrop} onClick={closeModal}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <p style={s.modalLabel}>Schedule delivery</p>
            <p style={s.modalCapsuleName}>&ldquo;{modalCapsule.title}&rdquo;</p>

            <label style={s.fieldLabel}>When should this capsule be delivered?</label>
            <input
              type="date"
              min={getMinDate()}
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              style={s.dateInput}
            />

            {pricing && selectedDate && (
              <div style={s.priceBreakdown}>
                <div style={s.priceRow}>
                  <span style={s.priceLabel}>Delivery date</span>
                  <span style={s.priceValue}>{formatDate(selectedDate)}</span>
                </div>
                <div style={s.priceRow}>
                  <span style={s.priceLabel}>Storage period</span>
                  <span style={s.priceValue}>{describeTime(selectedDate)}</span>
                </div>
                <div style={s.priceRow}>
                  <span style={s.priceLabel}>Rate</span>
                  <span style={s.priceValue}>$1.85/year</span>
                </div>
                <div style={{ ...s.priceRow, borderTop: '1px solid #e8e8e8', paddingTop: '12px', marginTop: '4px' }}>
                  <span style={{ ...s.priceLabel, fontWeight: 'bold', color: '#1a1a1a' }}>Total</span>
                  <span style={s.priceTotal}>${pricing.price.toFixed(2)}</span>
                </div>
              </div>
            )}

            {!selectedDate && (
              <p style={s.dateHint}>Select a date to see pricing</p>
            )}

            <button
              onClick={addToCart}
              disabled={!pricing}
              style={{ ...s.addToCartBtn, opacity: pricing ? 1 : 0.45, cursor: pricing ? 'pointer' : 'not-allowed' }}
            >
              Add to cart &rarr;
            </button>
            <button onClick={closeModal} style={s.cancelBtn}>Cancel</button>
          </div>
        </div>
      )}

      {/* NAV */}
      <nav style={s.nav}>
        <span style={s.navBrand}>The Letter</span>
        <div style={s.navRight}>
          {cart.length > 0 && (
            <button onClick={() => router.push('/cart')} style={s.cartBtn}>
              Cart ({cart.length})
            </button>
          )}
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
              <p style={s.emptyHeadline}>No drafts yet</p>
              <p style={s.emptyBody}>Write a letter to your future self and seal it for a future date.</p>
              <button onClick={() => router.push('/create')} style={s.emptyBtn}>
                Create your first capsule
              </button>
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
                        <button onClick={() => openModal(c)} style={s.sealBtn}>
                          Seal &amp; Pay
                        </button>
                      )}
                      <button onClick={() => router.push(`/capsule/${c.id}`)} style={s.editBtn}>
                        Edit
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

  // Modal
  backdrop: {
    position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.65)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, padding: '16px',
  },
  modal: {
    backgroundColor: '#fff', borderRadius: '16px', padding: '28px 24px',
    width: '100%', maxWidth: '440px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  modalLabel: { fontSize: '12px', fontWeight: 'bold', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 6px', fontFamily: 'Arial,sans-serif' },
  modalCapsuleName: { fontSize: '17px', fontWeight: 'bold', color: '#1a1a1a', margin: '0 0 20px', lineHeight: '1.4', wordBreak: 'break-word' },
  fieldLabel: { display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#555', marginBottom: '8px', fontFamily: 'Arial,sans-serif' },
  dateInput: {
    width: '100%', padding: '12px', border: '1.5px solid #ddd', borderRadius: '8px',
    fontSize: '15px', fontFamily: 'Arial,sans-serif', boxSizing: 'border-box',
    marginBottom: '16px', outline: 'none',
  },
  priceBreakdown: { backgroundColor: '#f9f9f7', borderRadius: '10px', padding: '16px', marginBottom: '20px' },
  priceRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '8px', marginBottom: '8px' },
  priceLabel: { fontSize: '13px', color: '#777', fontFamily: 'Arial,sans-serif' },
  priceValue: { fontSize: '13px', color: '#333', fontFamily: 'Arial,sans-serif', fontWeight: 'bold' },
  priceTotal: { fontSize: '22px', fontWeight: 'bold', color: '#1a1a1a' },
  dateHint: { fontSize: '13px', color: '#aaa', fontFamily: 'Arial,sans-serif', textAlign: 'center', margin: '0 0 20px' },
  addToCartBtn: {
    width: '100%', padding: '14px', backgroundColor: '#1a1a1a', color: '#fff',
    border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold',
    marginBottom: '10px', fontFamily: 'Arial,sans-serif',
  },
  cancelBtn: {
    width: '100%', padding: '12px', backgroundColor: 'transparent', color: '#888',
    border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer',
    fontFamily: 'Arial,sans-serif',
  },

  // Nav
  nav: { backgroundColor: '#1a1a1a', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  navBrand: { fontSize: '20px', fontWeight: 'bold', color: '#fff', letterSpacing: '0.5px' },
  navRight: { display: 'flex', alignItems: 'center', gap: '10px' },
  cartBtn: {
    padding: '8px 16px', backgroundColor: '#f59e0b', color: '#1a1a1a',
    border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer',
    fontFamily: 'Arial,sans-serif',
  },
  logoutBtn: {
    padding: '8px 16px', backgroundColor: 'transparent', color: '#aaa',
    border: '1px solid #444', borderRadius: '6px', fontSize: '13px', cursor: 'pointer',
  },

  // Body
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

  // Empty state
  emptyCard: { backgroundColor: '#fff', border: '2px dashed #ddd', borderRadius: '12px', padding: '40px 24px', textAlign: 'center' },
  emptyIcon: { fontSize: '36px', margin: '0 0 12px' },
  emptyHeadline: { fontSize: '18px', fontWeight: 'bold', color: '#333', margin: '0 0 8px', fontFamily: 'Arial,sans-serif' },
  emptyBody: { fontSize: '14px', color: '#888', margin: '0 auto 24px', lineHeight: '1.6', fontFamily: 'Arial,sans-serif', maxWidth: '320px' },
  emptyBtn: { padding: '12px 24px', backgroundColor: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Arial,sans-serif' },

  // Draft card
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

  // Sealed card
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

  // Delivered
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
