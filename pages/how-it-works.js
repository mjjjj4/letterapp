import { useRouter } from 'next/router'
import Head from 'next/head'
import SiteNav from '../components/SiteNav'
import SiteFooter from '../components/SiteFooter'

const WINE = '#952323'
const CREAM = '#FFE6E1'
const BLUSH = '#EDBFC6'
const CHARCOAL = '#393232'
const F = { serif: "'Lora','Georgia',serif", sans: "'Inter',Arial,sans-serif" }

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

export default function HowItWorks() {
  const router = useRouter()
  return (
    <>
      <Head>
        <title>How it works — The Letter</title>
        <meta name="description" content="Four simple steps to create and send a time capsule letter to your future self." />
      </Head>

      <SiteNav />

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

      <SiteFooter />
    </>
  )
}

const s = {
  main: { minHeight: 'calc(100vh - 64px)', backgroundColor: CREAM, maxWidth: 700, margin: '0 auto', padding: '60px 24px 80px' },
  hero: { textAlign: 'center', marginBottom: 64 },
  eyebrow: {
    fontFamily: F.sans, fontSize: 12, fontWeight: 700, color: WINE,
    textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: 12,
  },
  title: { fontFamily: F.serif, fontSize: 42, color: CHARCOAL, marginBottom: 16 },
  sub: { fontFamily: F.sans, fontSize: 18, color: '#666', lineHeight: 1.6 },

  steps: { display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 64 },
  step: { display: 'flex', gap: 24, paddingBottom: 0 },
  stepLeft: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: 48, flexShrink: 0 },
  stepNum: {
    width: 48, height: 48, backgroundColor: WINE, color: '#fff',
    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: F.sans, fontSize: 14, fontWeight: 700, flexShrink: 0,
  },
  connector: { width: 2, flex: 1, backgroundColor: BLUSH, minHeight: 40, margin: '8px 0' },
  stepRight: { paddingBottom: 48, flex: 1 },
  stepIcon: { fontSize: 28, marginBottom: 10 },
  stepTitle: { fontFamily: F.serif, fontSize: 22, color: CHARCOAL, marginBottom: 10 },
  stepBody: { fontFamily: F.sans, fontSize: 16, color: '#555', lineHeight: 1.8 },

  cta: {
    backgroundColor: CHARCOAL, borderRadius: 16, padding: '48px 40px', textAlign: 'center',
  },
  ctaTitle: { fontFamily: F.serif, fontSize: 28, color: '#fff', marginBottom: 24 },
  ctaBtn: {
    padding: '14px 36px', backgroundColor: WINE, color: '#fff',
    border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 600,
    fontFamily: F.sans,
  },
}
