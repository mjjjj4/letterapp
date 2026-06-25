import { useRouter } from 'next/router'
import Head from 'next/head'

function PublicNav() {
  const router = useRouter()
  return (
    <nav style={nav.bar}>
      <span style={nav.logo} onClick={() => router.push('/')}>The Letter</span>
      <div style={nav.right}>
        <button onClick={() => router.push('/login')} style={nav.signIn}>Sign in</button>
        <button onClick={() => router.push('/')} style={nav.signUp}>Sign up</button>
      </div>
    </nav>
  )
}

export default function Contact() {
  const router = useRouter()
  return (
    <>
      <Head>
        <title>Contact — The Letter</title>
        <meta name="description" content="Get in touch with The Letter team." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; } body { font-family: Arial, 'Helvetica Neue', sans-serif; background: #faf9f7; }`}</style>
      </Head>

      <PublicNav />

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

      <footer style={s.footer}>
        <span style={s.footerLogo} onClick={() => router.push('/')}>The Letter</span>
        <p style={s.footerCopy}>© 2026 The Letter</p>
      </footer>
    </>
  )
}

const nav = {
  bar: { position: 'sticky', top: 0, zIndex: 100, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', backgroundColor: 'rgba(26,26,26,0.97)', backdropFilter: 'blur(10px)' },
  logo: { fontFamily: "'Georgia','Times New Roman',serif", fontSize: 20, fontWeight: 'bold', color: '#fff', cursor: 'pointer' },
  right: { display: 'flex', gap: 10 },
  signIn: { padding: '7px 16px', backgroundColor: 'transparent', color: '#ccc', border: '1px solid #444', borderRadius: 6, fontSize: 13, cursor: 'pointer' },
  signUp: { padding: '7px 16px', backgroundColor: '#f59e0b', color: '#1a1a1a', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 'bold', cursor: 'pointer' },
}

const s = {
  main: { maxWidth: 700, margin: '0 auto', padding: '60px 24px 80px' },
  hero: { textAlign: 'center', marginBottom: 48 },
  eyebrow: { fontSize: 12, fontWeight: 'bold', color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: 12 },
  title: { fontFamily: "'Georgia','Times New Roman',serif", fontSize: 42, color: '#1a1a1a', marginBottom: 14 },
  sub: { fontSize: 17, color: '#666', lineHeight: 1.6 },
  cards: { display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 40 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: '28px 28px', border: '1px solid #e8e4de', display: 'flex', flexDirection: 'column', gap: 10 },
  cardIcon: { fontSize: 28 },
  cardTitle: { fontFamily: "'Georgia','Times New Roman',serif", fontSize: 20, color: '#1a1a1a' },
  cardBody: { fontSize: 15, color: '#666', lineHeight: 1.7 },
  cardLink: { color: '#f59e0b', textDecoration: 'none', fontWeight: 'bold', fontSize: 15 },
  note: { textAlign: 'center', padding: '20px', backgroundColor: '#fff', borderRadius: 10, border: '1px solid #e8e4de' },
  noteText: { fontSize: 14, color: '#888' },
  footer: { backgroundColor: '#111', padding: '28px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 },
  footerLogo: { fontFamily: "'Georgia','Times New Roman',serif", fontSize: 18, color: '#fff', cursor: 'pointer' },
  footerCopy: { fontSize: 12, color: '#555' },
}
