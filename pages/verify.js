import { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'

export default function Verify() {
  const router = useRouter()
  const { email } = router.query
  const [resendStatus, setResendStatus] = useState(null) // null | 'sending' | 'sent' | 'error'

  const handleResend = async () => {
    if (!email) return
    setResendStatus('sending')

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    })

    if (error) {
      console.error('Resend error:', error.message)
      setResendStatus('error')
    } else {
      setResendStatus('sent')
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>

        <div style={styles.iconWrap}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="48" height="48" rx="24" fill="#EBF4FF"/>
            <path d="M10 16a2 2 0 012-2h24a2 2 0 012 2v16a2 2 0 01-2 2H12a2 2 0 01-2-2V16z" stroke="#3B82F6" strokeWidth="2" fill="none"/>
            <path d="M10 16l14 10 14-10" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>

        <h1 style={styles.title}>Check your email</h1>

        <p style={styles.body}>
          We sent a verification link to:
        </p>

        <p style={styles.email}>{email || 'your email address'}</p>

        <p style={styles.body}>
          Click the link in that email to confirm your account. You won't be able to log in until your email is verified.
        </p>

        <div style={styles.spamNote}>
          <span style={styles.spamIcon}>📁</span>
          <span>Don't see it? Check your <strong>spam or junk folder</strong>.</span>
        </div>

        {/* Resend button */}
        <button
          onClick={handleResend}
          style={{
            ...styles.resendButton,
            opacity: resendStatus === 'sending' ? 0.6 : 1,
          }}
          disabled={resendStatus === 'sending' || resendStatus === 'sent'}
        >
          {resendStatus === 'sending' && 'Sending...'}
          {resendStatus === 'sent' && '✓ Email resent'}
          {resendStatus === 'error' && 'Try again'}
          {resendStatus === null && 'Resend verification email'}
        </button>

        {resendStatus === 'sent' && (
          <p style={styles.successNote}>
            A new verification email is on its way.
          </p>
        )}

        {resendStatus === 'error' && (
          <p style={styles.errorNote}>
            Something went wrong. Please try again or contact support.
          </p>
        )}

        <div style={styles.divider} />

        <p style={styles.footer}>
          Already verified?{' '}
          <a href="/login" style={styles.link}>Log in here →</a>
        </p>

        <p style={styles.footer}>
          Wrong email?{' '}
          <a href="/signup" style={styles.link}>Sign up again</a>
        </p>

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
  card: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 2px 16px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '420px',
    textAlign: 'center',
  },
  iconWrap: {
    marginBottom: '20px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1a1a2e',
    margin: '0 0 16px',
  },
  body: {
    fontSize: '15px',
    color: '#555',
    lineHeight: '1.6',
    margin: '0 0 8px',
  },
  email: {
    fontSize: '15px',
    fontWeight: 'bold',
    color: '#1a1a2e',
    backgroundColor: '#f0f4ff',
    padding: '10px 16px',
    borderRadius: '6px',
    margin: '4px 0 16px',
    wordBreak: 'break-all',
  },
  spamNote: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#fffbeb',
    border: '1px solid #fde68a',
    borderRadius: '6px',
    padding: '12px 16px',
    fontSize: '13px',
    color: '#78350f',
    textAlign: 'left',
    margin: '16px 0 24px',
  },
  spamIcon: {
    fontSize: '16px',
    flexShrink: 0,
  },
  resendButton: {
    width: '100%',
    padding: '12px',
    backgroundColor: 'white',
    color: '#3B82F6',
    border: '2px solid #3B82F6',
    borderRadius: '6px',
    fontSize: '15px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  successNote: {
    fontSize: '13px',
    color: '#16a34a',
    marginTop: '10px',
  },
  errorNote: {
    fontSize: '13px',
    color: '#dc2626',
    marginTop: '10px',
  },
  divider: {
    borderTop: '1px solid #eee',
    margin: '28px 0 20px',
  },
  footer: {
    fontSize: '14px',
    color: '#888',
    margin: '0 0 10px',
  },
  link: {
    color: '#3B82F6',
    textDecoration: 'none',
    fontWeight: 'bold',
  },
}
