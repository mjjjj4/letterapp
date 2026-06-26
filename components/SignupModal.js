import { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'

const WINE = '#952323'
const CHARCOAL = '#393232'
const F = { serif: "'Lora','Georgia',serif", sans: "'Inter',Arial,sans-serif" }

export default function SignupModal({ onClose }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password !== confirmPw) return setError('Passwords do not match')
    if (password.length < 6) return setError('Password must be at least 6 characters')
    setLoading(true)
    const { data, err } = await supabase.auth.signUp({ email, password })
    if (err) { setError(err.message); setLoading(false); return }
    if (data?.user) {
      await supabase.from('users').insert([{ id: data.user.id, email: data.user.email }]).catch(() => {})
    }
    router.push(`/verify?email=${encodeURIComponent(email)}`)
  }

  return (
    <div style={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={s.modal}>
        <button onClick={onClose} style={s.closeBtn} aria-label="Close">✕</button>
        <div style={s.icon}>✉</div>
        <h2 style={s.title}>Create your account</h2>
        <p style={s.sub}>Your first capsule is waiting to be written.</p>
        <form onSubmit={handleSubmit} style={s.form}>
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
            type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
            style={s.input} placeholder="Repeat your password"
            required disabled={loading}
          />
          <button type="submit" style={{ ...s.submit, opacity: loading ? 0.65 : 1 }} disabled={loading}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
          <p style={s.charity}>
            💛 5% of every capsule goes to the{' '}
            <a href="https://nationalpcf.org" target="_blank" rel="noopener noreferrer" style={s.charityLink}>
              National Pediatric Cancer Foundation
            </a>
          </p>
        </form>
        <p style={s.footer}>
          Already have an account?{' '}
          <span onClick={() => { onClose(); router.push('/login') }} style={s.footerLink}>Sign in</span>
        </p>
      </div>
    </div>
  )
}

const s = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 2000,
    backgroundColor: 'rgba(57,50,50,0.65)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
  },
  modal: {
    backgroundColor: '#fff', borderRadius: 16, padding: '40px 36px',
    width: '100%', maxWidth: 420, position: 'relative',
    maxHeight: '90vh', overflowY: 'auto',
    boxShadow: '0 20px 60px rgba(57,50,50,0.25)',
  },
  closeBtn: {
    position: 'absolute', top: 16, right: 16,
    background: 'transparent', border: 'none', fontSize: 20,
    color: '#bbb', padding: 4, lineHeight: 1,
  },
  icon: { fontSize: 36, textAlign: 'center', marginBottom: 14 },
  title: {
    fontFamily: F.serif, fontSize: 24, fontWeight: 700,
    color: CHARCOAL, textAlign: 'center', marginBottom: 6,
  },
  sub: {
    fontSize: 14, color: '#888', textAlign: 'center',
    marginBottom: 24, lineHeight: 1.5, fontFamily: F.sans,
  },
  form: { display: 'flex', flexDirection: 'column', gap: 4 },
  label: {
    fontSize: 13, fontWeight: 600, color: CHARCOAL,
    marginBottom: 4, marginTop: 12, fontFamily: F.sans,
  },
  input: {
    width: '100%', padding: '11px 14px',
    border: '1.5px solid #EDBFC6', borderRadius: 8,
    fontSize: 14, fontFamily: F.sans, outline: 'none', backgroundColor: '#fff',
  },
  error: {
    backgroundColor: '#fdf2f2', color: '#8a2323',
    padding: '10px 14px', borderRadius: 8,
    fontSize: 13, marginTop: 8, fontFamily: F.sans,
  },
  submit: {
    marginTop: 20, padding: 13, width: '100%',
    backgroundColor: WINE, color: '#fff', border: 'none',
    borderRadius: 8, fontSize: 15, fontWeight: 600,
    fontFamily: F.sans,
  },
  footer: { textAlign: 'center', marginTop: 18, fontSize: 13, color: '#888', fontFamily: F.sans },
  footerLink: { color: WINE, cursor: 'pointer', fontWeight: 600 },
  charity: {
    marginTop: 14, fontSize: 11, color: '#999',
    textAlign: 'center', fontFamily: F.sans, lineHeight: 1.5,
  },
  charityLink: { color: WINE, textDecoration: 'none', fontWeight: 600 },
}
