import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { supabase } from '../lib/supabase'
import SiteNav from '../components/SiteNav'
import SiteFooter from '../components/SiteFooter'

const WINE = '#952323'
const CREAM = '#FFE6E1'
const BLUSH = '#EDBFC6'
const CHARCOAL = '#393232'
const F = { serif: "'Lora','Georgia',serif", sans: "'Inter',Arial,sans-serif" }

export default function Verify() {
  const router = useRouter()
  const { email } = router.query
  const [resendStatus, setResendStatus] = useState(null)

  const handleResend = async () => {
    if (!email) return
    setResendStatus('sending')
    const { error } = await supabase.auth.resend({ type: 'signup', email })
    setResendStatus(error ? 'error' : 'sent')
  }

  return (
    <>
      <Head>
        <title>Check your email — The Letter</title>
      </Head>

      <SiteNav />

      <main style={s.main}>
        <div style={s.card}>
          <div style={s.iconWrap}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="48" height="48" rx="24" fill="#fdf0ee"/>
              <path d="M10 16a2 2 0 012-2h24a2 2 0 012 2v16a2 2 0 01-2 2H12a2 2 0 01-2-2V16z" stroke={WINE} strokeWidth="2" fill="none"/>
              <path d="M10 16l14 10 14-10" stroke={WINE} strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>

          <h1 style={s.title}>Check your email</h1>

          <p style={s.body}>We sent a verification link to:</p>
          <p style={s.email}>{email || 'your email address'}</p>
          <p style={s.body}>Click the link in that email to confirm your account.</p>

          <div style={s.spamNote}>
            <span style={s.spamIcon}>📁</span>
            <span>Don&rsquo;t see it? Check your <strong>spam or junk folder</strong>.</span>
          </div>

          <button
            onClick={handleResend}
            style={{ ...s.resendBtn, opacity: resendStatus === 'sending' ? 0.6 : 1 }}
            disabled={resendStatus === 'sending' || resendStatus === 'sent'}
          >
            {resendStatus === 'sending' && 'Sending…'}
            {resendStatus === 'sent' && '✓ Email resent'}
            {resendStatus === 'error' && 'Try again'}
            {resendStatus === null && 'Resend verification email'}
          </button>

          {resendStatus === 'sent' && (
            <p style={s.successNote}>A new verification email is on its way.</p>
          )}
          {resendStatus === 'error' && (
            <p style={s.errorNote}>Something went wrong. Please try again.</p>
          )}

          <div style={s.divider} />

          <p style={s.footer}>
            Already verified?{' '}
            <a href="/login" style={s.link}>Sign in →</a>
          </p>
          <p style={s.footer}>
            Wrong email?{' '}
            <a href="/signup" style={s.link}>Sign up again</a>
          </p>
        </div>
      </main>

      <SiteFooter />
    </>
  )
}

const s = {
  main: {
    minHeight: 'calc(100vh - 64px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    backgroundColor: CREAM, padding: '40px 20px',
  },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: '44px 40px',
    width: '100%', maxWidth: 440, textAlign: 'center',
    boxShadow: '0 8px 40px rgba(149,35,35,0.08)',
    border: `1px solid ${BLUSH}`,
  },
  iconWrap: { marginBottom: 20 },
  title: {
    fontFamily: F.serif, fontSize: 26, fontWeight: 700,
    color: CHARCOAL, margin: '0 0 14px',
  },
  body: { fontFamily: F.sans, fontSize: 15, color: '#666', lineHeight: 1.6, margin: '0 0 6px' },
  email: {
    fontFamily: F.sans, fontSize: 15, fontWeight: 700, color: CHARCOAL,
    backgroundColor: `${BLUSH}33`, padding: '10px 16px',
    borderRadius: 6, margin: '4px 0 14px', wordBreak: 'break-all',
  },
  spamNote: {
    display: 'flex', alignItems: 'center', gap: 8,
    backgroundColor: '#fffbeb', border: '1px solid #fde68a',
    borderRadius: 6, padding: '12px 16px', fontSize: 13, color: '#78350f',
    textAlign: 'left', margin: '16px 0 24px',
  },
  spamIcon: { fontSize: 16, flexShrink: 0 },
  resendBtn: {
    width: '100%', padding: 12,
    backgroundColor: 'transparent', color: WINE,
    border: `2px solid ${WINE}`, borderRadius: 8,
    fontSize: 15, fontWeight: 600, fontFamily: F.sans,
  },
  successNote: { fontFamily: F.sans, fontSize: 13, color: '#16a34a', marginTop: 10 },
  errorNote: { fontFamily: F.sans, fontSize: 13, color: '#dc2626', marginTop: 10 },
  divider: { borderTop: `1px solid ${BLUSH}`, margin: '28px 0 20px' },
  footer: { fontFamily: F.sans, fontSize: 14, color: '#888', margin: '0 0 10px' },
  link: { color: WINE, textDecoration: 'none', fontWeight: 600 },
}
