import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'

export default function CapsuleDetail() {
  const router = useRouter()
  const { id } = router.query
  const [user, setUser] = useState(null)
  const [capsule, setCapsule] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const checkUserAndFetchCapsule = async () => {
      try {
        console.log('=== Capsule Details Page Load ===')
        console.log('Capsule ID from URL:', id)

        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
          console.log('Auth error or no user, redirecting to login')
          router.push('/login')
          return
        }

        console.log('User authenticated:', user.id)
        setUser(user)

        if (!id) {
          console.log('No ID in URL yet')
          return
        }

        console.log('Fetching capsule:', id)

        // Fetch capsule (using array response to avoid .single() error)
        const { data: capsuleArray, error: capsuleError } = await supabase
          .from('capsules')
          .select('*')
          .eq('id', id)
          .eq('user_id', user.id)

        console.log('Supabase error:', capsuleError)
        console.log('Supabase response (array):', capsuleArray)
        console.log('Response length:', capsuleArray?.length)

        if (capsuleError) {
          console.error('Capsule fetch error:', capsuleError.message)
          setError(`Failed to load capsule: ${capsuleError.message}`)
        } else if (!capsuleArray || capsuleArray.length === 0) {
          console.error('Capsule not found:', id)
          setError(`Capsule not found. ID: ${id}`)
        } else if (capsuleArray.length > 1) {
          console.error('Multiple capsules found:', id)
          setError('Database error: multiple capsules with same ID')
        } else {
          const capsuleData = capsuleArray[0]
          console.log('Capsule loaded successfully:', {
            id: capsuleData.id,
            title: capsuleData.title,
            status: capsuleData.status,
            user_id: capsuleData.user_id,
          })
          console.log('Button visibility: status === "draft"?', capsuleData.status === 'draft')
          setCapsule(capsuleData)
        }

        setLoading(false)
      } catch (err) {
        console.error('Error in checkUserAndFetchCapsule:', err)
        setError(`An error occurred: ${err.message}`)
        setLoading(false)
      }
    }

    checkUserAndFetchCapsule()
  }, [router, id])

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft':
        return '#ffc107'
      case 'sealed':
        return '#17a2b8'
      case 'delivered':
        return '#28a745'
      default:
        return '#6c757d'
    }
  }

  // Check if capsule is draft (case-insensitive and trim spaces)
  const isDraft = capsule?.status?.toLowerCase?.()?.trim?.() === 'draft'

  // Debug logging for status
  if (capsule) {
    console.log('Status comparison debug:')
    console.log('  Raw status:', JSON.stringify(capsule.status))
    console.log('  Lowercased:', JSON.stringify(capsule.status?.toLowerCase?.()))
    console.log('  isDraft result:', isDraft)
  }

  if (loading) {
    return <div style={styles.loading}>Loading...</div>
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.navbar}>
          <h1 style={styles.navTitle}>The Letter</h1>
          <button onClick={() => router.push('/dashboard')} style={styles.backButton}>
            ← Back to Dashboard
          </button>
        </div>
        <div style={styles.content}>
          <div style={styles.error}>{error}</div>
        </div>
      </div>
    )
  }

  if (!capsule) {
    return (
      <div style={styles.container}>
        <div style={styles.navbar}>
          <h1 style={styles.navTitle}>The Letter</h1>
          <button onClick={() => router.push('/dashboard')} style={styles.backButton}>
            ← Back to Dashboard
          </button>
        </div>
        <div style={styles.content}>
          <p style={styles.errorText}>Capsule not found</p>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.navbar}>
        <h1 style={styles.navTitle}>The Letter</h1>
        <button onClick={() => router.push('/dashboard')} style={styles.backButton}>
          ← Back to Dashboard
        </button>
      </div>

      <div style={styles.content}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>{capsule.title}</h1>
            <div style={styles.metadata}>
              <span
                style={{
                  ...styles.statusBadge,
                  backgroundColor: getStatusColor(capsule.status),
                }}
              >
                {capsule.status.charAt(0).toUpperCase() + capsule.status.slice(1)}
              </span>
              <span style={styles.deliveryDate}>
                Delivery: {formatDate(capsule.deliver_at)}
              </span>
            </div>
          </div>

          {isDraft ? (
            <div style={styles.buttonGroup}>
              <button
                onClick={() => router.push(`/capsule/${capsule.id}/edit`)}
                style={styles.editButton}
              >
                Edit
              </button>
              <button
                onClick={() => router.push(`/capsule/${capsule.id}/seal`)}
                style={styles.sealButton}
              >
                Seal & Pay
              </button>
            </div>
          ) : (
            <div style={styles.debugInfo}>
              <p style={styles.debugText}>
                Status: {JSON.stringify(capsule.status)} (expected "draft")
              </p>
              <p style={styles.debugText}>
                isDraft check: {String(isDraft)}
              </p>
            </div>
          )}
        </div>

        {/* Main Message */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Your Message</h2>
          <div style={styles.messageBox}>
            <p style={styles.messageText}>{capsule.message}</p>
          </div>
        </div>

        {/* Snapshot Data */}
        {(capsule.age ||
          capsule.city ||
          capsule.favorite_song ||
          capsule.favorite_show ||
          capsule.future_vision ||
          (capsule.personality_words && capsule.personality_words.length > 0)) && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Snapshot of You</h2>
            <div style={styles.snapshotGrid}>
              {capsule.age && (
                <div style={styles.snapshotItem}>
                  <h3 style={styles.snapshotLabel}>Age</h3>
                  <p style={styles.snapshotValue}>{capsule.age}</p>
                </div>
              )}

              {capsule.city && (
                <div style={styles.snapshotItem}>
                  <h3 style={styles.snapshotLabel}>City</h3>
                  <p style={styles.snapshotValue}>{capsule.city}</p>
                </div>
              )}

              {capsule.favorite_song && (
                <div style={styles.snapshotItem}>
                  <h3 style={styles.snapshotLabel}>Favorite Song</h3>
                  <p style={styles.snapshotValue}>{capsule.favorite_song}</p>
                </div>
              )}

              {capsule.favorite_show && (
                <div style={styles.snapshotItem}>
                  <h3 style={styles.snapshotLabel}>Favorite Show</h3>
                  <p style={styles.snapshotValue}>{capsule.favorite_show}</p>
                </div>
              )}

              {capsule.personality_words && capsule.personality_words.length > 0 && (
                <div style={styles.snapshotItem}>
                  <h3 style={styles.snapshotLabel}>Personality</h3>
                  <p style={styles.snapshotValue}>
                    {capsule.personality_words.join(', ')}
                  </p>
                </div>
              )}
            </div>

            {capsule.future_vision && (
              <div style={styles.futureVisionBox}>
                <h3 style={styles.futureVisionTitle}>Your Future Vision</h3>
                <p style={styles.futureVisionText}>{capsule.future_vision}</p>
              </div>
            )}
          </div>
        )}

        {/* Created Date */}
        <div style={styles.section}>
          <p style={styles.createdDate}>
            Created on {formatDate(capsule.created_at)}
          </p>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    fontFamily: 'Arial, sans-serif',
  },
  navbar: {
    backgroundColor: 'white',
    padding: '20px 40px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  },
  navTitle: {
    fontSize: '28px',
    margin: 0,
    color: '#333',
  },
  backButton: {
    padding: '10px 20px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  content: {
    maxWidth: '900px',
    margin: '40px auto',
    padding: '0 20px',
  },
  header: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    marginBottom: '30px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '30px',
  },
  title: {
    fontSize: '36px',
    color: '#333',
    margin: '0 0 15px 0',
  },
  metadata: {
    display: 'flex',
    gap: '15px',
    alignItems: 'center',
  },
  statusBadge: {
    padding: '6px 16px',
    borderRadius: '20px',
    color: 'white',
    fontSize: '12px',
    fontWeight: 'bold',
    display: 'inline-block',
  },
  deliveryDate: {
    fontSize: '14px',
    color: '#666',
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    flexDirection: 'column',
    minWidth: '150px',
  },
  editButton: {
    padding: '12px 24px',
    backgroundColor: '#17a2b8',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  sealButton: {
    padding: '12px 24px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    marginBottom: '30px',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#333',
    marginTop: 0,
    marginBottom: '20px',
  },
  messageBox: {
    padding: '20px',
    backgroundColor: '#f9f9f9',
    borderLeft: '4px solid #007bff',
    borderRadius: '4px',
  },
  messageText: {
    fontSize: '16px',
    color: '#333',
    lineHeight: '1.8',
    margin: 0,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  snapshotGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '20px',
  },
  snapshotItem: {
    padding: '15px',
    backgroundColor: '#f9f9f9',
    borderRadius: '4px',
    borderLeft: '4px solid #28a745',
  },
  snapshotLabel: {
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#666',
    margin: '0 0 8px 0',
    textTransform: 'uppercase',
  },
  snapshotValue: {
    fontSize: '16px',
    color: '#333',
    margin: 0,
    fontWeight: 'bold',
  },
  futureVisionBox: {
    marginTop: '30px',
    padding: '20px',
    backgroundColor: '#f0f7ff',
    borderRadius: '4px',
    borderLeft: '4px solid #007bff',
  },
  futureVisionTitle: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#0056b3',
    margin: '0 0 10px 0',
  },
  futureVisionText: {
    fontSize: '16px',
    color: '#333',
    lineHeight: '1.8',
    margin: 0,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  createdDate: {
    fontSize: '12px',
    color: '#999',
    textAlign: 'center',
    margin: 0,
  },
  error: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '15px',
    borderRadius: '4px',
    marginTop: '20px',
  },
  errorText: {
    fontSize: '16px',
    color: '#666',
    textAlign: 'center',
    padding: '40px',
  },
  loading: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    color: '#666',
    fontFamily: 'Arial, sans-serif',
  },
  debugInfo: {
    padding: '15px',
    backgroundColor: '#e7f3ff',
    borderLeft: '4px solid #2196F3',
    borderRadius: '4px',
    marginTop: '10px',
  },
  debugText: {
    fontSize: '13px',
    color: '#1976D2',
    margin: 0,
    fontFamily: 'monospace',
  },
}
