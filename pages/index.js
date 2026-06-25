import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { supabase } from '../lib/supabase'

export default function Home() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [modalError, setModalError] = useState('')
  const [modalLoading, setModalLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
  }, [])

  const openModal = () => {
    setShowModal(true)
    setMenuOpen(false)
    setModalError('')
    setEmail('')
    setPassword('')
    setConfirmPw('')
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setModalError('')
    if (password !== confirmPw) return setModalError('Passwords do not match')
    if (password.length < 6) return setModalError('Password must be at least 6 characters')
    setModalLoading(true)
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) { setModalError(error.message); setModalLoading(false); return }
    if (data.user) {
      await supabase.from('users').insert([{ id: data.user.id, email: data.user.email }]).catch(() => {})
    }
    router.push(`/verify?email=${encodeURIComponent(email)}`)
  }

  return (
    <>
      <Head>
        <title>The Letter — Messages worth waiting for</title>
        <meta name="description" content="Create a digital time capsule. Write to your future self. We deliver it when you're ready." />
        <meta property="og:title" content="The Letter — Messages worth waiting for" />
        <meta property="og:description" content="Write a letter to your future self. We deliver it when you're ready." />
        <meta property="og:type" content="website" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{css}</style>
      </Head>

      {/* ── Signup Modal ── */}
      {showModal && (
        <div style={m.overlay} onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div style={m.modal}>
            <button onClick={() => setShowModal(false)} style={m.closeBtn} aria-label="Close">✕</button>
            <div style={m.envelopeIcon}>✉</div>
            <h2 style={m.title}>Create your account</h2>
            <p style={m.sub}>Your first capsule is waiting to be written.</p>
            <form onSubmit={handleSignup} style={m.form}>
              {modalError && <div style={m.error}>{modalError}</div>}
              <label style={m.label}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                style={m.input} placeholder="you@example.com" required disabled={modalLoading} autoFocus />
              <label style={m.label}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                style={m.input} placeholder="At least 6 characters" required disabled={modalLoading} />
              <label style={m.label}>Confirm password</label>
              <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
                style={m.input} placeholder="Repeat your password" required disabled={modalLoading} />
              <button type="submit" style={{ ...m.submit, opacity: modalLoading ? 0.6 : 1 }} disabled={modalLoading}>
                {modalLoading ? 'Creating account…' : 'Create account →'}
              </button>
            </form>
            <p style={m.footer}>
              Already have an account?{' '}
              <span onClick={() => { setShowModal(false); router.push('/login') }} style={m.link}>
                Sign in
              </span>
            </p>
          </div>
        </div>
      )}

      {/* ── Mobile menu ── */}
      {menuOpen && (
        <div style={mn.overlay} onClick={() => setMenuOpen(false)}>
          <div style={mn.drawer} onClick={e => e.stopPropagation()}>
            <div style={mn.header}>
              <span style={mn.brand}>The Letter</span>
              <button onClick={() => setMenuOpen(false)} style={mn.closeBtn}>✕</button>
            </div>
            <nav style={mn.links}>
              <a href="/how-it-works" style={mn.link}>How it works</a>
              <a href="/faq" style={mn.link}>FAQ</a>
              <a href="/about" style={mn.link}>About</a>
              <div style={mn.divider} />
              <a href="/privacy" style={mn.linkSmall}>Privacy policy</a>
              <a href="/terms" style={mn.linkSmall}>Terms of service</a>
              <a href="/contact" style={mn.linkSmall}>Contact</a>
              <div style={mn.divider} />
              <a href="/login" style={mn.link}>Sign in</a>
              <button onClick={openModal} style={mn.signUpBtn}>Sign up</button>
            </nav>
          </div>
        </div>
      )}

      {/* ── Fixed Nav ── */}
      <nav style={n.nav}>
        <span style={n.logo} onClick={() => router.push('/')}>The Letter</span>
        <div className="desktop-nav">
          {user ? (
            <button onClick={() => router.push('/dashboard')} style={n.signUpBtn}>
              My Dashboard →
            </button>
          ) : (
            <>
              <button onClick={() => router.push('/login')} style={n.signInBtn}>Sign in</button>
              <button onClick={openModal} style={n.signUpBtn}>Sign up</button>
            </>
          )}
        </div>
        <button className="hamburger-btn" onClick={() => setMenuOpen(true)} style={n.hamburger} aria-label="Menu">
          <span style={n.bar} /><span style={n.bar} /><span style={n.bar} />
        </button>
      </nav>

      {/* ── Hero ── */}
      <section style={h.section}>
        <div style={h.glow1} /><div style={h.glow2} />
        <div style={h.inner}>
          <div style={h.badge}>Time capsule · Est. 2026</div>
          <h1 className="hero-title" style={h.title}>Messages worth<br />waiting for</h1>
          <p className="hero-sub" style={h.sub}>
            Create a capsule. Write a letter to your future self.<br className="desktop-br" />
            We keep it safe until you&rsquo;re ready to open it.
          </p>
          <div style={h.actions}>
            <button onClick={openModal} style={h.cta}>
              Create your first capsule
            </button>
            <button onClick={() => router.push('/how-it-works')} style={h.ghost}>
              How it works →
            </button>
          </div>
          <p style={h.hint}>$1.85/year · No subscription · Delivered to your inbox</p>
        </div>
        <div style={h.scroll}>↓</div>
      </section>

      {/* ── Example Capsules ── */}
      <section className="section-pad" style={ex.section}>
        <div style={ex.inner}>
          <p style={ex.eyebrow}>Real examples</p>
          <h2 style={ex.heading}>What people write about</h2>
          <p style={ex.body}>Every capsule is private. These are the kinds of moments people capture.</p>

          <div className="cards-grid" style={ex.grid}>
            {[
              {
                badge: 'Self', badgeColor: '#f59e0b', badgeBg: '#fffbeb',
                title: '"From age 24 to my wedding day"',
                lines: [100, 85, 95, 60],
                from: null,
                date: 'Opens June 15, 2029', years: '5 years', price: '$9.25',
                tagline: 'A letter to read on the day it all changes.'
              },
              {
                badge: 'Self', badgeColor: '#f59e0b', badgeBg: '#fffbeb',
                title: '"Letter to myself in 10 years"',
                lines: [100, 75, 90, 50, 70],
                from: null,
                date: 'Opens June 25, 2036', years: '10 years', price: '$18.50',
                tagline: 'Will I have made it? Only one way to find out.'
              },
              {
                badge: 'Gift', badgeColor: '#10b981', badgeBg: '#ecfdf5',
                title: '"For your 21st birthday"',
                lines: [100, 80, 60],
                from: 'From: Mom & Dad',
                date: 'Opens in 3 years', years: '3 years', price: '$5.55',
                tagline: 'A message from the people who love you most.'
              },
            ].map((c, i) => (
              <div key={i} style={ex.card}>
                <div style={ex.cardTop}>
                  <span style={{ ...ex.badge, color: c.badgeColor, backgroundColor: c.badgeBg }}>
                    {c.badge}
                  </span>
                  {c.from && <span style={ex.from}>{c.from}</span>}
                </div>
                <h3 style={ex.cardTitle}>{c.title}</h3>
                <div style={ex.preview}>
                  {c.lines.map((w, j) => (
                    <div key={j} style={{ ...ex.line, width: `${w}%` }} />
                  ))}
                </div>
                <p style={ex.tagline}>{c.tagline}</p>
                <div style={ex.meta}>
                  <div style={ex.metaLeft}>
                    <span style={ex.metaDate}>📅 {c.date}</span>
                    <span style={ex.metaYears}>🕐 {c.years} of storage</span>
                  </div>
                  <span style={ex.price}>{c.price}</span>
                </div>
              </div>
            ))}
          </div>

          <div style={ex.cta}>
            <button onClick={openModal} style={ex.ctaBtn}>Write your first capsule →</button>
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="section-pad" style={pr.section}>
        <div style={pr.inner}>
          <p style={pr.eyebrow}>Pricing</p>
          <h2 style={pr.heading}>Pay once. Keep it safe forever.</h2>
          <p style={pr.sub}>Storage cost is simple: <strong>$1.85 per year</strong> until delivery. That's it.</p>

          <div style={pr.tableWrap}>
            <table className="pricing-table" style={pr.table}>
              <thead>
                <tr style={pr.thead}>
                  <th style={pr.th}>Delivery</th>
                  <th style={pr.th}>Years</th>
                  <th style={pr.th}>Total cost</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: '1 year from now', years: 1, cost: '$1.85' },
                  { label: '2 years from now', years: 2, cost: '$3.70' },
                  { label: '5 years from now', years: 5, cost: '$9.25' },
                  { label: '10 years from now', years: 10, cost: '$18.50' },
                  { label: '20 years from now', years: 20, cost: '$37.00' },
                ].map((row, i) => (
                  <tr key={i} style={{ backgroundColor: i % 2 === 0 ? '#fff' : '#faf9f7' }}>
                    <td style={pr.td}>{row.label}</td>
                    <td style={pr.td}>{row.years} yr{row.years > 1 ? 's' : ''}</td>
                    <td style={{ ...pr.td, fontWeight: 'bold', color: '#1a1a1a' }}>{row.cost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p style={pr.note}>No subscriptions. No hidden fees. One payment, kept safe until the day you chose.</p>

          <div style={pr.coming}>
            <p style={pr.comingTitle}>Coming soon</p>
            <div className="cards-grid-2" style={pr.comingGrid}>
              <div style={pr.comingCard}>
                <span style={pr.comingBadge}>Soon</span>
                <span style={pr.comingText}>Premium snapshot — audio message + extra photos</span>
              </div>
              <div style={pr.comingCard}>
                <span style={pr.comingBadge}>Soon</span>
                <span style={pr.comingText}>Print your letter on a card ($29) or frame ($79)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Social proof ── */}
      <section className="section-pad" style={sp.section}>
        <div style={sp.inner}>
          <div className="stats-row" style={sp.row}>
            <div style={sp.stat}>
              <span style={sp.num}>500+</span>
              <span style={sp.label}>Capsules sealed</span>
            </div>
            <div style={sp.divider} />
            <div style={sp.stat}>
              <span style={sp.num}>1,247</span>
              <span style={sp.label}>Days of memories kept safe</span>
            </div>
            <div style={sp.divider} />
            <div style={sp.stat}>
              <span style={sp.num}>$1.85</span>
              <span style={sp.label}>Per year, forever</span>
            </div>
          </div>
          <p style={sp.tagline}>
            &ldquo;The most meaningful email I&rsquo;ve ever sent — to myself.&rdquo;
          </p>
          <p style={sp.attribution}>— Early user, writing to themselves in 2031</p>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="section-pad" style={ct.section}>
        <div style={ct.inner}>
          <h2 className="hero-title" style={ct.heading}>Ready to write your first capsule?</h2>
          <p style={ct.sub}>It takes 5 minutes. We&rsquo;ll keep it safe.</p>
          <button onClick={openModal} style={ct.btn}>Sign up now — it&rsquo;s free to start</button>
          <p style={ct.hint}>No credit card until you seal &amp; send.</p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={ft.footer}>
        <div style={ft.inner}>
          <div className="footer-cols" style={ft.cols}>
            <div style={ft.brand}>
              <span style={ft.logo}>The Letter</span>
              <p style={ft.tagline}>Messages worth waiting for.</p>
              <p style={ft.email}>hello@theletter.app</p>
            </div>
            <div style={ft.links}>
              <a href="/how-it-works" style={ft.link}>How it works</a>
              <a href="/faq" style={ft.link}>FAQ</a>
              <a href="/about" style={ft.link}>About</a>
              <a href="/contact" style={ft.link}>Contact</a>
            </div>
            <div style={ft.links}>
              <a href="/privacy" style={ft.link}>Privacy policy</a>
              <a href="/terms" style={ft.link}>Terms of service</a>
              <a href="/login" style={ft.link}>Sign in</a>
            </div>
          </div>
          <div style={ft.bottom}>
            <span style={ft.copy}>© 2026 The Letter. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </>
  )
}

// ─── CSS ──────────────────────────────────────────────────────────────────────
const css = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { font-family: Arial, 'Helvetica Neue', sans-serif; background: #fff; }

  .desktop-nav { display: flex; align-items: center; gap: 12px; }
  .hamburger-btn { display: none !important; }
  .cards-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
  .cards-grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
  .hero-title { font-size: 62px; }
  .hero-sub { font-size: 20px; }
  .section-pad { padding: 80px 24px; }
  .desktop-br { display: inline; }
  .stats-row { display: flex; align-items: center; justify-content: center; gap: 40px; }
  .footer-cols { display: flex; gap: 48px; }
  .pricing-table th, .pricing-table td { padding: 16px 20px; font-size: 15px; }

  @media (max-width: 767px) {
    .desktop-nav { display: none !important; }
    .hamburger-btn { display: flex !important; }
    .cards-grid { grid-template-columns: 1fr; }
    .cards-grid-2 { grid-template-columns: 1fr; }
    .hero-title { font-size: 36px; line-height: 1.2; }
    .hero-sub { font-size: 17px; }
    .section-pad { padding: 56px 20px; }
    .desktop-br { display: none; }
    .stats-row { flex-direction: column; gap: 32px; }
    .footer-cols { flex-direction: column; gap: 32px; }
    .pricing-table th, .pricing-table td { padding: 12px 10px; font-size: 13px; }
  }
`

// ─── Styles ───────────────────────────────────────────────────────────────────
const n = {
  nav: { position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', backgroundColor: 'rgba(26,26,26,0.97)', backdropFilter: 'blur(10px)' },
  logo: { fontFamily: "'Georgia','Times New Roman',serif", fontSize: 22, fontWeight: 'bold', color: '#fff', cursor: 'pointer', letterSpacing: '0.3px' },
  signInBtn: { padding: '8px 18px', backgroundColor: 'transparent', color: '#ccc', border: '1px solid #444', borderRadius: 6, fontSize: 14, cursor: 'pointer', fontFamily: 'Arial,sans-serif', transition: 'all 0.15s' },
  signUpBtn: { padding: '8px 20px', backgroundColor: '#f59e0b', color: '#1a1a1a', border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Arial,sans-serif' },
  hamburger: { display: 'flex', flexDirection: 'column', gap: 5, background: 'transparent', border: 'none', cursor: 'pointer', padding: 6 },
  bar: { display: 'block', width: 22, height: 2, backgroundColor: '#fff', borderRadius: 2 },
}

const h = {
  section: { position: 'relative', minHeight: '100vh', backgroundColor: '#1a1a1a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 24px 80px', overflow: 'hidden', textAlign: 'center' },
  glow1: { position: 'absolute', top: '20%', left: '15%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(245,158,11,0.07) 0%, transparent 70%)', pointerEvents: 'none' },
  glow2: { position: 'absolute', bottom: '10%', right: '10%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(245,158,11,0.05) 0%, transparent 70%)', pointerEvents: 'none' },
  inner: { position: 'relative', zIndex: 1, maxWidth: 720 },
  badge: { display: 'inline-block', padding: '4px 14px', backgroundColor: 'rgba(245,158,11,0.15)', color: '#f59e0b', borderRadius: 20, fontSize: 12, fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 28 },
  title: { fontFamily: "'Georgia','Times New Roman',serif", color: '#fff', lineHeight: 1.1, marginBottom: 24 },
  sub: { color: '#a8a29e', lineHeight: 1.7, marginBottom: 40 },
  actions: { display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 24 },
  cta: { padding: '16px 36px', backgroundColor: '#f59e0b', color: '#1a1a1a', border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Arial,sans-serif' },
  ghost: { padding: '16px 28px', backgroundColor: 'transparent', color: '#ccc', border: '1px solid #444', borderRadius: 8, fontSize: 16, cursor: 'pointer', fontFamily: 'Arial,sans-serif' },
  hint: { fontSize: 13, color: '#666', letterSpacing: '0.3px' },
  scroll: { position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)', color: '#444', fontSize: 20, animation: 'bounce 2s infinite' },
}

const ex = {
  section: { backgroundColor: '#faf9f7' },
  inner: { maxWidth: 1100, margin: '0 auto' },
  eyebrow: { fontSize: 12, fontWeight: 'bold', color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: 10 },
  heading: { fontFamily: "'Georgia','Times New Roman',serif", fontSize: 36, color: '#1a1a1a', marginBottom: 12 },
  body: { fontSize: 16, color: '#666', marginBottom: 48, lineHeight: 1.6 },
  grid: { marginBottom: 48 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 28, boxShadow: '0 2px 16px rgba(0,0,0,0.06)', borderLeft: '4px solid #f59e0b', display: 'flex', flexDirection: 'column', gap: 16 },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  badge: { fontSize: 11, fontWeight: 'bold', padding: '3px 10px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.6px' },
  from: { fontSize: 12, color: '#888' },
  cardTitle: { fontFamily: "'Georgia','Times New Roman',serif", fontSize: 18, color: '#1a1a1a', lineHeight: 1.4 },
  preview: { padding: '4px 0', display: 'flex', flexDirection: 'column', gap: 8 },
  line: { height: 9, backgroundColor: '#e8e4de', borderRadius: 4 },
  tagline: { fontSize: 13, color: '#888', fontStyle: 'italic', lineHeight: 1.5 },
  meta: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid #f0ede8', paddingTop: 14 },
  metaLeft: { display: 'flex', flexDirection: 'column', gap: 4 },
  metaDate: { fontSize: 12, color: '#555' },
  metaYears: { fontSize: 12, color: '#888' },
  price: { fontSize: 22, fontWeight: 'bold', color: '#1a1a1a', fontFamily: 'Arial,sans-serif' },
  cta: { textAlign: 'center' },
  ctaBtn: { padding: '14px 36px', backgroundColor: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Arial,sans-serif' },
}

const pr = {
  section: { backgroundColor: '#fff' },
  inner: { maxWidth: 700, margin: '0 auto' },
  eyebrow: { fontSize: 12, fontWeight: 'bold', color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: 10 },
  heading: { fontFamily: "'Georgia','Times New Roman',serif", fontSize: 36, color: '#1a1a1a', marginBottom: 16 },
  sub: { fontSize: 17, color: '#555', marginBottom: 36, lineHeight: 1.7 },
  tableWrap: { borderRadius: 12, overflow: 'hidden', border: '1px solid #e8e4de', marginBottom: 24 },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { backgroundColor: '#1a1a1a' },
  th: { textAlign: 'left', color: '#fff', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.8px' },
  td: { textAlign: 'left', color: '#444', borderBottom: '1px solid #f0ede8' },
  note: { fontSize: 14, color: '#888', lineHeight: 1.6, marginBottom: 40, fontStyle: 'italic' },
  coming: {},
  comingTitle: { fontSize: 12, fontWeight: 'bold', color: '#999', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12 },
  comingGrid: {},
  comingCard: { display: 'flex', alignItems: 'center', gap: 12, backgroundColor: '#faf9f7', border: '1px dashed #ddd', borderRadius: 8, padding: '14px 16px' },
  comingBadge: { fontSize: 10, fontWeight: 'bold', backgroundColor: '#e8e4de', color: '#888', padding: '3px 8px', borderRadius: 4, textTransform: 'uppercase', whiteSpace: 'nowrap' },
  comingText: { fontSize: 13, color: '#666', lineHeight: 1.4 },
}

const sp = {
  section: { backgroundColor: '#1a1a1a' },
  inner: { maxWidth: 860, margin: '0 auto', textAlign: 'center' },
  row: { marginBottom: 48 },
  stat: { display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' },
  num: { fontFamily: "'Georgia','Times New Roman',serif", fontSize: 52, color: '#f59e0b', lineHeight: 1 },
  label: { fontSize: 14, color: '#a8a29e', letterSpacing: '0.3px' },
  divider: { width: 1, height: 60, backgroundColor: '#333' },
  tagline: { fontFamily: "'Georgia','Times New Roman',serif", fontSize: 22, color: '#fff', fontStyle: 'italic', marginBottom: 12, lineHeight: 1.5 },
  attribution: { fontSize: 13, color: '#666' },
}

const ct = {
  section: { background: 'linear-gradient(135deg, #f59e0b 0%, #e08a00 100%)' },
  inner: { maxWidth: 680, margin: '0 auto', textAlign: 'center' },
  heading: { fontFamily: "'Georgia','Times New Roman',serif", color: '#1a1a1a', marginBottom: 16 },
  sub: { fontSize: 18, color: 'rgba(26,26,26,0.7)', marginBottom: 36 },
  btn: { padding: '18px 44px', backgroundColor: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 8, fontSize: 17, fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Arial,sans-serif', marginBottom: 14 },
  hint: { fontSize: 13, color: 'rgba(26,26,26,0.55)' },
}

const ft = {
  footer: { backgroundColor: '#111', padding: '48px 24px 32px' },
  inner: { maxWidth: 1100, margin: '0 auto' },
  cols: { justifyContent: 'space-between', marginBottom: 40 },
  brand: { display: 'flex', flexDirection: 'column', gap: 8 },
  logo: { fontFamily: "'Georgia','Times New Roman',serif", fontSize: 20, color: '#fff', fontWeight: 'bold' },
  tagline: { fontSize: 14, color: '#666', lineHeight: 1.5 },
  email: { fontSize: 13, color: '#555' },
  links: { display: 'flex', flexDirection: 'column', gap: 12 },
  link: { fontSize: 14, color: '#888', textDecoration: 'none', cursor: 'pointer' },
  bottom: { borderTop: '1px solid #222', paddingTop: 24 },
  copy: { fontSize: 12, color: '#555' },
}

const m = {
  overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 },
  modal: { backgroundColor: '#fff', borderRadius: 16, padding: '40px 36px', width: '100%', maxWidth: 420, position: 'relative', maxHeight: '90vh', overflowY: 'auto' },
  closeBtn: { position: 'absolute', top: 16, right: 16, background: 'transparent', border: 'none', fontSize: 18, cursor: 'pointer', color: '#999', lineHeight: 1, padding: 4 },
  envelopeIcon: { fontSize: 36, textAlign: 'center', marginBottom: 16 },
  title: { fontFamily: "'Georgia','Times New Roman',serif", fontSize: 24, color: '#1a1a1a', textAlign: 'center', marginBottom: 6 },
  sub: { fontSize: 14, color: '#888', textAlign: 'center', marginBottom: 24, lineHeight: 1.5 },
  form: { display: 'flex', flexDirection: 'column', gap: 4 },
  label: { fontSize: 13, fontWeight: 'bold', color: '#444', marginBottom: 4, marginTop: 12 },
  input: { width: '100%', padding: '11px 14px', border: '1.5px solid #ddd', borderRadius: 8, fontSize: 14, fontFamily: 'Arial,sans-serif', outline: 'none' },
  error: { backgroundColor: '#fef2f2', color: '#991b1b', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 8 },
  submit: { marginTop: 20, padding: '14px', backgroundColor: '#f59e0b', color: '#1a1a1a', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Arial,sans-serif' },
  footer: { textAlign: 'center', marginTop: 20, fontSize: 13, color: '#888' },
  link: { color: '#f59e0b', cursor: 'pointer', fontWeight: 'bold' },
}

const mn = {
  overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1500 },
  drawer: { position: 'absolute', top: 0, right: 0, bottom: 0, width: 280, backgroundColor: '#1a1a1a', display: 'flex', flexDirection: 'column' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 20px 16px', borderBottom: '1px solid #2a2a2a' },
  brand: { fontFamily: "'Georgia','Times New Roman',serif", fontSize: 18, color: '#fff', fontWeight: 'bold' },
  closeBtn: { background: 'transparent', border: 'none', color: '#888', fontSize: 20, cursor: 'pointer' },
  links: { display: 'flex', flexDirection: 'column', padding: '20px', gap: 4, flex: 1, overflowY: 'auto' },
  link: { fontSize: 16, color: '#e8e4de', textDecoration: 'none', padding: '12px 0', borderBottom: '1px solid #2a2a2a' },
  linkSmall: { fontSize: 14, color: '#888', textDecoration: 'none', padding: '10px 0', borderBottom: '1px solid #222' },
  divider: { height: 1, backgroundColor: '#2a2a2a', margin: '8px 0' },
  signUpBtn: { marginTop: 16, padding: '14px', backgroundColor: '#f59e0b', color: '#1a1a1a', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Arial,sans-serif', textAlign: 'center' },
}
