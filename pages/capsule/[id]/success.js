import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../../lib/supabase'

export default function PaymentSuccess() {
  const router = useRouter()
  const { id } = router.query
  const [capsule, setCapsule] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUserAndFetchCapsule = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          router.push('/login')
          return
        }

        if (!id) return

        // Fetch capsule
        const { data: capsuleData, error: capsuleError } = await supabase
          .from('capsules')
          .select('*')
          .eq('id', id)
          .eq('user_id', user.id)
          .single()

        if (capsuleData) {
          setCapsule(capsuleData)
        }

        setLoading(false)
      } catch (err) {
        console.error('Error:', err)
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

  if (loading) {
    return <div style={styles.loading}>Loading...</div>
  }

  return (
    <div style={styles.container}>
      <div style={styles.navbar}>
        <h1 style={styles.navTitle}>The Letter</h1>
      </div>

      <div style={styles.content}>
        <div style={styles.successCard}>
          <div style={styles.successIcon}>✓</div>
          <h1 style={styles.title}>Capsule Sealed Successfully!</h1>

          {capsule && (
            <>
              <p style={styles.message}>
                Your capsule "<strong>{capsule.title}</strong>" has been sealed and will be delivered on{' '}
                <strong>{formatDate(capsule.deliver_at)}</strong>.
              </p>

              <p style={styles.subtitle}>
                A confirmation email has been sent to your email address. You can view your sealed capsule anytime in your dashboard.
              </p>
            </>
          )}

          <div style={styles.buttonGroup}>
            <button onClick={() => router.push(`/capsule/${id}`)} style={styles.viewButton}>
              View Capsule
            </button>
            <button onClick={() => router.push('/dashboard')} style={styles.dashboardButton}>
              Back to Dashboard
            </button>
          </div>

          <div style={styles.infoBox}>
            <h3 style={styles.infoTitle}>What happens next?</h3>
            <ul style={styles.infoList}>
              <li>Your capsule is now safely sealed and stored</li>
              <li>On the delivery date, you'll receive an email with your sealed message</li>
              <li>You can continue creating more capsules in the meantime</li>
              <li>Your capsule is protected and cannot be edited once sealed</li>
            </ul>
          </div>
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
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  },
  navTitle: {
    fontSize: '28px',
    margin: 0,
    color: '#333',
  },
  content: {
    maxWidth: '600px',
    margin: '60px auto',
    padding: '0 20px',
  },
  successCard: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  successIcon: {
    fontSize: '64px',
    color: '#28a745',
    marginBottom: '20px',
  },
  title: {
    fontSize: '32px',
    color: '#333',
    marginTop: 0,
    marginBottom: '20px',
  },
  message: {
    fontSize: '16px',
    color: '#666',
    lineHeight: '1.6',
    marginBottom: '15px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#999',
    lineHeight: '1.6',
    marginBottom: '30px',
  },
  buttonGroup: {
    display: 'flex',
    gap: '15px',
    justifyContent: 'center',
    marginBottom: '30px',
    flexWrap: 'wrap',
  },
  viewButton: {
    padding: '12px 30px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  dashboardButton: {
    padding: '12px 30px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  infoBox: {
    marginTop: '30px',
    padding: '20px',
    backgroundColor: '#f0f7ff',
    borderRadius: '4px',
    borderLeft: '4px solid #007bff',
    textAlign: 'left',
  },
  infoTitle: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#0056b3',
    marginTop: 0,
    marginBottom: '12px',
  },
  infoList: {
    fontSize: '14px',
    color: '#333',
    margin: 0,
    paddingLeft: '20px',
    lineHeight: '1.8',
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
