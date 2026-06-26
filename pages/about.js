import { useRouter } from 'next/router'
import Head from 'next/head'
import SiteNav from '../components/SiteNav'
import SiteFooter from '../components/SiteFooter'

const WINE = '#952323'
const CREAM = '#FFE6E1'
const BLUSH = '#EDBFC6'
const CHARCOAL = '#393232'
const F = { serif: "'Lora','Georgia',serif", sans: "'Inter',Arial,sans-serif" }

export default function About() {
  const router = useRouter()
  return (
    <>
      <Head>
        <title>About — The Letter</title>
        <meta name="description" content="The Letter is a time capsule app for messages worth waiting for." />
      </Head>

      <SiteNav />

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

      <SiteFooter />
    </>
  )
}

const s = {
  main: { minHeight: 'calc(100vh - 64px)', backgroundColor: CREAM, maxWidth: 660, margin: '0 auto', padding: '60px 24px 80px' },
  hero: { marginBottom: 40 },
  eyebrow: {
    fontFamily: F.sans, fontSize: 12, fontWeight: 700, color: WINE,
    textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: 12,
  },
  title: { fontFamily: F.serif, fontSize: 42, color: CHARCOAL },
  body: { display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 56 },
  p: { fontFamily: F.sans, fontSize: 17, color: '#444', lineHeight: 1.9 },
  h2: { fontFamily: F.serif, fontSize: 24, color: CHARCOAL, marginTop: 12 },
  quote: {
    backgroundColor: CHARCOAL, borderRadius: 12, padding: '28px 32px', margin: '8px 0',
  },
  quoteText: {
    fontFamily: F.serif, fontSize: 20, color: BLUSH,
    fontStyle: 'italic', lineHeight: 1.6,
  },
  link: { color: WINE, textDecoration: 'none', fontWeight: 600 },
  cta: { textAlign: 'center' },
  ctaBtn: {
    padding: '14px 36px', backgroundColor: WINE, color: '#fff',
    border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, fontFamily: F.sans,
  },
}
