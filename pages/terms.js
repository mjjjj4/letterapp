import Head from 'next/head'
import SiteNav from '../components/SiteNav'
import SiteFooter from '../components/SiteFooter'

const WINE = '#952323'
const CREAM = '#FFE6E1'
const BLUSH = '#EDBFC6'
const CHARCOAL = '#393232'
const F = { serif: "'Lora','Georgia',serif", sans: "'Inter',Arial,sans-serif" }

const sections = [
  {
    title: '1. Acceptance of terms',
    body: 'By creating an account or sealing a capsule, you agree to these Terms of Service. If you do not agree, do not use The Letter.',
  },
  {
    title: '2. The service',
    body: 'The Letter allows you to create time capsule messages that are stored and delivered to your email on a future date you select. You pay a one-time fee of $1.85 per year of storage at the time of sealing.',
  },
  {
    title: '3. Account responsibility',
    body: "You are responsible for maintaining access to your account email. If you lose access to your email address, you may not receive your capsule. We are not responsible for undeliverable capsules due to email changes or deactivations.",
  },
  {
    title: '4. Content',
    body: 'You own the content of your capsules. You agree not to use The Letter to store illegal content, content that violates third-party rights, or content intended to harm others. We reserve the right to delete accounts that violate these terms.',
  },
  {
    title: '5. Payments and refunds',
    body: 'All payments are processed by Stripe. All sales are final once a capsule is sealed. If a capsule fails to deliver due to our error, we will make reasonable efforts to re-deliver or offer a refund.',
  },
  {
    title: '6. Availability',
    body: 'We aim for high availability but do not guarantee uninterrupted service. In the event that The Letter must shut down, we will make reasonable efforts to deliver all pending capsules and notify all users.',
  },
  {
    title: '7. Limitation of liability',
    body: 'The Letter is provided "as is." We are not liable for indirect, incidental, or consequential damages arising from use of the service. Our total liability shall not exceed the amount you paid for the capsule in question.',
  },
  {
    title: '8. Changes to terms',
    body: 'We may update these terms from time to time. Material changes will be communicated by email. Continued use after notification constitutes acceptance.',
  },
  {
    title: '9. Contact',
    body: 'Questions about these terms? Email hello@theletter.app.',
  },
]

export default function Terms() {
  return (
    <>
      <Head>
        <title>Terms of Service — The Letter</title>
        <meta name="description" content="Terms of service for The Letter time capsule app." />
      </Head>

      <SiteNav />

      <main style={s.main}>
        <h1 style={s.title}>Terms of Service</h1>
        <p style={s.updated}>Last updated: June 2026</p>
        <div style={s.sections}>
          {sections.map((sec, i) => (
            <div key={i} style={s.section}>
              <h2 style={s.h2}>{sec.title}</h2>
              <p style={s.p}>{sec.body}</p>
            </div>
          ))}
        </div>
      </main>

      <SiteFooter />
    </>
  )
}

const s = {
  main: { minHeight: 'calc(100vh - 64px)', backgroundColor: CREAM, maxWidth: 680, margin: '0 auto', padding: '60px 24px 80px' },
  title: { fontFamily: F.serif, fontSize: 38, color: CHARCOAL, marginBottom: 10 },
  updated: { fontFamily: F.sans, fontSize: 13, color: '#999', marginBottom: 40 },
  sections: { display: 'flex', flexDirection: 'column', gap: 32 },
  section: {},
  h2: { fontFamily: F.serif, fontSize: 20, color: CHARCOAL, marginBottom: 10 },
  p: { fontFamily: F.sans, fontSize: 15, color: '#555', lineHeight: 1.9 },
}
