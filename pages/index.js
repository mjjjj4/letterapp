import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { supabase } from '../lib/supabase'
import SiteNav from '../components/SiteNav'
import SiteFooter from '../components/SiteFooter'
import SignupModal from '../components/SignupModal'
import CharityBanner from '../components/CharityBanner'

const BANNERS = [
  {
    bg: '#FFFBF5',
    overlay: false,
    headline: null,
  },
  {
    bg: '#4D0000',
    founderPromo: true,
  },
  {
    bg: '#3A2418',
    overlay: false,
    headline: 'Preserve your memories',
  },
  {
    bg: '#4D0000',
    overlay: false,
    headline: 'Write to your future self',
  },
  {
    bg: '#3A2418',
    overlay: false,
    headline: "Open it when you're ready",
  },
]

const JOURNEY = [
  {
    bg: '#4D0000',
    step: '01',
    label: 'Write your letter',
    desc: 'Find the words only you can say. Tell your future self about who you are right now — your dreams, your fears, the song you have on repeat. There is no right way.',
  },
  {
    bg: '#3A2418',
    step: '02',
    label: 'We keep it safe',
    desc: 'Your capsule is sealed and stored securely. For just $1.85 per year, every word is protected until the date you choose — no subscriptions, no surprises.',
  },
  {
    bg: '#8A2323',
    step: '03',
    label: 'Open when ready',
    desc: 'On your chosen date, your letter arrives in your inbox. Read it alone or with someone you love — a reminder of who you were, for who you have become.',
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
    if (user) router.push('/create')
    else setShowModal(true)
  }

  return (
    <>
      <Head>
        <title>The Letter — Messages worth waiting for</title>
        <meta name="description" content="Create a digital time capsule. Write to your future self. We deliver it when you're ready." />
        <meta property="og:title" content="The Letter — Messages worth waiting for" />
        <meta property="og:description" content="Write a letter to your future self. We deliver it when you're ready." />
        <meta property="og:type" content="website" />
        <style>{pageCss}</style>
      </Head>

      {showModal && <SignupModal onClose={() => setShowModal(false)} />}

      <SiteNav onSignUp={() => setShowModal(true)} />
      <CharityBanner />

      {/* ── SECTION 1 · Hero Carousel ─────────────────────────────────────── */}
      <div className="hero-wrap" style={hero.wrap}>
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
            {/* Banner 1 — main CTA (light background) */}
            {i === 0 && (
              <div style={hero.inner}>
                <p style={hero.logoLabel}>The Letter</p>
                <h1 style={hero.mainHeadline}>Messages worth<br />waiting for</h1>
                <p style={hero.mainSub}>
                  Create a capsule. Write to your future self.<br className="no-mobile" />
                  We keep it safe until you&rsquo;re ready to open it.
                </p>
                <button onClick={openModal} style={hero.cta}>
                  {user ? 'Write a new capsule' : 'Create a capsule'}
                </button>
              </div>
            )}

            {/* Banner 2 — Founder Promo (dark background) */}
            {b.founderPromo && (
              <div style={hero.inner}>
                <p style={hero.promoEyebrow}>Limited time offer</p>
                <h2 style={hero.promoHeadline}>Founder Promotion</h2>
                <p style={hero.promoSub}>
                  Seal a capsule opening in 1–6 months<br className="no-mobile" />
                  and get it <em>free</em>
                </p>
                <button onClick={openModal} style={hero.promoCta}>
                  {user ? 'Create a capsule →' : 'Create your first capsule →'}
                </button>
              </div>
            )}

            {/* Remaining banners — headline only (dark backgrounds) */}
            {!b.founderPromo && i > 0 && b.headline && (
              <div style={hero.inner}>
                <h2 style={hero.overlayHeadline}>{b.headline}</h2>
              </div>
            )}
          </div>
        ))}

        {/* ← Arrow */}
        <button
          style={{ ...hero.arrow, left: 20 }}
          onClick={() => goTo((current - 1 + BANNERS.length) % BANNERS.length)}
          aria-label="Previous"
        >‹</button>

        {/* → Arrow */}
        <button
          style={{ ...hero.arrow, right: 20 }}
          onClick={() => goTo((current + 1) % BANNERS.length)}
          aria-label="Next"
        >›</button>

        {/* Dots */}
        <div style={hero.dots}>
          {BANNERS.map((_, i) => (
            <button
              key={i} onClick={() => goTo(i)}
              style={i === current ? hero.dotActive : hero.dot}
              aria-label={`Go to banner ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* ── SECTION 2 · Visual Journey ────────────────────────────────────── */}
      <section style={journey.section}>
        <div className="journey-grid">
          {JOURNEY.map((card, i) => (
            <div key={i} className="journey-card">
              {/* Image area with label */}
              <div className="journey-img" style={{ background: card.bg }}>
                <div style={journey.imgInner}>
                  <span style={journey.step}>{card.step}</span>
                  <h3 style={journey.label}>{card.label}</h3>
                </div>
              </div>
              {/* Descriptive text below image */}
              <div style={journey.cardBody}>
                <p style={journey.cardDesc}>{card.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECTION 3 · Testimonials ──────────────────────────────────────── */}
      <section style={test.section}>
        <h2 style={test.heading}>What people say</h2>
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

      {/* ── SECTION 4 · CTA ───────────────────────────────────────────────── */}
      <section style={cta.section}>
        <h2 style={cta.heading}>Ready to create your first capsule?</h2>
        <p style={cta.sub}>It takes 5 minutes. Starting at $1.85.</p>
        <button onClick={openModal} style={cta.btn}>
          {user ? 'Write a new capsule' : 'Sign up now'}
        </button>
      </section>

      <SiteFooter />
    </>
  )
}

// Page-specific CSS (shared base is in _app.js)
const pageCss = `
  /* Hero */
  .hero-wrap { height: calc(100vh - 64px); min-height: 460px; position: relative; overflow: hidden; }
  .no-mobile { display: inline; }

  /* Journey */
  .journey-grid { display: grid; grid-template-columns: repeat(3, 1fr); }
  .journey-card { background: #FFFBF5; overflow: hidden; }
  .journey-img {
    height: 280px; position: relative; overflow: hidden;
    display: flex; align-items: flex-end;
    transition: transform 0.4s ease;
    background-size: cover; background-position: center;
  }
  .journey-card:hover .journey-img { transform: scale(1.04); }

  /* Testimonials */
  .test-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }

  @media (max-width: 1023px) {
    .test-grid { grid-template-columns: repeat(2, 1fr); }
  }

  @media (max-width: 767px) {
    .hero-wrap { height: calc(70vh - 64px); min-height: 380px; }
    .no-mobile { display: none; }
    .journey-grid { grid-template-columns: 1fr; }
    .journey-img { height: 220px !important; }
    .test-grid {
      display: flex !important;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
      gap: 16px;
      padding-bottom: 12px;
    }
    .test-grid::-webkit-scrollbar { display: none; }
    .test-card { scroll-snap-align: start; min-width: 82vw; flex-shrink: 0; }
  }
`

const MAROON = '#4D0000'
const WINE = '#8A2323'
const CREAM = '#FFFBF5'
const INK = '#3A2418'
const F = { serif: "'Playfair Display','Georgia',serif", sans: "'Inter',Arial,sans-serif" }

const hero = {
  wrap: {},
  slide: {
    position: 'absolute', inset: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'opacity 0.9s ease-in-out',
  },
  inner: { position: 'relative', zIndex: 2, textAlign: 'center', padding: '0 24px', maxWidth: 700 },
  logoLabel: {
    fontFamily: F.serif, fontSize: 15, fontWeight: 600,
    color: MAROON, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 20,
  },
  mainHeadline: {
    fontFamily: F.serif, fontSize: 'clamp(40px,7vw,72px)',
    fontWeight: 600, color: MAROON, lineHeight: 1.1, marginBottom: 22,
  },
  mainSub: {
    fontFamily: F.sans, fontSize: 'clamp(16px,2.5vw,20px)',
    color: INK, lineHeight: 1.7, marginBottom: 36, fontWeight: 300,
  },
  overlayHeadline: {
    fontFamily: F.serif, fontSize: 'clamp(32px,6vw,60px)',
    fontWeight: 600, color: '#FFFBF5', lineHeight: 1.15,
  },
  cta: {
    padding: '14px 40px', backgroundColor: WINE, color: CREAM,
    border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 600,
    fontFamily: F.sans, letterSpacing: '0.3px',
  },
  promoEyebrow: {
    fontFamily: F.sans, fontSize: 12, fontWeight: 700, color: 'rgba(255,251,245,0.7)',
    textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 14,
  },
  promoHeadline: {
    fontFamily: F.serif, fontSize: 'clamp(36px,6vw,58px)',
    fontWeight: 600, color: CREAM, lineHeight: 1.1, marginBottom: 18,
  },
  promoSub: {
    fontFamily: F.sans, fontSize: 'clamp(15px,2vw,18px)',
    color: 'rgba(255,251,245,0.8)', lineHeight: 1.7, marginBottom: 32, fontWeight: 300,
  },
  promoCta: {
    padding: '14px 40px', backgroundColor: CREAM, color: WINE,
    border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 700,
    fontFamily: F.sans, letterSpacing: '0.2px',
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
    width: 24, height: 8, borderRadius: 4, backgroundColor: '#fff',
    border: 'none', cursor: 'pointer', padding: 0, transition: 'width 0.3s ease',
  },
}

const journey = {
  section: { overflow: 'hidden' },
  imgInner: {
    position: 'relative', zIndex: 1, padding: '20px 24px',
    display: 'flex', flexDirection: 'column', gap: 6, width: '100%',
    marginTop: 'auto',
  },
  step: {
    fontFamily: F.sans, fontSize: 11, fontWeight: 700,
    color: 'rgba(255,251,245,0.7)', letterSpacing: '2px', textTransform: 'uppercase',
  },
  label: {
    fontFamily: F.serif, fontSize: 'clamp(20px,2.5vw,28px)',
    fontWeight: 600, color: '#FFFBF5', lineHeight: 1.2,
  },
  cardBody: {
    backgroundColor: CREAM,
    padding: '24px 28px 32px',
    borderBottom: '1px solid rgba(77,0,0,0.1)',
  },
  cardDesc: {
    fontFamily: F.sans, fontSize: 15, color: INK,
    lineHeight: 1.75, fontWeight: 300,
  },
}

const test = {
  section: { backgroundColor: CREAM, padding: '72px 28px' },
  heading: {
    fontFamily: F.serif, fontSize: 'clamp(26px,4vw,38px)',
    fontWeight: 600, color: MAROON, textAlign: 'center', marginBottom: 40,
  },
  grid: { maxWidth: 1200, margin: '0 auto' },
  card: {
    backgroundColor: '#FFFBF5', borderRadius: 10,
    border: '1px solid rgba(77, 0, 0, 0.15)',
    padding: '28px 24px',
    display: 'flex', flexDirection: 'column', gap: 12,
  },
  stars: { display: 'flex', gap: 2 },
  star: { color: WINE, fontSize: 18 },
  quote: { fontFamily: F.serif, fontSize: 15, color: INK, lineHeight: 1.75, fontStyle: 'italic', flex: 1 },
  name: { fontFamily: F.sans, fontSize: 13, color: '#7A6A5A', fontWeight: 500 },
}

const cta = {
  section: { backgroundColor: MAROON, padding: '80px 24px', textAlign: 'center' },
  heading: {
    fontFamily: F.serif, fontSize: 'clamp(26px,4vw,40px)',
    fontWeight: 600, color: '#FFFBF5', marginBottom: 14, lineHeight: 1.25,
  },
  sub: {
    fontFamily: F.sans, fontSize: 17, color: 'rgba(255,251,245,0.75)',
    marginBottom: 32,
  },
  btn: {
    padding: '16px 48px', backgroundColor: WINE, color: '#FFFBF5',
    border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 600, fontFamily: F.sans,
  },
}
