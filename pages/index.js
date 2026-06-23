import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'

export default function Home() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        router.push('/dashboard')
      } else {
        setUser(null)
        setLoading(false)
      }
    }
    checkUser()
  }, [router])

  if (loading) {
    return <div style={styles.loading}>Loading...</div>
  }

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.title}>Welcome to The Letter</h1>
        <p style={styles.subtitle}>A time capsule app for your thoughts, dreams, and memories.</p>

        <div style={styles.buttonGroup}>
          <button
            onClick={() => router.push('/signup')}
            style={{...styles.button, ...styles.primaryButton}}
          >
            Sign Up
          </button>
          <button
            onClick={() => router.push('/login')}
            style={{...styles.button, ...styles.secondaryButton}}
          >
            Login
          </button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    fontFamily: 'Arial, sans-serif',
    padding: '20px',
  },
  content: {
    textAlign: 'center',
    backgroundColor: 'white',
    padding: '60px 40px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    maxWidth: '500px',
  },
  title: {
    fontSize: '36px',
    color: '#333',
    marginBottom: '15px',
  },
  subtitle: {
    fontSize: '18px',
    color: '#666',
    marginBottom: '40px',
    lineHeight: '1.6',
  },
  buttonGroup: {
    display: 'flex',
    gap: '15px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  button: {
    padding: '12px 30px',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
  primaryButton: {
    backgroundColor: '#007bff',
    color: 'white',
  },
  secondaryButton: {
    backgroundColor: '#6c757d',
    color: 'white',
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
