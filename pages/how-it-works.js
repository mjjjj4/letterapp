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

export default function HowItWorks() {
  const router = useRouter()
  const steps = [
    {
      num: '01',
      title: 'Write your message',
      body: 'Open your heart. Write a letter to your future self — where you are, what you feel, what you hope for. Add a snapshot: your age, your city, your favorite song. Make it real.',
      icon: '✍️',
    },
    {
      num: '02',
      title: 'Pick your delivery date',
      body: 'Choose when you want to receive it. One year. Five years. The day of your 40th birthday. You decide exactly when future you opens this.',
      icon: '📅',
    },
    {
      num: '03',
      title: 'Pay once, securely',
      body: "We charge $1.85 per year of storage. One payment, no subscription, no surprises. A 5-year capsule costs $9.25 — less than a coffee. We use Stripe for secure checkout.",
      icon: '🔒',
    },
    {
      num: '04',
      title: 'It arrives when the time is right',
      body: "On your chosen date, your letter lands in your inbox — exactly as you wrote it. No edits, no revisions. A message from who you were, to who you've become.",
      icon: '📬',
    },
  ]

  return (
    <>
      <Head>
        <title>How it works — The Letter</title>
        <meta name="description" content="Four simple steps to create and send a time capsule letter to your future self." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{css}</style>
      </Head>

      <PublicNav />

      <main style={s.main}>
        <div style={s.hero}>
          <p style={s.eyebrow}>Simple by design</p>
          <h1 style={s.title}>How it works</h1>
          <p style={s.sub}>Four steps. Five minutes. A message that waits for you.</p>
        </div>

        <div style={s.steps}>
          {steps.map((step, i) => (
            <div key={i} style={s.step}>
              <div style={s.stepLeft}>
                <span style={s.stepNum}>{step.num}</span>
                {i < steps.length - 1 && <div style={s.connector} />}
              </div>
              <div style={s.stepRight}>
                <div style={s.stepIcon}>{step.icon}</div>
                <h2 style={s.stepTitle}>{step.title}</h2>
                <p style={s.stepBody}>{step.body}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={s.cta}>
          <h2 style={s.ctaTitle}>Ready to write yours?</h2>
          <button onClick={() => router.push('/')} style={s.ctaBtn}>Create your first capsule →</button>
        </div>
      </main>

      <footer style={s.footer}>
        <span style={s.footerLogo} onClick={() => router.push('/')}>The Letter</span>
        <p style={s.footerCopy}>© 2026 The Letter</p>
      </footer>
    </>
  )
}

const css = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, 'Helvetica Neue', sans-serif; background: #faf9f7; }
`

const nav = {
  bar: { position: 'sticky', top: 0, zIndex: 100, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', backgroundColor: 'rgba(26,26,26,0.97)', backdropFilter: 'blur(10px)' },
  logo: { fontFamily: "'Georgia','Times New Roman',serif", fontSize: 20, fontWeight: 'bold', color: '#fff', cursor: 'pointer' },
  right: { display: 'flex', gap: 10 },
  signIn: { padding: '7px 16px', backgroundColor: 'transparent', color: '#ccc', border: '1px solid #444', borderRadius: 6, fontSize: 13, cursor: 'pointer' },
  signUp: { padding: '7px 16px', backgroundColor: '#f59e0b', color: '#1a1a1a', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 'bold', cursor: 'pointer' },
}

const s = {
  main: { maxWidth: 700, margin: '0 auto', padding: '60px 24px 80px' },
  hero: { textAlign: 'center', marginBottom: 64 },
  eyebrow: { fontSize: 12, fontWeight: 'bold', color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: 12 },
  title: { fontFamily: "'Georgia','Times New Roman',serif", fontSize: 42, color: '#1a1a1a', marginBottom: 16 },
  sub: { fontSize: 18, color: '#666', lineHeight: 1.6 },
  steps: { display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 64 },
  step: { display: 'flex', gap: 24, paddingBottom: 0 },
  stepLeft: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: 48, flexShrink: 0 },
  stepNum: { width: 48, height: 48, backgroundColor: '#1a1a1a', color: '#f59e0b', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 'bold', flexShrink: 0 },
  connector: { width: 2, flex: 1, backgroundColor: '#e8e4de', minHeight: 40, margin: '8px 0' },
  stepRight: { paddingBottom: 48, flex: 1 },
  stepIcon: { fontSize: 28, marginBottom: 10 },
  stepTitle: { fontFamily: "'Georgia','Times New Roman',serif", fontSize: 22, color: '#1a1a1a', marginBottom: 10 },
  stepBody: { fontSize: 16, color: '#555', lineHeight: 1.8 },
  cta: { backgroundColor: '#1a1a1a', borderRadius: 16, padding: '48px 40px', textAlign: 'center' },
  ctaTitle: { fontFamily: "'Georgia','Times New Roman',serif", fontSize: 28, color: '#fff', marginBottom: 24 },
  ctaBtn: { padding: '14px 36px', backgroundColor: '#f59e0b', color: '#1a1a1a', border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 'bold', cursor: 'pointer' },
  footer: { backgroundColor: '#111', padding: '28px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 },
  footerLogo: { fontFamily: "'Georgia','Times New Roman',serif", fontSize: 18, color: '#fff', cursor: 'pointer' },
  footerCopy: { fontSize: 12, color: '#555' },
}
