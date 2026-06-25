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
  const router = useRouter()
  return (
    <>
      <Head>
        <title>Terms of Service — The Letter</title>
        <meta name="description" content="Terms of service for The Letter time capsule app." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; } body { font-family: Arial, 'Helvetica Neue', sans-serif; background: #faf9f7; }`}</style>
      </Head>

      <PublicNav />

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
  title: { fontFamily: "'Georgia','Times New Roman',serif", fontSize: 38, color: '#1a1a1a', marginBottom: 10 },
  updated: { fontSize: 13, color: '#999', marginBottom: 40 },
  sections: { display: 'flex', flexDirection: 'column', gap: 32 },
  section: {},
  h2: { fontFamily: "'Georgia','Times New Roman',serif", fontSize: 20, color: '#1a1a1a', marginBottom: 10 },
  p: { fontSize: 15, color: '#555', lineHeight: 1.9 },
  footer: { backgroundColor: '#111', padding: '28px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 },
  footerLogo: { fontFamily: "'Georgia','Times New Roman',serif", fontSize: 18, color: '#fff', cursor: 'pointer' },
  footerCopy: { fontSize: 12, color: '#555' },
}
