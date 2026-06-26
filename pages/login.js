import { useState, useEffect } from 'react'
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

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) router.push('/dashboard')
    })
  }, [router])

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password })
    if (loginError) { setError(loginError.message); setLoading(false); return }
    router.push('/dashboard')
  }

  return (
    <>
      <Head>
        <title>Sign in — The Letter</title>
      </Head>

      <SiteNav />

      <main style={s.main}>
        <div style={s.card}>
          <div style={s.icon}>✉</div>
          <h1 style={s.title}>Welcome back</h1>
          <p style={s.sub}>Sign in to read your capsules or write a new one.</p>

          <form onSubmit={handleLogin} style={s.form}>
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
              style={s.input} placeholder="Your password"
              required disabled={loading}
            />

            <button
              type="submit"
              style={{ ...s.btn, opacity: loading ? 0.65 : 1 }}
              disabled={loading}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p style={s.footer}>
            Don&rsquo;t have an account?{' '}
            <a href="/signup" style={s.footerLink}>Sign up</a>
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
    transition: 'border-color 0.15s',
  },
  error: {
    backgroundColor: '#fdf2f2', color: '#8a2323',
    padding: '10px 14px', borderRadius: 8,
    fontSize: 13, marginBottom: 4, fontFamily: F.sans,
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
