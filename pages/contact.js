import Head from 'next/head'
import SiteNav from '../components/SiteNav'
import SiteFooter from '../components/SiteFooter'

const WINE = '#952323'
const CREAM = '#FFE6E1'
const BLUSH = '#EDBFC6'
const CHARCOAL = '#393232'
const F = { serif: "'Lora','Georgia',serif", sans: "'Inter',Arial,sans-serif" }

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
  title: { fontFamily: F.serif, fontSize: 42, color: CHARCOAL, marginBottom: 14 },
  sub: { fontFamily: F.sans, fontSize: 17, color: '#666', lineHeight: 1.6 },
  cards: { display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 40 },
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: '28px',
    border: `1px solid ${BLUSH}`, display: 'flex', flexDirection: 'column', gap: 10,
  },
  cardIcon: { fontSize: 28 },
  cardTitle: { fontFamily: F.serif, fontSize: 20, color: CHARCOAL },
  cardBody: { fontFamily: F.sans, fontSize: 15, color: '#666', lineHeight: 1.7 },
  cardLink: { fontFamily: F.sans, color: WINE, textDecoration: 'none', fontWeight: 600, fontSize: 15 },
  note: {
    textAlign: 'center', padding: '20px',
    backgroundColor: '#fff', borderRadius: 10, border: `1px solid ${BLUSH}`,
  },
  noteText: { fontFamily: F.sans, fontSize: 14, color: '#888' },
}
