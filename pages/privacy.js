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
    title: '1. What we collect',
    body: 'We collect your email address when you sign up. We store the content of your time capsules (title, message, and any snapshot fields you fill in) so we can deliver them on your chosen date. We do not collect payment card details — those are handled entirely by Stripe.',
  },
  {
    title: '2. How we use it',
    body: 'Your email is used to authenticate your account and to deliver your capsules on the dates you select. We do not use your email for marketing unless you explicitly opt in. We do not sell your data to third parties.',
  },
  {
    title: '3. Your capsule content',
    body: 'Your messages are stored securely in our database. We do not read capsule content. Capsule content is only accessed programmatically to deliver it to your email on the scheduled date.',
  },
  {
    title: '4. Cookies and tracking',
    body: 'We use essential cookies for authentication (via Supabase). We do not use advertising cookies or third-party tracking pixels.',
  },
  {
    title: '5. Data retention',
    body: 'Your account and capsules are retained until you delete your account. After a capsule is delivered, a copy may be retained for a reasonable period in case of delivery failure. You can request deletion of all your data by emailing hello@theletter.app.',
  },
  {
    title: '6. Third-party services',
    body: 'We use Supabase for database and authentication, Stripe for payment processing, and Resend for email delivery. Each of these services has its own privacy policy.',
  },
  {
    title: '7. Contact',
    body: 'Privacy questions? Email us at hello@theletter.app. We will respond within 5 business days.',
  },
]

export default function Privacy() {
  return (
    <>
      <Head>
        <title>Privacy Policy — The Letter</title>
        <meta name="description" content="Privacy policy for The Letter time capsule app." />
      </Head>

      <SiteNav />

      <main style={s.main}>
        <h1 style={s.title}>Privacy Policy</h1>
        <p style={s.updated}>Last updated: June 2026</p>
        <p style={s.intro}>
          The Letter is built on the belief that your messages deserve to stay private until you choose to open them. Here&rsquo;s exactly what we collect, what we do with it, and how we protect it.
        </p>
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
  updated: { fontFamily: F.sans, fontSize: 13, color: '#999', marginBottom: 28 },
  intro: {
    fontFamily: F.sans, fontSize: 16, color: '#555', lineHeight: 1.8,
    marginBottom: 40, padding: '20px 24px',
    backgroundColor: '#fff', borderRadius: 10, border: `1px solid ${BLUSH}`,
  },
  sections: { display: 'flex', flexDirection: 'column', gap: 32 },
  section: {},
  h2: { fontFamily: F.serif, fontSize: 20, color: CHARCOAL, marginBottom: 10 },
  p: { fontFamily: F.sans, fontSize: 15, color: '#555', lineHeight: 1.9 },
}
