import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { supabase } from '../lib/supabase'
import SiteNav from '../components/SiteNav'
import SiteFooter from '../components/SiteFooter'

const MAROON = '#4D0000'
const WINE = '#8A2323'
const CREAM = '#FFFBF5'
const BORDER = 'rgba(77, 0, 0, 0.15)'
const INK = '#3A2418'
const MUTED = '#7A6A5A'
const F = { serif: "'Playfair Display','Georgia',serif", sans: "'Inter',Arial,sans-serif" }

export default function Signup() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignup = async (e) => {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) return setError('Passwords do not match')
    if (password.length < 6) return setError('Password must be at least 6 characters')
    setLoading(true)
    try {
      const { data, error: signupError } = await supabase.auth.signUp({ email, password })
      if (signupError) { setError(signupError.message); setLoading(false); return }
      if (data.user) {
        await supabase.from('users').insert([{ id: data.user.id, email: data.user.email }]).catch(() => {})
      }
      router.push(`/verify?email=${encodeURIComponent(email)}`)
    } catch (err) {
      setError(err.message || 'An error occurred')
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Sign up — The Letter</title>
      </Head>

      <SiteNav />

      <main style={s.main}>
        <div style={s.card}>
          <div style={s.icon}>✉</div>
          <h1 style={s.title}>Create your account</h1>
          <p style={s.sub}>Your first capsule is waiting to be written.</p>

          <form onSubmit={handleSignup} style={s.form}>
            {error && <div style={s.error}>{error}</div>}

            <label style={s.label}>Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              style={s.input} placeholder="you@example.com"
              required disabled={loading} autoFocus
            />

            <label style={s.label}>Password</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              style={s.input} placeholder="At least 6 characters"
              required disabled={loading}
            />

            <label style={s.label}>Confirm password</label>
            <input
              type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
              style={s.input} placeholder="Repeat your password"
              required disabled={loading}
            />

            <button
              type="submit"
              style={{ ...s.btn, opacity: loading ? 0.65 : 1 }}
              disabled={loading}
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p style={s.footer}>
            Already have an account?{' '}
            <a href="/login" style={s.footerLink}>Sign in</a>
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
    backgroundColor: CREAM, borderRadius: 10,
    padding: '44px 40px', width: '100%', maxWidth: 420,
    border: `1px solid ${BORDER}`,
  },
  icon: { fontSize: 36, textAlign: 'center', marginBottom: 16 },
  title: {
    fontFamily: F.serif, fontSize: 28, fontWeight: 600,
    color: MAROON, textAlign: 'center', marginBottom: 8,
  },
  sub: {
    fontFamily: F.sans, fontSize: 14, color: MUTED,
    textAlign: 'center', lineHeight: 1.5, marginBottom: 28,
  },
  form: { display: 'flex', flexDirection: 'column', gap: 4 },
  label: {
    fontFamily: F.sans, fontSize: 13, fontWeight: 600,
    color: INK, marginTop: 14, marginBottom: 6,
  },
  input: {
    width: '100%', padding: '12px 14px',
    border: `1.5px solid ${BORDER}`, borderRadius: 8,
    fontSize: 14, fontFamily: F.sans, outline: 'none', backgroundColor: CREAM,
  },
  error: {
    backgroundColor: '#fdf2f2', color: '#8a2323',
    padding: '10px 14px', borderRadius: 8,
    fontSize: 13, marginTop: 8, fontFamily: F.sans,
  },
  btn: {
    marginTop: 22, padding: 14, width: '100%',
    backgroundColor: WINE, color: CREAM, border: 'none',
    borderRadius: 8, fontSize: 15, fontWeight: 600, fontFamily: F.sans,
  },
  footer: {
    textAlign: 'center', marginTop: 20,
    fontSize: 14, color: MUTED, fontFamily: F.sans,
  },
  footerLink: { color: WINE, fontWeight: 600, textDecoration: 'none' },
}
