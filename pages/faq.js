import { useState } from 'react'
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

const faqs = [
  {
    q: 'How far in the future can I set the delivery date?',
    a: "As far as you'd like — 1 year, 10 years, 50 years. The minimum is 1 month from today. The maximum is whenever you want.",
  },
  {
    q: 'What if I change my email address?',
    a: "Your capsule will be delivered to the email address on your account. Log in to update your email before your delivery date. We can't reroute a capsule after delivery is triggered.",
  },
  {
    q: 'Can I edit a capsule after sealing it?',
    a: "No — and that's by design. Once sealed, your capsule is locked. The whole point is a snapshot of exactly who you were. No revisions, no second-guessing.",
  },
  {
    q: 'Can I get a refund?',
    a: "Due to the nature of time capsule storage, all sales are final once a capsule is sealed. Drafts that haven't been paid for can be deleted at any time.",
  },
  {
    q: 'Is my message private?',
    a: "Yes. Your message is stored securely and only delivered to your email. We don't read capsule content. Your words are yours.",
  },
  {
    q: 'What happens if The Letter shuts down?',
    a: "We take this seriously. If we ever need to shut down, we'll contact all users well in advance and deliver all capsules immediately — no matter how far out the delivery date was.",
  },
  {
    q: 'Can I seal multiple capsules?',
    a: "Yes! You can create as many capsules as you want and seal them all in one checkout. Each capsule gets its own delivery date and price.",
  },
  {
    q: 'What does the $1.85/year cover?',
    a: "Storage of your message, secure delivery on your chosen date, and any reminders leading up to it. One payment covers everything — no subscription ever.",
  },
  {
    q: 'Do I need an account to read the FAQ?',
    a: "No. The homepage, FAQ, and pricing are all public. You only need an account to create and seal a capsule.",
  },
]

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ ...s.item, borderBottom: '1px solid #e8e4de' }}>
      <button onClick={() => setOpen(o => !o)} style={s.question}>
        <span>{q}</span>
        <span style={{ ...s.chevron, transform: open ? 'rotate(180deg)' : 'none' }}>▾</span>
      </button>
      {open && <p style={s.answer}>{a}</p>}
    </div>
  )
}

export default function FAQ() {
  const router = useRouter()
  return (
    <>
      <Head>
        <title>FAQ — The Letter</title>
        <meta name="description" content="Frequently asked questions about The Letter time capsule app." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; } body { font-family: Arial, 'Helvetica Neue', sans-serif; background: #faf9f7; }`}</style>
      </Head>

      <PublicNav />

      <main style={s.main}>
        <div style={s.hero}>
          <p style={s.eyebrow}>Got questions?</p>
          <h1 style={s.title}>Frequently asked questions</h1>
          <p style={s.sub}>Everything you need to know before writing your first capsule.</p>
        </div>

        <div style={s.list}>
          {faqs.map((faq, i) => <FAQItem key={i} q={faq.q} a={faq.a} />)}
        </div>

        <div style={s.contact}>
          <p style={s.contactText}>Still have a question?</p>
          <a href="mailto:hello@theletter.app" style={s.contactLink}>hello@theletter.app</a>
        </div>

        <div style={s.cta}>
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

const nav = {
  bar: { position: 'sticky', top: 0, zIndex: 100, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', backgroundColor: 'rgba(26,26,26,0.97)', backdropFilter: 'blur(10px)' },
  logo: { fontFamily: "'Georgia','Times New Roman',serif", fontSize: 20, fontWeight: 'bold', color: '#fff', cursor: 'pointer' },
  right: { display: 'flex', gap: 10 },
  signIn: { padding: '7px 16px', backgroundColor: 'transparent', color: '#ccc', border: '1px solid #444', borderRadius: 6, fontSize: 13, cursor: 'pointer' },
  signUp: { padding: '7px 16px', backgroundColor: '#f59e0b', color: '#1a1a1a', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 'bold', cursor: 'pointer' },
}

const s = {
  main: { maxWidth: 680, margin: '0 auto', padding: '60px 24px 80px' },
  hero: { textAlign: 'center', marginBottom: 48 },
  eyebrow: { fontSize: 12, fontWeight: 'bold', color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: 12 },
  title: { fontFamily: "'Georgia','Times New Roman',serif", fontSize: 42, color: '#1a1a1a', marginBottom: 14 },
  sub: { fontSize: 17, color: '#666', lineHeight: 1.6 },
  list: { backgroundColor: '#fff', borderRadius: 12, border: '1px solid #e8e4de', overflow: 'hidden', marginBottom: 40 },
  item: {},
  question: { width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'Arial,sans-serif', fontSize: 16, fontWeight: 'bold', color: '#1a1a1a', textAlign: 'left', gap: 16 },
  chevron: { fontSize: 18, color: '#888', flexShrink: 0, transition: 'transform 0.2s' },
  answer: { padding: '0 24px 20px', fontSize: 15, color: '#555', lineHeight: 1.8 },
  contact: { textAlign: 'center', padding: '32px', backgroundColor: '#fff', borderRadius: 12, border: '1px solid #e8e4de', marginBottom: 40 },
  contactText: { fontSize: 16, color: '#888', marginBottom: 10 },
  contactLink: { fontSize: 18, color: '#f59e0b', textDecoration: 'none', fontWeight: 'bold' },
  cta: { textAlign: 'center' },
  ctaBtn: { padding: '14px 36px', backgroundColor: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 'bold', cursor: 'pointer' },
  footer: { backgroundColor: '#111', padding: '28px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 },
  footerLogo: { fontFamily: "'Georgia','Times New Roman',serif", fontSize: 18, color: '#fff', cursor: 'pointer' },
  footerCopy: { fontSize: 12, color: '#555' },
}
