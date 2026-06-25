import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'
import { calcPrice, loadCart, saveCart } from '../../lib/cart'

export default function CapsuleDetail() {
  const router = useRouter()
  const { id } = router.query
  const [user, setUser] = useState(null)
  const [capsule, setCapsule] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cart, setCart] = useState([])

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

  // Add to cart directly (no modal) then navigate to cart
  const addToCart = () => {
    if (!capsule) return
    const existingDate = capsule.deliver_at ? capsule.deliver_at.split('T')[0] : ''
    const pricing = calcPrice(existingDate)
    setCart(prev => {
      const filtered = prev.filter(x => x.capsuleId !== capsule.id)
      return [...filtered, {
        capsuleId: capsule.id,
        title: capsule.title,
        deliveryDate: pricing ? existingDate : '',
        years: pricing ? pricing.years : null,
        price: pricing ? pricing.price : null,
      }]
    })
    router.push('/cart')
  }

  const inCart = capsule && cart.some(x => x.capsuleId === capsule.id)
  const isDraft = capsule?.status === 'draft'

  const navRight = (
    <div style={st.navRight}>
      <button
        onClick={() => router.push('/cart')}
        style={cart.length > 0 ? st.cartBtnActive : st.cartBtnEmpty}
      >
        {cart.length > 0 ? `Cart (${cart.length})` : 'Cart'}
      </button>
      <button onClick={() => router.push('/dashboard')} style={st.backButton}>
        ← Dashboard
      </button>
    </div>
  )

  if (loading) return <div style={st.loading}>Loading...</div>

  if (error) return (
    <div style={st.container}>
      <div style={st.navbar}><h1 style={st.navTitle}>The Letter</h1>{navRight}</div>
      <div style={st.content}><div style={st.error}>{error}</div></div>
    </div>
  )

  if (!capsule) return (
    <div style={st.container}>
      <div style={st.navbar}><h1 style={st.navTitle}>The Letter</h1>{navRight}</div>
      <div style={st.content}><p style={st.errorText}>Capsule not found</p></div>
    </div>
  )

  return (
    <div style={st.container}>
      <div style={st.navbar}>
        <h1 style={st.navTitle}>The Letter</h1>
        {navRight}
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

        {/* Message */}
        <div style={st.section}>
          <h2 style={st.sectionTitle}>Your Message</h2>
          <div style={st.messageBox}>
            <p style={st.messageText}>{capsule.message}</p>
          </div>
        </div>

        {/* Snapshot */}
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

        {/* Actions — draft only */}
        {isDraft && (
          <div style={st.bottomActions}>
            {inCart ? (
              <button onClick={() => router.push('/cart')} style={st.viewCartBtn}>
                In cart — View cart &rarr;
              </button>
            ) : (
              <button onClick={addToCart} style={st.sealButtonBottom}>
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
  navbar: { backgroundColor: 'white', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' },
  navTitle: { fontSize: '24px', margin: 0, color: '#333', fontWeight: 'bold' },
  navRight: { display: 'flex', alignItems: 'center', gap: '10px' },
  cartBtnActive: { padding: '8px 16px', backgroundColor: '#f59e0b', color: '#1a1a1a', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Arial,sans-serif' },
  cartBtnEmpty: { padding: '8px 16px', backgroundColor: 'transparent', color: '#888', border: '1px solid #ccc', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontFamily: 'Arial,sans-serif' },
  backButton: { padding: '8px 16px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' },
  content: { maxWidth: '900px', margin: '20px auto', padding: '0 16px' },
  header: { backgroundColor: 'white', padding: '24px 20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '20px' },
  title: { fontSize: '28px', color: '#333', margin: '0 0 12px 0', wordBreak: 'break-word', lineHeight: '1.3' },
  metadata: { display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' },
  statusBadge: { padding: '6px 16px', borderRadius: '20px', color: 'white', fontSize: '12px', fontWeight: 'bold' },
  deliveryDate: { fontSize: '14px', color: '#666' },
  bottomActions: { display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '40px' },
  sealButtonBottom: { width: '100%', padding: '18px', backgroundColor: '#1a1a1a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold' },
  viewCartBtn: { width: '100%', padding: '18px', backgroundColor: '#f59e0b', color: '#1a1a1a', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' },
  editButtonBottom: { width: '100%', padding: '14px', backgroundColor: 'white', color: '#333', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: 'bold' },
  section: { backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '20px' },
  sectionTitle: { fontSize: '20px', fontWeight: 'bold', color: '#333', marginTop: 0, marginBottom: '20px' },
  messageBox: { padding: '20px', backgroundColor: '#f9f9f9', borderLeft: '4px solid #007bff', borderRadius: '4px' },
  messageText: { fontSize: '16px', color: '#333', lineHeight: '1.8', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' },
  snapshotGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' },
  snapshotItem: { padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '4px', borderLeft: '4px solid #28a745' },
  snapshotLabel: { fontSize: '12px', fontWeight: 'bold', color: '#666', margin: '0 0 8px 0', textTransform: 'uppercase' },
  snapshotValue: { fontSize: '16px', color: '#333', margin: 0, fontWeight: 'bold' },
  futureVisionBox: { marginTop: '20px', padding: '20px', backgroundColor: '#f0f7ff', borderRadius: '4px', borderLeft: '4px solid #007bff' },
  futureVisionTitle: { fontSize: '14px', fontWeight: 'bold', color: '#0056b3', margin: '0 0 10px 0' },
  futureVisionText: { fontSize: '16px', color: '#333', lineHeight: '1.8', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' },
  createdDate: { fontSize: '12px', color: '#999', textAlign: 'center', margin: 0 },
  error: { backgroundColor: '#f8d7da', color: '#721c24', padding: '15px', borderRadius: '4px', marginTop: '20px' },
  errorText: { fontSize: '16px', color: '#666', textAlign: 'center', padding: '40px' },
}
