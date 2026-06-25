import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'
import { calcPrice, describeTime, getMinDate, loadCart, saveCart } from '../../lib/cart'

export default function CapsuleDetail() {
  const router = useRouter()
  const { id } = router.query
  const [user, setUser] = useState(null)
  const [capsule, setCapsule] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cart, setCart] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) { router.push('/login'); return }
        setUser(user)
        if (!id) return

        const { data: capsuleArray, error: capsuleError } = await supabase
          .from('capsules')
          .select('*')
          .eq('id', id)
          .eq('user_id', user.id)

        if (capsuleError) {
          setError(`Failed to load capsule: ${capsuleError.message}`)
        } else if (!capsuleArray || capsuleArray.length === 0) {
          setError('Capsule not found.')
        } else {
          setCapsule(capsuleArray[0])
        }
        setLoading(false)
      } catch (err) {
        setError(`An error occurred: ${err.message}`)
        setLoading(false)
      }
    }
    init()
  }, [router, id])

  useEffect(() => { setCart(loadCart()) }, [])
  useEffect(() => { saveCart(cart) }, [cart])

  const formatDate = (ds) =>
    new Date(ds).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  const getStatusColor = (status) => {
    if (status === 'draft') return '#ffc107'
    if (status === 'sealed') return '#17a2b8'
    if (status === 'delivered') return '#28a745'
    return '#6c757d'
  }

  const openModal = () => {
    const minDate = getMinDate()
    const existing = capsule.deliver_at ? capsule.deliver_at.split('T')[0] : ''
    setSelectedDate(existing >= minDate ? existing : '')
    setModalOpen(true)
  }

  const closeModal = () => { setModalOpen(false); setSelectedDate('') }

  const addToCart = () => {
    const pricing = calcPrice(selectedDate)
    if (!pricing || !capsule) return
    setCart(prev => {
      const filtered = prev.filter(x => x.capsuleId !== capsule.id)
      return [...filtered, {
        capsuleId: capsule.id,
        title: capsule.title,
        deliveryDate: selectedDate,
        years: pricing.years,
        price: pricing.price,
      }]
    })
    closeModal()
    router.push('/cart')
  }

  const inCart = capsule && cart.some(x => x.capsuleId === capsule.id)
  const pricing = calcPrice(selectedDate)
  const isDraft = capsule?.status === 'draft'

  if (loading) return <div style={st.loading}>Loading...</div>

  if (error) return (
    <div style={st.container}>
      <div style={st.navbar}>
        <h1 style={st.navTitle}>The Letter</h1>
        <button onClick={() => router.push('/dashboard')} style={st.backButton}>← Back</button>
      </div>
      <div style={st.content}><div style={st.error}>{error}</div></div>
    </div>
  )

  if (!capsule) return (
    <div style={st.container}>
      <div style={st.navbar}>
        <h1 style={st.navTitle}>The Letter</h1>
        <button onClick={() => router.push('/dashboard')} style={st.backButton}>← Back</button>
      </div>
      <div style={st.content}><p style={st.errorText}>Capsule not found</p></div>
    </div>
  )

  return (
    <div style={st.container}>

      {/* DATE SELECTION MODAL */}
      {modalOpen && (
        <div style={st.backdrop} onClick={closeModal}>
          <div style={st.modal} onClick={e => e.stopPropagation()}>
            <p style={st.modalLabel}>Schedule delivery</p>
            <p style={st.modalCapsuleName}>&ldquo;{capsule.title}&rdquo;</p>

            <label style={st.fieldLabel}>When should this capsule be delivered?</label>
            <input
              type="date"
              min={getMinDate()}
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              style={st.dateInput}
            />

            {pricing && selectedDate && (
              <div style={st.priceBreakdown}>
                <div style={st.priceRow}>
                  <span style={st.priceLabel}>Delivery date</span>
                  <span style={st.priceValue}>{formatDate(selectedDate)}</span>
                </div>
                <div style={st.priceRow}>
                  <span style={st.priceLabel}>Storage period</span>
                  <span style={st.priceValue}>{describeTime(selectedDate)}</span>
                </div>
                <div style={st.priceRow}>
                  <span style={st.priceLabel}>Rate</span>
                  <span style={st.priceValue}>$1.85/year</span>
                </div>
                <div style={{ ...st.priceRow, borderTop: '1px solid #e8e8e8', paddingTop: '12px', marginTop: '4px' }}>
                  <span style={{ ...st.priceLabel, fontWeight: 'bold', color: '#1a1a1a' }}>Total</span>
                  <span style={st.priceTotal}>${pricing.price.toFixed(2)}</span>
                </div>
              </div>
            )}

            {!selectedDate && (
              <p style={st.dateHint}>Select a date to see pricing</p>
            )}

            <button
              onClick={addToCart}
              disabled={!pricing}
              style={{ ...st.addToCartBtn, opacity: pricing ? 1 : 0.45, cursor: pricing ? 'pointer' : 'not-allowed' }}
            >
              Add to cart &rarr;
            </button>
            <button onClick={closeModal} style={st.cancelBtn}>Cancel</button>
          </div>
        </div>
      )}

      <div style={st.navbar}>
        <h1 style={st.navTitle}>The Letter</h1>
        <button onClick={() => router.push('/dashboard')} style={st.backButton}>
          ← Back to Dashboard
        </button>
      </div>

      <div style={st.content}>
        {/* Header */}
        <div style={st.header}>
          <h1 style={st.title}>{capsule.title}</h1>
          <div style={st.metadata}>
            <span style={{ ...st.statusBadge, backgroundColor: getStatusColor(capsule.status) }}>
              {capsule.status.charAt(0).toUpperCase() + capsule.status.slice(1)}
            </span>
            <span style={st.deliveryDate}>Delivery: {formatDate(capsule.deliver_at)}</span>
          </div>
        </div>

        {/* Main Message */}
        <div style={st.section}>
          <h2 style={st.sectionTitle}>Your Message</h2>
          <div style={st.messageBox}>
            <p style={st.messageText}>{capsule.message}</p>
          </div>
        </div>

        {/* Snapshot Data */}
        {(capsule.age || capsule.city || capsule.favorite_song || capsule.favorite_show ||
          capsule.future_vision || (capsule.personality_words && capsule.personality_words.length > 0)) && (
          <div style={st.section}>
            <h2 style={st.sectionTitle}>Snapshot of You</h2>
            <div style={st.snapshotGrid}>
              {capsule.age && <div style={st.snapshotItem}><h3 style={st.snapshotLabel}>Age</h3><p style={st.snapshotValue}>{capsule.age}</p></div>}
              {capsule.city && <div style={st.snapshotItem}><h3 style={st.snapshotLabel}>City</h3><p style={st.snapshotValue}>{capsule.city}</p></div>}
              {capsule.favorite_song && <div style={st.snapshotItem}><h3 style={st.snapshotLabel}>Favorite Song</h3><p style={st.snapshotValue}>{capsule.favorite_song}</p></div>}
              {capsule.favorite_show && <div style={st.snapshotItem}><h3 style={st.snapshotLabel}>Favorite Show</h3><p style={st.snapshotValue}>{capsule.favorite_show}</p></div>}
              {capsule.personality_words && capsule.personality_words.length > 0 && (
                <div style={st.snapshotItem}><h3 style={st.snapshotLabel}>Personality</h3><p style={st.snapshotValue}>{capsule.personality_words.join(', ')}</p></div>
              )}
            </div>
            {capsule.future_vision && (
              <div style={st.futureVisionBox}>
                <h3 style={st.futureVisionTitle}>Your Future Vision</h3>
                <p style={st.futureVisionText}>{capsule.future_vision}</p>
              </div>
            )}
          </div>
        )}

        <div style={st.section}>
          <p style={st.createdDate}>Created on {formatDate(capsule.created_at)}</p>
        </div>

        {/* Bottom actions — draft only */}
        {isDraft && (
          <div style={st.bottomActions}>
            {inCart ? (
              <button onClick={() => router.push('/cart')} style={st.viewCartBtn}>
                In cart — View cart &rarr;
              </button>
            ) : (
              <button onClick={openModal} style={st.sealButtonBottom}>
                Seal &amp; Pay
              </button>
            )}
            <button onClick={() => router.push(`/capsule/${capsule.id}/edit`)} style={st.editButtonBottom}>
              Edit Capsule
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

const st = {
  container: { minHeight: '100vh', backgroundColor: '#f5f5f5', fontFamily: 'Arial, sans-serif' },
  loading: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: '#666', fontFamily: 'Arial, sans-serif' },

  // Modal
  backdrop: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' },
  modal: { backgroundColor: '#fff', borderRadius: '16px', padding: '28px 24px', width: '100%', maxWidth: '440px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' },
  modalLabel: { fontSize: '12px', fontWeight: 'bold', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 6px', fontFamily: 'Arial,sans-serif' },
  modalCapsuleName: { fontSize: '17px', fontWeight: 'bold', color: '#1a1a1a', margin: '0 0 20px', lineHeight: '1.4', wordBreak: 'break-word' },
  fieldLabel: { display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#555', marginBottom: '8px', fontFamily: 'Arial,sans-serif' },
  dateInput: { width: '100%', padding: '12px', border: '1.5px solid #ddd', borderRadius: '8px', fontSize: '15px', fontFamily: 'Arial,sans-serif', boxSizing: 'border-box', marginBottom: '16px' },
  priceBreakdown: { backgroundColor: '#f9f9f7', borderRadius: '10px', padding: '16px', marginBottom: '20px' },
  priceRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '8px', marginBottom: '8px' },
  priceLabel: { fontSize: '13px', color: '#777', fontFamily: 'Arial,sans-serif' },
  priceValue: { fontSize: '13px', color: '#333', fontFamily: 'Arial,sans-serif', fontWeight: 'bold' },
  priceTotal: { fontSize: '22px', fontWeight: 'bold', color: '#1a1a1a' },
  dateHint: { fontSize: '13px', color: '#aaa', fontFamily: 'Arial,sans-serif', textAlign: 'center', margin: '0 0 20px' },
  addToCartBtn: { width: '100%', padding: '14px', backgroundColor: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold', marginBottom: '10px', fontFamily: 'Arial,sans-serif' },
  cancelBtn: { width: '100%', padding: '12px', backgroundColor: 'transparent', color: '#888', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', fontFamily: 'Arial,sans-serif' },

  navbar: { backgroundColor: 'white', padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' },
  navTitle: { fontSize: '28px', margin: 0, color: '#333' },
  backButton: { padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' },
  content: { maxWidth: '900px', margin: '20px auto', padding: '0 16px' },
  header: { backgroundColor: 'white', padding: '24px 20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '20px' },
  title: { fontSize: '28px', color: '#333', margin: '0 0 12px 0', wordBreak: 'break-word', overflowWrap: 'break-word', lineHeight: '1.3' },
  metadata: { display: 'flex', gap: '15px', alignItems: 'center' },
  statusBadge: { padding: '6px 16px', borderRadius: '20px', color: 'white', fontSize: '12px', fontWeight: 'bold', display: 'inline-block' },
  deliveryDate: { fontSize: '14px', color: '#666' },
  bottomActions: { display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '40px' },
  sealButtonBottom: { width: '100%', padding: '18px', backgroundColor: '#1a1a1a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold' },
  viewCartBtn: { width: '100%', padding: '18px', backgroundColor: '#f59e0b', color: '#1a1a1a', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' },
  editButtonBottom: { width: '100%', padding: '14px', backgroundColor: 'white', color: '#333', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: 'bold' },
  section: { backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '30px' },
  sectionTitle: { fontSize: '20px', fontWeight: 'bold', color: '#333', marginTop: 0, marginBottom: '20px' },
  messageBox: { padding: '20px', backgroundColor: '#f9f9f9', borderLeft: '4px solid #007bff', borderRadius: '4px' },
  messageText: { fontSize: '16px', color: '#333', lineHeight: '1.8', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' },
  snapshotGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' },
  snapshotItem: { padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '4px', borderLeft: '4px solid #28a745' },
  snapshotLabel: { fontSize: '12px', fontWeight: 'bold', color: '#666', margin: '0 0 8px 0', textTransform: 'uppercase' },
  snapshotValue: { fontSize: '16px', color: '#333', margin: 0, fontWeight: 'bold' },
  futureVisionBox: { marginTop: '30px', padding: '20px', backgroundColor: '#f0f7ff', borderRadius: '4px', borderLeft: '4px solid #007bff' },
  futureVisionTitle: { fontSize: '14px', fontWeight: 'bold', color: '#0056b3', margin: '0 0 10px 0' },
  futureVisionText: { fontSize: '16px', color: '#333', lineHeight: '1.8', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' },
  createdDate: { fontSize: '12px', color: '#999', textAlign: 'center', margin: 0 },
  error: { backgroundColor: '#f8d7da', color: '#721c24', padding: '15px', borderRadius: '4px', marginTop: '20px' },
  errorText: { fontSize: '16px', color: '#666', textAlign: 'center', padding: '40px' },
}
