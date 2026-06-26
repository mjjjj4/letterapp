import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { supabase } from '../lib/supabase'

// ─── Banner data ─────────────────────────────────────────────────────────────
// To swap in real photos: set bg to e.g. 'url(/images/wax-seal.jpg) center/cover no-repeat'
const BANNERS = [
  {
    bg: 'linear-gradient(150deg, #FFE6E1 0%, #EDBFC6 60%, #d9a5b0 100%)',
    overlay: false,
    headline: null,       // Banner 1 has its own special layout
    sub: null,
  },
  {
    bg: 'linear-gradient(160deg, #1e0808 0%, #2c1010 50%, #3d1515 100%)',
    overlay: true,        // placeholder for wax seal photo
    headline: 'Preserve your memories',
    sub: null,
  },
  {
    bg: 'linear-gradient(160deg, #f5e6d0 0%, #e0ccaa 50%, #c8b090 100%)',
    overlay: true,        // placeholder for handwritten letter photo
    headline: 'Write to your future self',
    sub: null,
  },
  {
    bg: 'linear-gradient(160deg, #c8b4a8 0%, #b09888 50%, #c8b4a8 100%)',
    overlay: true,        // placeholder for hands/envelope photo
    headline: "Open it when you're ready",
    sub: null,
  },
]

const TESTIMONIALS = [
  {
    stars: 5,
    quote: 'I wrote a letter to myself for my 30th birthday. When I received it at 40, I cried for an hour.',
    name: 'Sarah M.',
  },
  {
    stars: 5,
    quote: "The most meaningful thing I've ever done — writing to my future self. It changed how I see today.",
    name: 'James K.',
  },
  {
    stars: 5,
    quote: "I sealed one for my daughter's wedding day. She doesn't know it exists yet. I can't wait.",
    name: 'Patricia L.',
  },
  {
    stars: 5,
    quote: 'Simple, beautiful, and it just works. Exactly what it promises to be.',
    name: 'David R.',
  },
]

export default function Home() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [current, setCurrent] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [modalError, setModalError] = useState('')
  const [modalLoading, setModalLoading] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
  }, [])

  const startTimer = useCallback(() => {
    clearInterval(timerRef.current)
    timerRef.current = setInterval(
      () => setCurrent(p => (p + 1) % BANNERS.length),
      5000
    )
  }, [])

  useEffect(() => {
    startTimer()
    return () => clearInterval(timerRef.current)
  }, [startTimer])

  const goTo = useCallback((idx) => {
    setCurrent(idx)
    startTimer()
  }, [startTimer])

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

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <Head>
        <title>The Letter — Messages worth waiting for</title>
        <meta name="description" content="Create a digital time capsule. Write to your future self. We deliver it when you're ready." />
        <meta property="og:title" content="The Letter — Messages worth waiting for" />
        <meta property="og:description" content="Write a letter to your future self. We deliver it when you're ready." />
        <meta property="og:type" content="website" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
        <style>{globalCss}</style>
      </Head>

      {/* ── Signup Modal ────────────────────────────────────────────────────── */}
      {showModal && (
        <div style={m.overlay} onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div style={m.modal}>
            <button onClick={() => setShowModal(false)} style={m.closeBtn} aria-label="Close">✕</button>
            <div style={m.icon}>✉</div>
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
              <button type="submit" style={{ ...m.submit, opacity: modalLoading ? 0.65 : 1 }} disabled={modalLoading}>
                {modalLoading ? 'Creating account…' : 'Create account'}
              </button>
            </form>
            <p style={m.footer}>
              Already have an account?{' '}
              <span onClick={() => { setShowModal(false); router.push('/login') }} style={m.footerLink}>
                Sign in
              </span>
            </p>
          </div>
        </div>
      )}

      {/* ── Mobile Drawer ───────────────────────────────────────────────────── */}
      {menuOpen && (
        <div style={mn.overlay} onClick={() => setMenuOpen(false)}>
          <div style={mn.drawer} onClick={e => e.stopPropagation()}>
            <div style={mn.header}>
              <span style={mn.brand}>The Letter</span>
              <button onClick={() => setMenuOpen(false)} style={mn.closeBtn} aria-label="Close menu">✕</button>
            </div>
            <div style={mn.body}>
              {/* Priority: Sign up + Sign in first */}
              <button onClick={openModal} style={mn.signUpBtn}>Sign up</button>
              <a href="/login" style={mn.signInLink}>Sign in</a>
              <div style={mn.divider} />
              <a href="/how-it-works" style={mn.link}>How it works</a>
              <a href="/faq" style={mn.link}>FAQ</a>
              <a href="/about" style={mn.link}>About</a>
              <a href="/contact" style={mn.link}>Contact</a>
              <div style={mn.divider} />
              <a href="/privacy" style={mn.linkSmall}>Privacy</a>
              <a href="/terms" style={mn.linkSmall}>Terms</a>
            </div>
          </div>
        </div>
      )}

      {/* ── Navigation ──────────────────────────────────────────────────────── */}
      <nav style={n.nav}>
        <span style={n.logo} onClick={() => router.push('/')}>The Letter</span>
        <div className="desktop-nav">
          {user ? (
            <button onClick={() => router.push('/dashboard')} style={n.signUpBtn}>My Dashboard →</button>
          ) : (
            <>
              <button onClick={openModal} style={n.signUpBtn}>Sign up</button>
              <span onClick={() => router.push('/login')} style={n.signInLink}>Sign in</span>
            </>
          )}
        </div>
        <button className="hamburger-btn" onClick={() => setMenuOpen(true)} style={n.hamburger} aria-label="Open menu">
          <span style={n.bar} /><span style={n.bar} /><span style={n.bar} />
        </button>
      </nav>

      {/* ── SECTION 1 · Hero Carousel ───────────────────────────────────────── */}
      <div className="hero-wrap" style={hero.wrap}>

        {/* Slides */}
        {BANNERS.map((b, i) => (
          <div
            key={i}
            style={{
              ...hero.slide,
              background: b.bg,
              opacity: i === current ? 1 : 0,
              zIndex: i === current ? 1 : 0,
            }}
          >
            {/* Dark overlay for image-backed banners */}
            {b.overlay && <div style={hero.overlay} />}

            {/* Banner 1 — special layout */}
            {i === 0 && (
              <div style={hero.inner}>
                <p style={hero.logoLabel}>The Letter</p>
                <h1 style={hero.mainHeadline}>Messages worth<br />waiting for</h1>
                <p style={hero.mainSub}>
                  Create a capsule. Write to your future self.<br className="no-mobile" />
                  We keep it safe until you&rsquo;re ready to open it.
                </p>
                <button onClick={openModal} style={hero.cta}>Create a capsule</button>
              </div>
            )}

            {/* Banners 2–4 */}
            {i > 0 && (
              <div style={hero.inner}>
                <h2 style={hero.overlayHeadline}>{b.headline}</h2>
                <button onClick={openModal} style={hero.cta}>Create a capsule</button>
              </div>
            )}
          </div>
        ))}

        {/* ← Arrow */}
        <button
          style={{ ...hero.arrow, left: 20 }}
          onClick={() => goTo((current - 1 + BANNERS.length) % BANNERS.length)}
          aria-label="Previous"
        >
          ‹
        </button>

        {/* → Arrow */}
        <button
          style={{ ...hero.arrow, right: 20 }}
          onClick={() => goTo((current + 1) % BANNERS.length)}
          aria-label="Next"
        >
          ›
        </button>

        {/* Dots */}
        <div style={hero.dots}>
          {BANNERS.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              style={i === current ? hero.dotActive : hero.dot}
              aria-label={`Go to banner ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* ── SECTION 2 · Visual Journey ──────────────────────────────────────── */}
      <section style={journey.section}>
        <div className="journey-grid" style={journey.grid}>

          {/* Card 1: Write */}
          <div className="journey-card" style={{
            ...journey.card,
            // TODO: replace with real photo — background: 'url(/images/letter-paper.jpg) center/cover no-repeat'
            background: 'linear-gradient(160deg, #f0e6d2 0%, #dcc9a8 50%, #c8b48c 100%)',
          }}>
            <div style={journey.cardOverlay} />
            <h3 style={journey.cardText}>Write your letter</h3>
          </div>

          {/* Card 2: Safe */}
          <div className="journey-card" style={{
            ...journey.card,
            // TODO: replace with real photo — background: 'url(/images/wax-seal.jpg) center/cover no-repeat'
            background: 'linear-gradient(160deg, #4a1515 0%, #2a0808 50%, #1a0505 100%)',
          }}>
            <div style={journey.cardOverlay} />
            <h3 style={journey.cardText}>We keep it safe</h3>
          </div>

          {/* Card 3: Open */}
          <div className="journey-card" style={{
            ...journey.card,
            // TODO: replace with real photo — background: 'url(/images/envelope-opening.jpg) center/cover no-repeat'
            background: 'linear-gradient(160deg, #f2d4d0 0%, #e0b4ae 50%, #cfa09a 100%)',
          }}>
            <div style={journey.cardOverlay} />
            <h3 style={journey.cardText}>Open it when you&rsquo;re ready</h3>
          </div>

        </div>
      </section>

      {/* ── SECTION 3 · Testimonials ────────────────────────────────────────── */}
      <section style={test.section}>
        <h2 style={test.heading}>What people say</h2>

        {/* Desktop grid / Mobile scroll */}
        <div className="test-grid" style={test.grid}>
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="test-card" style={test.card}>
              <div style={test.stars}>
                {Array.from({ length: t.stars }).map((_, j) => (
                  <span key={j} style={test.star}>★</span>
                ))}
              </div>
              <p style={test.quote}>&ldquo;{t.quote}&rdquo;</p>
              <p style={test.name}>— {t.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECTION 4 · CTA ────────────────────────────────────────────────── */}
      <section style={cta.section}>
        <h2 style={cta.heading}>Ready to create your first capsule?</h2>
        <p style={cta.sub}>It takes 5 minutes.</p>
        <button onClick={openModal} style={cta.btn}>Sign up now</button>
      </section>

      {/* ── SECTION 5 · Footer ──────────────────────────────────────────────── */}
      <footer style={ft.footer}>
        <div className="footer-cols" style={ft.cols}>

          {/* Left: Brand */}
          <div style={ft.col}>
            <span style={ft.logo}>The Letter</span>
            <a href="mailto:hello@theletter.app" style={ft.email}>hello@theletter.app</a>
          </div>

          {/* Center: Social */}
          <div style={ft.colCenter}>
            <p style={ft.socialLabel}>Follow us</p>
            <div style={ft.socialRow}>
              <a href="#" style={ft.socialLink} aria-label="Instagram">
                {/* Instagram */}
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="#" style={ft.socialLink} aria-label="TikTok">
                {/* TikTok */}
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/>
                </svg>
              </a>
              <a href="#" style={ft.socialLink} aria-label="Twitter / X">
                {/* X */}
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Right: Links */}
          <div style={ft.col}>
            <a href="/how-it-works" style={ft.link}>How it works</a>
            <a href="/faq" style={ft.link}>FAQ</a>
            <a href="/about" style={ft.link}>About</a>
            <a href="/contact" style={ft.link}>Contact</a>
          </div>
        </div>

        <div style={ft.bottom}>
          <span style={ft.copy}>© 2026 The Letter</span>
          <div style={ft.legal}>
            <a href="/privacy" style={ft.legalLink}>Privacy Policy</a>
            <span style={ft.legalDot}>·</span>
            <a href="/terms" style={ft.legalLink}>Terms of Service</a>
          </div>
        </div>
      </footer>
    </>
  )
}

// ─── Global CSS ───────────────────────────────────────────────────────────────
const globalCss = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; background: #FFE6E1; color: #393232; }

  /* Nav */
  .desktop-nav { display: flex; align-items: center; gap: 16px; }
  .hamburger-btn { display: none !important; }

  /* Hero */
  .hero-wrap { height: 100vh; min-height: 500px; }
  .no-mobile { display: inline; }

  /* Journey cards */
  .journey-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0; }
  .journey-card { height: 460px; position: relative; overflow: hidden; cursor: default; transition: transform 0.35s ease; }
  .journey-card:hover { transform: scale(1.025); z-index: 2; }

  /* Testimonials */
  .test-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
  .test-card {}

  /* Footer */
  .footer-cols { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 48px; }

  @media (max-width: 1023px) {
    .test-grid { grid-template-columns: repeat(2, 1fr); }
  }

  @media (max-width: 767px) {
    .desktop-nav { display: none !important; }
    .hamburger-btn { display: flex !important; }
    .hero-wrap { height: 70vh; min-height: 420px; }
    .no-mobile { display: none; }
    .journey-grid { grid-template-columns: 1fr; }
    .journey-card { height: 320px; }
    .test-grid {
      display: flex !important;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
      gap: 16px;
      padding: 0 0 12px;
    }
    .test-grid::-webkit-scrollbar { display: none; }
    .test-card { scroll-snap-align: start; min-width: 82vw; flex-shrink: 0; }
    .footer-cols { grid-template-columns: 1fr; gap: 32px; }
  }
`

// ─── Style objects ────────────────────────────────────────────────────────────
const WINE = '#952323'
const CREAM = '#FFE6E1'
const BLUSH = '#EDBFC6'
const CHARCOAL = '#393232'
const font = { serif: "'Lora', 'Georgia', serif", sans: "'Inter', Arial, sans-serif" }

const n = {
  nav: {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
    height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 28px',
    backgroundColor: 'rgba(255,230,225,0.96)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid rgba(237,191,198,0.4)',
  },
  logo: {
    fontFamily: font.serif, fontSize: 22, fontWeight: 700, color: WINE,
    cursor: 'pointer', letterSpacing: '0.3px',
  },
  signUpBtn: {
    padding: '9px 22px', backgroundColor: WINE, color: '#fff',
    border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 600,
    cursor: 'pointer', fontFamily: font.sans,
  },
  signInLink: {
    fontSize: 14, color: CHARCOAL, cursor: 'pointer',
    fontFamily: font.sans, fontWeight: 500,
  },
  hamburger: {
    display: 'flex', flexDirection: 'column', gap: 5,
    background: 'transparent', border: 'none', cursor: 'pointer', padding: 6,
  },
  bar: { display: 'block', width: 24, height: 2, backgroundColor: CHARCOAL, borderRadius: 2 },
}

const hero = {
  wrap: {
    position: 'relative', overflow: 'hidden',
    marginTop: 64, // offset for fixed nav
  },
  slide: {
    position: 'absolute', inset: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'opacity 0.9s ease-in-out',
  },
  overlay: {
    position: 'absolute', inset: 0,
    backgroundColor: 'rgba(57,50,50,0.42)',
  },
  inner: {
    position: 'relative', zIndex: 2, textAlign: 'center',
    padding: '0 24px', maxWidth: 700,
  },
  logoLabel: {
    fontFamily: font.serif, fontSize: 15, fontWeight: 600,
    color: WINE, letterSpacing: '2px', textTransform: 'uppercase',
    marginBottom: 20,
  },
  mainHeadline: {
    fontFamily: font.serif, fontSize: 'clamp(40px, 7vw, 72px)',
    fontWeight: 700, color: WINE, lineHeight: 1.1, marginBottom: 22,
  },
  mainSub: {
    fontFamily: font.sans, fontSize: 'clamp(16px, 2.5vw, 20px)',
    color: CHARCOAL, lineHeight: 1.7, marginBottom: 36, fontWeight: 300,
  },
  overlayHeadline: {
    fontFamily: font.serif, fontSize: 'clamp(32px, 6vw, 60px)',
    fontWeight: 700, color: '#fff', lineHeight: 1.15, marginBottom: 32,
    textShadow: '0 2px 20px rgba(0,0,0,0.3)',
  },
  cta: {
    padding: '14px 40px', backgroundColor: WINE, color: '#fff',
    border: 'none', borderRadius: 6, fontSize: 16, fontWeight: 600,
    cursor: 'pointer', fontFamily: font.sans, letterSpacing: '0.3px',
  },
  arrow: {
    position: 'absolute', top: '50%', transform: 'translateY(-50%)', zIndex: 10,
    width: 44, height: 44, borderRadius: '50%',
    backgroundColor: 'rgba(255,255,255,0.22)', backdropFilter: 'blur(4px)',
    border: '1px solid rgba(255,255,255,0.35)', color: '#fff',
    fontSize: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', lineHeight: 1,
  },
  dots: {
    position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
    display: 'flex', gap: 8, zIndex: 10,
  },
  dot: {
    width: 8, height: 8, borderRadius: '50%',
    backgroundColor: 'rgba(255,255,255,0.45)',
    border: 'none', cursor: 'pointer', padding: 0,
  },
  dotActive: {
    width: 24, height: 8, borderRadius: 4,
    backgroundColor: '#fff',
    border: 'none', cursor: 'pointer', padding: 0,
    transition: 'width 0.3s ease',
  },
}

const journey = {
  section: { overflow: 'hidden' },
  grid: {},
  card: {
    backgroundSize: 'cover', backgroundPosition: 'center',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  cardOverlay: {
    position: 'absolute', inset: 0,
    backgroundColor: 'rgba(57,50,50,0.38)',
  },
  cardText: {
    position: 'relative', zIndex: 1,
    fontFamily: font.serif, fontSize: 'clamp(22px, 3vw, 32px)',
    fontWeight: 700, color: '#fff',
    textAlign: 'center', padding: '0 24px',
    textShadow: '0 2px 16px rgba(0,0,0,0.25)',
    lineHeight: 1.3,
  },
}

const test = {
  section: {
    backgroundColor: CREAM, padding: '72px 28px',
  },
  heading: {
    fontFamily: font.serif, fontSize: 'clamp(26px, 4vw, 38px)',
    fontWeight: 700, color: CHARCOAL, textAlign: 'center',
    marginBottom: 40,
  },
  grid: { maxWidth: 1200, margin: '0 auto' },
  card: {
    backgroundColor: '#fff', borderRadius: 12,
    border: `1.5px solid ${BLUSH}`,
    padding: '28px 24px',
    boxShadow: '0 2px 14px rgba(149,35,35,0.06)',
    display: 'flex', flexDirection: 'column', gap: 12,
  },
  stars: { display: 'flex', gap: 2 },
  star: { color: WINE, fontSize: 18 },
  quote: {
    fontFamily: font.serif, fontSize: 15, color: CHARCOAL,
    lineHeight: 1.75, fontStyle: 'italic', flex: 1,
  },
  name: {
    fontFamily: font.sans, fontSize: 13, color: '#888',
    fontWeight: 500,
  },
}

const cta = {
  section: {
    backgroundColor: BLUSH, padding: '80px 24px',
    textAlign: 'center',
  },
  heading: {
    fontFamily: font.serif, fontSize: 'clamp(26px, 4vw, 40px)',
    fontWeight: 700, color: CHARCOAL, marginBottom: 14, lineHeight: 1.25,
  },
  sub: {
    fontFamily: font.sans, fontSize: 17, color: CHARCOAL,
    opacity: 0.7, marginBottom: 32,
  },
  btn: {
    padding: '16px 48px', backgroundColor: WINE, color: '#fff',
    border: 'none', borderRadius: 6, fontSize: 16, fontWeight: 600,
    cursor: 'pointer', fontFamily: font.sans,
  },
}

const ft = {
  footer: {
    backgroundColor: CHARCOAL, padding: '56px 28px 0',
  },
  cols: { maxWidth: 1100, margin: '0 auto', paddingBottom: 48 },
  col: { display: 'flex', flexDirection: 'column', gap: 14 },
  colCenter: { display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' },
  logo: { fontFamily: font.serif, fontSize: 22, fontWeight: 700, color: '#fff' },
  email: { fontFamily: font.sans, fontSize: 14, color: '#a89494', textDecoration: 'none' },
  socialLabel: { fontFamily: font.sans, fontSize: 12, color: '#a89494', textTransform: 'uppercase', letterSpacing: '0.8px' },
  socialRow: { display: 'flex', gap: 16 },
  socialLink: { color: '#c8a8a8', textDecoration: 'none' },
  link: { fontFamily: font.sans, fontSize: 14, color: '#c8a8a8', textDecoration: 'none' },
  bottom: {
    borderTop: '1px solid #4a3838',
    padding: '20px 0', display: 'flex',
    justifyContent: 'space-between', alignItems: 'center',
    maxWidth: 1100, margin: '0 auto',
    flexWrap: 'wrap', gap: 12,
  },
  copy: { fontFamily: font.sans, fontSize: 12, color: '#6a5858' },
  legal: { display: 'flex', gap: 8, alignItems: 'center' },
  legalLink: { fontFamily: font.sans, fontSize: 12, color: '#6a5858', textDecoration: 'none' },
  legalDot: { color: '#4a3838' },
}

const m = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 2000,
    backgroundColor: 'rgba(57,50,50,0.65)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#fff', borderRadius: 16, padding: '40px 36px',
    width: '100%', maxWidth: 420, position: 'relative',
    maxHeight: '90vh', overflowY: 'auto',
    boxShadow: '0 20px 60px rgba(57,50,50,0.25)',
  },
  closeBtn: {
    position: 'absolute', top: 16, right: 16,
    background: 'transparent', border: 'none', fontSize: 18,
    cursor: 'pointer', color: '#aaa', lineHeight: 1, padding: 4,
  },
  icon: { fontSize: 36, textAlign: 'center', marginBottom: 14 },
  title: {
    fontFamily: font.serif, fontSize: 24, fontWeight: 700,
    color: CHARCOAL, textAlign: 'center', marginBottom: 6,
  },
  sub: { fontSize: 14, color: '#888', textAlign: 'center', marginBottom: 24, lineHeight: 1.5, fontFamily: font.sans },
  form: { display: 'flex', flexDirection: 'column', gap: 4 },
  label: { fontSize: 13, fontWeight: 600, color: CHARCOAL, marginBottom: 4, marginTop: 12, fontFamily: font.sans },
  input: {
    width: '100%', padding: '11px 14px',
    border: '1.5px solid #ddd', borderRadius: 8,
    fontSize: 14, fontFamily: font.sans, outline: 'none',
  },
  error: {
    backgroundColor: '#fdf2f2', color: '#8a2323', padding: '10px 14px',
    borderRadius: 8, fontSize: 13, marginBottom: 4, fontFamily: font.sans,
  },
  submit: {
    marginTop: 20, padding: '13px',
    backgroundColor: WINE, color: '#fff', border: 'none',
    borderRadius: 8, fontSize: 15, fontWeight: 600,
    cursor: 'pointer', fontFamily: font.sans,
  },
  footer: { textAlign: 'center', marginTop: 18, fontSize: 13, color: '#888', fontFamily: font.sans },
  footerLink: { color: WINE, cursor: 'pointer', fontWeight: 600 },
}

const mn = {
  overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(57,50,50,0.55)', zIndex: 1500 },
  drawer: {
    position: 'absolute', top: 0, right: 0, bottom: 0, width: 300,
    backgroundColor: CREAM,
    boxShadow: '-4px 0 24px rgba(57,50,50,0.15)',
    display: 'flex', flexDirection: 'column',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '20px 20px 16px',
    borderBottom: `1px solid ${BLUSH}`,
  },
  brand: { fontFamily: font.serif, fontSize: 20, fontWeight: 700, color: WINE },
  closeBtn: {
    background: 'transparent', border: 'none', fontSize: 20,
    cursor: 'pointer', color: '#888',
  },
  body: {
    display: 'flex', flexDirection: 'column', padding: '20px',
    gap: 4, flex: 1, overflowY: 'auto',
  },
  signUpBtn: {
    width: '100%', padding: '14px',
    backgroundColor: WINE, color: '#fff', border: 'none',
    borderRadius: 8, fontSize: 16, fontWeight: 600,
    cursor: 'pointer', fontFamily: font.sans, textAlign: 'center',
    marginBottom: 4,
  },
  signInLink: {
    display: 'block', fontSize: 16, color: CHARCOAL,
    textDecoration: 'none', padding: '12px 0',
    borderBottom: `1px solid ${BLUSH}`, fontFamily: font.sans,
    fontWeight: 500,
  },
  divider: { height: 1, backgroundColor: BLUSH, margin: '8px 0' },
  link: {
    fontSize: 15, color: CHARCOAL, textDecoration: 'none',
    padding: '11px 0', borderBottom: `1px solid rgba(237,191,198,0.5)`,
    fontFamily: font.sans,
  },
  linkSmall: {
    fontSize: 13, color: '#888', textDecoration: 'none',
    padding: '10px 0', borderBottom: `1px solid rgba(237,191,198,0.3)`,
    fontFamily: font.sans,
  },
}
