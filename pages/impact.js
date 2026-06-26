import { useState, useEffect } from 'react'
import Head from 'next/head'
import SiteNav from '../components/SiteNav'
import SiteFooter from '../components/SiteFooter'
import SignupModal from '../components/SignupModal'

const DARK = '#1A0F1F'
const MAROON = '#4D0000'
const WINE = '#8A2323'
const CREAM = '#FFFBF5'
const BORDER = 'rgba(77, 0, 0, 0.15)'
const INK = '#3A2418'
const MUTED = '#7A6A5A'
const F = { serif: "'Playfair Display','Georgia',serif", sans: "'Inter',Arial,sans-serif" }

export default function Impact() {
  const [donated, setDonated] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    fetch('/api/donation-total')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.total) setDonated(d.total) })
      .catch(() => {})
  }, [])

  const fmt = n => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const monthYear = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <>
      <Head>
        <title>Our Impact — The Letter</title>
        <meta name="description" content="5% of The Letter's profit goes towards fighting childhood cancer through the National Pediatric Cancer Foundation. Here's why we chose this mission and how your capsules help save lives." />
        <meta property="og:title" content="Our Impact — The Letter" />
        <meta property="og:description" content="When you seal a time capsule, you help fund research for safer childhood cancer treatments." />
      </Head>

      {modalOpen && <SignupModal onClose={() => setModalOpen(false)} />}
      <SiteNav />

      {/* ── Hero ── */}
      <div style={s.hero}>
        <div style={s.heroInner}>
          <p style={s.heroEyebrow}>Making a difference</p>
          <h1 style={s.heroTitle}>Our Impact</h1>
          <p style={s.heroSub}>5% of our profit goes towards fighting childhood cancer</p>
          <p style={s.heroIntro}>Here's why we chose this mission and how your capsules help save lives.</p>
        </div>
      </div>

      <main style={s.main}>

        {/* ── Section 1: Why We Give ── */}
        <section style={s.section}>
          <div style={s.inner}>
            <p style={s.eyebrow}>Why we give</p>
            <h2 style={s.h2}>Why childhood cancer?</h2>
            <div style={s.prose}>
              <p style={s.p}>
                The Letter is about preserving futures — about creating messages that connect who you were to who you'll become. It's built on the belief that your story deserves to be told, and that the person you are today is worth remembering.
              </p>
              <p style={s.p}>
                Childhood cancer threatens that future. Every day, 43 kids are diagnosed with cancer in the U.S. Many face treatments that are as devastating as the disease itself — chemotherapy designed for adults, causing lifelong side effects in growing bodies. We believe every child deserves the chance to grow, to dream, to become.
              </p>
              <p style={s.p}>
                That's why 5% of our profits fund the National Pediatric Cancer Foundation. When you seal a capsule, you're not just creating a memory — you're helping fund research for safer, less toxic treatments so more children get their future back.
              </p>
            </div>

            {donated !== null && donated > 0 && (
              <div style={s.donationCallout}>
                <span style={s.calloutHeart}>💛</span>
                <div>
                  <p style={s.calloutAmount}>${fmt(donated)}</p>
                  <p style={s.calloutLabel}>donated to NPCF so far</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ── Section 2: Meet Our Partner ── */}
        <section style={{ ...s.section, backgroundColor: 'rgba(77,0,0,0.03)' }}>
          <div style={s.inner}>
            <p style={s.eyebrow}>Our partner</p>
            <h2 style={s.h2}>National Pediatric Cancer Foundation</h2>
            <div style={s.partnerCard}>
              <div style={s.partnerLogo} aria-label="NPCF">
                <span style={s.partnerLogoText}>NPCF</span>
              </div>
              <div style={s.partnerBody}>
                <p style={s.p}>
                  The National Pediatric Cancer Foundation is dedicated to eliminating cancer in children. Their research platform brings together the brightest minds in pediatric oncology to find cures and develop treatments that are not only effective — but kinder to young bodies.
                </p>
                <p style={s.p}>
                  They fund groundbreaking research to find safer, more effective treatments for children fighting cancer. Every dollar donated directly accelerates clinical trials and research that could change the outcome for a child diagnosed today.
                </p>
                <a
                  href="https://nationalpcf.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={s.partnerLink}
                >
                  Learn more about NPCF ↗
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── Section 3: Transparency ── */}
        <section style={s.section}>
          <div style={s.inner}>
            <p style={s.eyebrow}>Transparency</p>
            <h2 style={s.h2}>How we donate</h2>
            <div style={s.transparencyGrid}>
              {[
                { icon: '📊', text: 'We calculate 5% of our quarterly profits' },
                { icon: '💸', text: 'We donate directly to NPCF — no intermediaries' },
                { icon: '📋', text: 'We track and share donation amounts openly' },
                { icon: '✅', text: "You can verify donations at NPCF's website" },
              ].map((item, i) => (
                <div key={i} style={s.tItem}>
                  <span style={s.tIcon}>{item.icon}</span>
                  <p style={s.tText}>{item.text}</p>
                </div>
              ))}
            </div>

            <div style={s.totalBox}>
              <p style={s.totalEyebrow}>Running total</p>
              <p style={s.totalAmount}>
                {donated !== null ? `$${fmt(donated)}` : '$0.00'}
              </p>
              <p style={s.totalMeta}>donated to NPCF as of {monthYear}</p>
              <a
                href="https://nationalpcf.org"
                target="_blank"
                rel="noopener noreferrer"
                style={s.verifyLink}
              >
                Verify at nationalpcf.org ↗
              </a>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <div style={s.cta}>
          <div style={s.ctaInner}>
            <p style={s.ctaEyebrow}>Join the mission</p>
            <h2 style={s.ctaTitle}>Every capsule sealed is a capsule that funds the cure</h2>
            <p style={s.ctaSub}>
              Create your time capsule today and help us fund research that gives more children their future back.
            </p>
            <button onClick={() => setModalOpen(true)} style={s.ctaBtn}>
              Create your first capsule
            </button>
          </div>
        </div>

      </main>

      <SiteFooter />
    </>
  )
}

const s = {
  // Hero
  hero: { backgroundColor: DARK, padding: '80px 24px 72px' },
  heroInner: { maxWidth: 680, margin: '0 auto', textAlign: 'center' },
  heroEyebrow: {
    fontFamily: F.sans, fontSize: 11, fontWeight: 700,
    color: 'rgba(255,251,245,0.5)', textTransform: 'uppercase',
    letterSpacing: '1.5px', marginBottom: 20,
  },
  heroTitle: {
    fontFamily: F.serif, fontSize: 52, fontWeight: 600, color: CREAM,
    marginBottom: 20, lineHeight: 1.15,
  },
  heroSub: {
    fontFamily: F.serif, fontSize: 21, color: 'rgba(255,251,245,0.85)',
    fontStyle: 'italic', marginBottom: 16, lineHeight: 1.5,
  },
  heroIntro: {
    fontFamily: F.sans, fontSize: 16, color: 'rgba(255,251,245,0.6)',
    lineHeight: 1.75,
  },

  // Body layout
  main: { backgroundColor: CREAM },
  section: { padding: '72px 24px' },
  inner: { maxWidth: 720, margin: '0 auto' },
  eyebrow: {
    fontFamily: F.sans, fontSize: 11, fontWeight: 700, color: WINE,
    textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 14,
  },
  h2: {
    fontFamily: F.serif, fontSize: 34, fontWeight: 600, color: MAROON,
    marginBottom: 28, lineHeight: 1.25,
  },
  prose: { display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 40 },
  p: { fontFamily: F.sans, fontSize: 16, color: INK, lineHeight: 1.85 },

  // Donation callout
  donationCallout: {
    display: 'flex', alignItems: 'center', gap: 20,
    backgroundColor: '#fffbeb', border: '1px solid #fde68a',
    borderRadius: 12, padding: '24px 28px',
  },
  calloutHeart: { fontSize: 34, flexShrink: 0 },
  calloutAmount: {
    fontFamily: F.serif, fontSize: 38, fontWeight: 600, color: MAROON,
    margin: '0 0 4px', lineHeight: 1,
  },
  calloutLabel: { fontFamily: F.sans, fontSize: 14, color: MUTED, margin: 0 },

  // Partner card
  partnerCard: {
    border: `1px solid ${BORDER}`, borderRadius: 12,
    padding: '32px', backgroundColor: CREAM,
    display: 'flex', gap: 28, alignItems: 'flex-start', flexWrap: 'wrap',
  },
  partnerLogo: {
    width: 80, height: 80, flexShrink: 0,
    backgroundColor: MAROON, borderRadius: 10,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  partnerLogoText: {
    fontFamily: F.serif, fontSize: 18, fontWeight: 600, color: CREAM, letterSpacing: '1px',
  },
  partnerBody: { flex: 1, minWidth: 260, display: 'flex', flexDirection: 'column', gap: 14 },
  partnerLink: {
    fontFamily: F.sans, fontSize: 14, fontWeight: 600, color: WINE, textDecoration: 'none',
  },

  // Transparency
  transparencyGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 14, marginBottom: 36,
  },
  tItem: {
    display: 'flex', alignItems: 'flex-start', gap: 14,
    backgroundColor: CREAM, border: `1px solid ${BORDER}`,
    borderRadius: 10, padding: '18px 20px',
  },
  tIcon: { fontSize: 22, flexShrink: 0 },
  tText: { fontFamily: F.sans, fontSize: 14, color: INK, lineHeight: 1.6, margin: 0 },

  totalBox: {
    backgroundColor: MAROON, borderRadius: 12, padding: '40px 32px', textAlign: 'center',
  },
  totalEyebrow: {
    fontFamily: F.sans, fontSize: 11, fontWeight: 700,
    color: 'rgba(255,251,245,0.5)', textTransform: 'uppercase',
    letterSpacing: '1.5px', marginBottom: 12,
  },
  totalAmount: {
    fontFamily: F.serif, fontSize: 52, fontWeight: 600, color: CREAM,
    marginBottom: 8, lineHeight: 1,
  },
  totalMeta: {
    fontFamily: F.sans, fontSize: 13, color: 'rgba(255,251,245,0.5)', marginBottom: 20,
  },
  verifyLink: {
    fontFamily: F.sans, fontSize: 13, color: 'rgba(255,251,245,0.65)',
    textDecoration: 'none', fontWeight: 500,
  },

  // CTA
  cta: { backgroundColor: DARK, padding: '80px 24px' },
  ctaInner: { maxWidth: 600, margin: '0 auto', textAlign: 'center' },
  ctaEyebrow: {
    fontFamily: F.sans, fontSize: 11, fontWeight: 700,
    color: 'rgba(255,251,245,0.5)', textTransform: 'uppercase',
    letterSpacing: '1.5px', marginBottom: 20,
  },
  ctaTitle: {
    fontFamily: F.serif, fontSize: 34, fontWeight: 600, color: CREAM,
    marginBottom: 16, lineHeight: 1.3,
  },
  ctaSub: {
    fontFamily: F.sans, fontSize: 16, color: 'rgba(255,251,245,0.65)',
    lineHeight: 1.75, marginBottom: 32,
  },
  ctaBtn: {
    padding: '16px 40px', backgroundColor: WINE, color: CREAM,
    border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 600,
    fontFamily: F.sans, cursor: 'pointer',
  },
}
