import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [capsules, setCapsules] = useState([])
  const [loading, setLoading] = useState(true)
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    const checkUserAndFetchCapsules = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)

      // Fetch user's capsules
      const { data: capsuleData, error } = await supabase
        .from('capsules')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching capsules:', error)
      } else {
        setCapsules(capsuleData || [])
      }

      setLoading(false)
    }
    checkUserAndFetchCapsules()
  }, [router])

  const handleLogout = async () => {
    setLoggingOut(true)
    await supabase.auth.signOut()
    router.push('/login')
  }

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

  if (loading) {
    return <div style={styles.loading}>Loading...</div>
  }

  return (
    <div style={styles.container}>
      <div style={styles.navbar}>
        <h1 style={styles.navTitle}>The Letter</h1>
        <button onClick={handleLogout} style={styles.logoutButton} disabled={loggingOut}>
          {loggingOut ? 'Logging out...' : 'Logout'}
        </button>
      </div>

      <div style={styles.content}>
        <div style={styles.header}>
          <div>
            <h2 style={styles.welcome}>Welcome, {user?.email}</h2>
            <p style={styles.subtitle}>Your time capsules</p>
          </div>
          <button
            onClick={() => router.push('/create')}
            style={styles.createButton}
          >
            + Create New Capsule
          </button>
        </div>

        {capsules.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>You haven't created any capsules yet.</p>
            <button
              onClick={() => router.push('/create')}
              style={styles.createButtonSecondary}
            >
              Create your first capsule
            </button>
          </div>
        ) : (
          <div style={styles.capsulesGrid}>
            {capsules.map((capsule) => (
              <div key={capsule.id} style={styles.capsuleCard}>
                <div style={styles.capsuleHeader}>
                  <h3 style={styles.capsuleTitle}>{capsule.title}</h3>
                  <span
                    style={{
                      ...styles.statusBadge,
                      backgroundColor: getStatusColor(capsule.status),
                    }}
                  >
                    {capsule.status.charAt(0).toUpperCase() + capsule.status.slice(1)}
                  </span>
                </div>

                <div style={styles.capsuleBody}>
                  <p style={styles.capsuleField}>
                    <strong>Delivery Date:</strong> {formatDate(capsule.deliver_at)}
                  </p>

                  {capsule.age && (
                    <p style={styles.capsuleField}>
                      <strong>Age:</strong> {capsule.age}
                    </p>
                  )}

                  {capsule.city && (
                    <p style={styles.capsuleField}>
                      <strong>City:</strong> {capsule.city}
                    </p>
                  )}

                  {capsule.personality_words && capsule.personality_words.length > 0 && (
                    <p style={styles.capsuleField}>
                      <strong>Personality:</strong> {capsule.personality_words.join(', ')}
                    </p>
                  )}

                  <p style={styles.message}>
                    {capsule.message.substring(0, 100)}
                    {capsule.message.length > 100 ? '...' : ''}
                  </p>
                </div>

                <div style={styles.capsuleFooter}>
                  <button
                    onClick={() => router.push(`/capsule/${capsule.id}`)}
                    style={styles.viewButton}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
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
  logoutButton: {
    padding: '10px 20px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  content: {
    maxWidth: '1200px',
    margin: '40px auto',
    padding: '0 20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '40px',
  },
  welcome: {
    fontSize: '24px',
    color: '#333',
    marginTop: 0,
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
    margin: 0,
  },
  createButton: {
    padding: '12px 24px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  createButtonSecondary: {
    padding: '12px 24px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '20px',
  },
  emptyState: {
    backgroundColor: 'white',
    padding: '60px 40px',
    borderRadius: '8px',
    textAlign: 'center',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  },
  emptyText: {
    fontSize: '18px',
    color: '#666',
    marginBottom: '20px',
  },
  capsulesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '20px',
  },
  capsuleCard: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  capsuleHeader: {
    padding: '20px',
    borderBottom: '1px solid #eee',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '10px',
  },
  capsuleTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333',
    margin: 0,
    flex: 1,
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '20px',
    color: 'white',
    fontSize: '12px',
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
  },
  capsuleBody: {
    padding: '20px',
    flex: 1,
  },
  capsuleField: {
    fontSize: '14px',
    color: '#666',
    margin: '8px 0',
  },
  message: {
    fontSize: '14px',
    color: '#333',
    lineHeight: '1.5',
    marginTop: '15px',
    fontStyle: 'italic',
  },
  capsuleFooter: {
    padding: '15px 20px',
    borderTop: '1px solid #eee',
    display: 'flex',
    gap: '10px',
  },
  viewButton: {
    flex: 1,
    padding: '10px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
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
}
