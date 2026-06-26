import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import SiteNav from '../components/SiteNav'
import SiteFooter from '../components/SiteFooter'

const WINE = '#952323'
const CREAM = '#FFE6E1'
const BLUSH = '#EDBFC6'
const CHARCOAL = '#393232'
const F = { serif: "'Lora','Georgia',serif", sans: "'Inter',Arial,sans-serif" }

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
]

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: `1px solid ${BLUSH}` }}>
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
      </Head>

      <SiteNav />

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

      <SiteFooter />
    </>
  )
}

const s = {
  main: { minHeight: 'calc(100vh - 64px)', backgroundColor: CREAM, maxWidth: 680, margin: '0 auto', padding: '60px 24px 80px' },
  hero: { textAlign: 'center', marginBottom: 48 },
  eyebrow: {
    fontFamily: F.sans, fontSize: 12, fontWeight: 700, color: WINE,
    textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: 12,
  },
  title: { fontFamily: F.serif, fontSize: 42, color: CHARCOAL, marginBottom: 14 },
  sub: { fontFamily: F.sans, fontSize: 17, color: '#666', lineHeight: 1.6 },

  list: {
    backgroundColor: '#fff', borderRadius: 12,
    border: `1px solid ${BLUSH}`, overflow: 'hidden', marginBottom: 40,
  },
  question: {
    width: '100%', display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', padding: '20px 24px',
    backgroundColor: 'transparent', border: 'none',
    fontFamily: F.sans, fontSize: 16, fontWeight: 600, color: CHARCOAL,
    textAlign: 'left', gap: 16,
  },
  chevron: {
    fontFamily: F.sans, fontSize: 18, color: '#aaa',
    flexShrink: 0, transition: 'transform 0.2s',
  },
  answer: {
    fontFamily: F.sans, padding: '0 24px 20px',
    fontSize: 15, color: '#555', lineHeight: 1.8,
  },

  contact: {
    textAlign: 'center', padding: '32px',
    backgroundColor: '#fff', borderRadius: 12,
    border: `1px solid ${BLUSH}`, marginBottom: 40,
  },
  contactText: { fontFamily: F.sans, fontSize: 16, color: '#888', marginBottom: 10 },
  contactLink: { fontFamily: F.sans, fontSize: 17, color: WINE, textDecoration: 'none', fontWeight: 600 },

  cta: { textAlign: 'center' },
  ctaBtn: {
    padding: '14px 36px', backgroundColor: WINE, color: '#fff',
    border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, fontFamily: F.sans,
  },
}
