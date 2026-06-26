import Head from 'next/head'
import SiteNav from '../components/SiteNav'
import SiteFooter from '../components/SiteFooter'

const MAROON = '#4D0000'
const WINE = '#8A2323'
const CREAM = '#FFFBF5'
const BORDER = 'rgba(77, 0, 0, 0.15)'
const INK = '#3A2418'
const MUTED = '#7A6A5A'
const F = { serif: "'Playfair Display','Georgia',serif", sans: "'Inter',Arial,sans-serif" }

export default function Contact() {
  return (
    <>
      <Head>
        <title>Contact — The Letter</title>
        <meta name="description" content="Get in touch with The Letter team." />
      </Head>

      <SiteNav />

      <main style={s.main}>
        <div style={s.hero}>
          <p style={s.eyebrow}>Say hello</p>
          <h1 style={s.title}>Contact us</h1>
          <p style={s.sub}>We&rsquo;re a small team and we read every message.</p>
        </div>

        <div style={s.cards}>
          <div style={s.card}>
            <div style={s.cardIcon}>✉️</div>
            <h2 style={s.cardTitle}>General questions</h2>
            <p style={s.cardBody}>For anything about your account, pricing, or how the product works.</p>
            <a href="mailto:hello@theletter.app" style={s.cardLink}>hello@theletter.app</a>
          </div>

          <div style={s.card}>
            <div style={s.cardIcon}>🔒</div>
            <h2 style={s.cardTitle}>Privacy or data requests</h2>
            <p style={s.cardBody}>To request data deletion, access your data, or report a privacy concern.</p>
            <a href="mailto:hello@theletter.app" style={s.cardLink}>hello@theletter.app</a>
          </div>

          <div style={s.card}>
            <div style={s.cardIcon}>💛</div>
            <h2 style={s.cardTitle}>Share your story</h2>
            <p style={s.cardBody}>Did your capsule arrive? Did you write something that changed how you see yourself? We&rsquo;d love to hear it.</p>
            <a href="mailto:hello@theletter.app" style={s.cardLink}>hello@theletter.app</a>
          </div>
        </div>

        <div style={s.note}>
          <p style={s.noteText}>We typically respond within 1–2 business days.</p>
        </div>
      </main>

      <SiteFooter />
    </>
  )
}

const s = {
  main: { minHeight: 'calc(100vh - 64px)', backgroundColor: CREAM, maxWidth: 700, margin: '0 auto', padding: '60px 24px 80px' },
  hero: { textAlign: 'center', marginBottom: 48 },
  eyebrow: {
    fontFamily: F.sans, fontSize: 12, fontWeight: 700, color: WINE,
    textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: 12,
  },
  title: { fontFamily: F.serif, fontSize: 42, fontWeight: 600, color: MAROON, marginBottom: 14 },
  sub: { fontFamily: F.sans, fontSize: 17, color: MUTED, lineHeight: 1.6 },
  cards: { display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 40 },
  card: {
    backgroundColor: CREAM, borderRadius: 10, padding: '28px',
    border: `1px solid ${BORDER}`, display: 'flex', flexDirection: 'column', gap: 10,
  },
  cardIcon: { fontSize: 28 },
  cardTitle: { fontFamily: F.serif, fontSize: 20, fontWeight: 600, color: MAROON },
  cardBody: { fontFamily: F.sans, fontSize: 15, color: INK, lineHeight: 1.7 },
  cardLink: { fontFamily: F.sans, color: WINE, textDecoration: 'none', fontWeight: 600, fontSize: 15 },
  note: {
    textAlign: 'center', padding: '20px',
    backgroundColor: CREAM, borderRadius: 10, border: `1px solid ${BORDER}`,
  },
  noteText: { fontFamily: F.sans, fontSize: 14, color: MUTED },
}
