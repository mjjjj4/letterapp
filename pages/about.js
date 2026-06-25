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

export default function About() {
  const router = useRouter()
  return (
    <>
      <Head>
        <title>About — The Letter</title>
        <meta name="description" content="The Letter is a time capsule app for messages worth waiting for." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; } body { font-family: Arial, 'Helvetica Neue', sans-serif; background: #faf9f7; }`}</style>
      </Head>

      <PublicNav />

      <main style={s.main}>
        <div style={s.hero}>
          <p style={s.eyebrow}>Our story</p>
          <h1 style={s.title}>About The Letter</h1>
        </div>

        <div style={s.body}>
          <p style={s.p}>
            The Letter started with a simple question: <em>what would you say to yourself in ten years?</em>
          </p>
          <p style={s.p}>
            We live in a world of instant messages and vanishing stories. But some things deserve to be kept — the version of you that existed before the big job, before the wedding, before the kids, before the grief. The you that had certain hopes and certain fears. The you that existed right now.
          </p>
          <p style={s.p}>
            The Letter is a time capsule for that version of you. Write freely. We store it securely. We deliver it on the day you choose.
          </p>

          <div style={s.quote}>
            <p style={s.quoteText}>&ldquo;The most meaningful email I&rsquo;ve ever sent — to myself.&rdquo;</p>
          </div>

          <h2 style={s.h2}>How we think about pricing</h2>
          <p style={s.p}>
            We charge $1.85 per year of storage. That&rsquo;s it. No subscriptions, no surprise fees. We believe the cost of a time capsule should be as simple as the act of writing one.
          </p>
          <p style={s.p}>
            A 5-year capsule costs less than a latte. A 10-year capsule costs less than a book. We think that&rsquo;s the right price for something that matters.
          </p>

          <h2 style={s.h2}>Privacy, always</h2>
          <p style={s.p}>
            Your message is yours. We store it securely and deliver it to your inbox on your chosen date. We don&rsquo;t read it, sell it, or share it. When you open your capsule, it will be exactly as you left it.
          </p>

          <h2 style={s.h2}>Get in touch</h2>
          <p style={s.p}>
            We&rsquo;d love to hear from you. Questions, feedback, or just wanting to share what you wrote —{' '}
            <a href="mailto:hello@theletter.app" style={s.link}>hello@theletter.app</a>
          </p>
        </div>

        <div style={s.cta}>
          <button onClick={() => router.push('/')} style={s.ctaBtn}>Write your first capsule →</button>
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
  main: { maxWidth: 660, margin: '0 auto', padding: '60px 24px 80px' },
  hero: { marginBottom: 40 },
  eyebrow: { fontSize: 12, fontWeight: 'bold', color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: 12 },
  title: { fontFamily: "'Georgia','Times New Roman',serif", fontSize: 42, color: '#1a1a1a' },
  body: { display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 56 },
  p: { fontSize: 17, color: '#444', lineHeight: 1.9 },
  h2: { fontFamily: "'Georgia','Times New Roman',serif", fontSize: 24, color: '#1a1a1a', marginTop: 12 },
  quote: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: '28px 32px', margin: '8px 0' },
  quoteText: { fontFamily: "'Georgia','Times New Roman',serif", fontSize: 20, color: '#f59e0b', fontStyle: 'italic', lineHeight: 1.6 },
  link: { color: '#f59e0b', textDecoration: 'none', fontWeight: 'bold' },
  cta: { textAlign: 'center' },
  ctaBtn: { padding: '14px 36px', backgroundColor: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 'bold', cursor: 'pointer' },
  footer: { backgroundColor: '#111', padding: '28px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 },
  footerLogo: { fontFamily: "'Georgia','Times New Roman',serif", fontSize: 18, color: '#fff', cursor: 'pointer' },
  footerCopy: { fontSize: 12, color: '#555' },
}
