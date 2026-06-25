import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../../lib/supabase'

export default function SealCapsule() {
  const router = useRouter()
  const { id } = router.query
  const [user, setUser] = useState(null)
  const [capsule, setCapsule] = useState(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const checkUserAndFetchCapsule = async () => {
      try {
        console.log('=== Seal Page Load ===')
        console.log('Capsule ID from URL:', id)

        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          console.log('No user found, redirecting to login')
          router.push('/login')
          return
        }

        console.log('User authenticated:', user.id)
        setUser(user)

        if (!id) {
          console.log('No ID in URL params yet')
          return
        }

        console.log('Fetching capsule with ID:', id, 'for user:', user.id)

        // Fetch capsule
        const { data: capsuleArray, error: capsuleError } = await supabase
          .from('capsules')
          .select('*')
          .eq('id', id)
          .eq('user_id', user.id)

        console.log('Supabase fetch error:', capsuleError)
        console.log('Supabase response (array):', capsuleArray)
        console.log('Response length:', capsuleArray?.length)

        if (capsuleError) {
          const errorMsg = `Capsule fetch error: ${capsuleError.message}`
          console.error(errorMsg)
          setError(errorMsg)
        } else if (capsuleArray && capsuleArray.length > 0) {
          const capsuleData = capsuleArray[0]
          console.log('Capsule loaded:', {
            id: capsuleData.id,
            title: capsuleData.title,
            status: capsuleData.status,
            user_id: capsuleData.user_id,
          })

          if (capsuleData.status !== 'draft') {
            const statusMsg = `This capsule is no longer a draft and cannot be sealed. Current status: ${capsuleData.status}`
            console.error(statusMsg)
            setError(statusMsg)
          } else {
            console.log('Capsule is in draft status, ready to seal')
            setCapsule(capsuleData)
          }
        } else {
          console.error('Capsule data is null')
          setError('Capsule not found')
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

  const handleSealPayment = async () => {
    if (!capsule || !user) {
      setError('Capsule or user information missing')
      return
    }

    console.log('=== Starting Seal Payment ===')
    console.log('Capsule ID:', capsule.id)
    console.log('Capsule Title:', capsule.title)
    console.log('User Email:', user.email)
    console.log('Capsule Status:', capsule.status)
    console.log('================================')

    setProcessing(true)
    setError('')

    try {
      const payload = {
        capsuleId: capsule.id,
        userId: user.id,
        userEmail: user.email,
      }

      console.log('Sending payload to /api/checkout-session:', JSON.stringify(payload))
      console.log('User ID being sent:', user.id)

      // Call the checkout session API
      const response = await fetch('/api/checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      console.log('Response status:', response.status)

      const data = await response.json()

      console.log('Response data:', data)

      if (!response.ok) {
        const errorMessage = data.error || data.message || 'Failed to create checkout session'
        console.error('API Error:', errorMessage)
        setError(errorMessage)
        setProcessing(false)
        return
      }

      // Redirect to Stripe checkout
      if (data.url) {
        console.log('Redirecting to Stripe checkout URL:', data.url)
        window.location.href = data.url
      } else {
        console.error('No checkout URL returned')
        setError('No checkout URL received from server')
        setProcessing(false)
      }
    } catch (err) {
      console.error('Error in handleSealPayment:', err)
      setError(err.message || 'An error occurred while processing your payment')
      setProcessing(false)
    }
  }

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

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.navbar}>
          <h1 style={styles.navTitle}>The Letter</h1>
        </div>
        <div style={styles.content}>
          <div style={styles.errorBox}>
            <p style={styles.errorText}>{error}</p>
            <button onClick={() => router.push('/dashboard')} style={styles.button}>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!capsule) {
    return (
      <div style={styles.container}>
        <div style={styles.navbar}>
          <h1 style={styles.navTitle}>The Letter</h1>
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
        <button onClick={() => router.push(`/capsule/${id}`)} style={styles.backButton}>
          ← Back
        </button>
      </div>

      <div style={styles.content}>
        <div style={styles.card}>
          <h1 style={styles.title}>Seal Your Capsule</h1>

          {error && <div style={styles.error}>{error}</div>}

          <div style={styles.capsulePreview}>
            <h2 style={styles.capsuleTitle}>{capsule.title}</h2>
            <p style={styles.capsuleInfo}>
              <strong>Delivery Date:</strong> {formatDate(capsule.deliver_at)}
            </p>
            <p style={styles.capsuleInfo}>
              <strong>Status:</strong> Draft
            </p>
          </div>

          <div style={styles.benefitsBox}>
            <h3 style={styles.benefitsTitle}>When you seal:</h3>
            <ul style={styles.benefitsList}>
              <li>Your capsule is protected and cannot be edited</li>
              <li>You'll receive a confirmation email</li>
              <li>On the delivery date, you'll get an email with your sealed message</li>
              <li>Your message will be preserved exactly as you wrote it</li>
            </ul>
          </div>

          <div style={styles.buttonGroup}>
            <button
              onClick={() => router.push(`/capsule/${id}`)}
              style={styles.cancelButton}
              disabled={processing}
            >
              Cancel
            </button>
            <button
              onClick={handleSealPayment}
              style={styles.sealButton}
              disabled={processing}
            >
              {processing ? 'Processing...' : 'Proceed to Payment'}
            </button>
          </div>

          <p style={styles.disclaimer}>
            Powered by Stripe. Your payment information is secure and encrypted.
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
    maxWidth: '600px',
    margin: '40px auto',
    padding: '0 20px',
  },
  card: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: '32px',
    color: '#333',
    marginTop: 0,
    marginBottom: '30px',
  },
  error: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '12px',
    borderRadius: '4px',
    marginBottom: '20px',
  },
  errorBox: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  errorText: {
    fontSize: '16px',
    color: '#666',
    marginBottom: '20px',
  },
  capsulePreview: {
    padding: '20px',
    backgroundColor: '#f9f9f9',
    borderRadius: '4px',
    marginBottom: '20px',
    borderLeft: '4px solid #007bff',
  },
  capsuleTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333',
    margin: '0 0 15px 0',
  },
  capsuleInfo: {
    fontSize: '14px',
    color: '#666',
    margin: '8px 0',
  },
  pricingBox: {
    padding: '20px',
    backgroundColor: '#f0f7ff',
    borderRadius: '4px',
    marginBottom: '20px',
    textAlign: 'center',
    borderLeft: '4px solid #007bff',
  },
  pricingLabel: {
    fontSize: '14px',
    color: '#666',
    margin: '0 0 10px 0',
  },
  price: {
    fontSize: '48px',
    fontWeight: 'bold',
    color: '#007bff',
    margin: '10px 0',
  },
  pricingDescription: {
    fontSize: '12px',
    color: '#999',
    margin: '15px 0 0 0',
  },
  benefitsBox: {
    padding: '20px',
    backgroundColor: '#f9f9f9',
    borderRadius: '4px',
    marginBottom: '30px',
  },
  benefitsTitle: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#333',
    margin: '0 0 12px 0',
  },
  benefitsList: {
    fontSize: '14px',
    color: '#666',
    margin: 0,
    paddingLeft: '20px',
    lineHeight: '1.8',
  },
  buttonGroup: {
    display: 'flex',
    gap: '15px',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  cancelButton: {
    padding: '12px 30px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  sealButton: {
    padding: '12px 30px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  disclaimer: {
    fontSize: '12px',
    color: '#999',
    textAlign: 'center',
    margin: 0,
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
  button: {
    padding: '12px 30px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
}
