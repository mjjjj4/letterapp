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
  const router = useRouter()
  return (
    <>
      <Head>
        <title>Privacy Policy — The Letter</title>
        <meta name="description" content="Privacy policy for The Letter time capsule app." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; } body { font-family: Arial, 'Helvetica Neue', sans-serif; background: #faf9f7; }`}</style>
      </Head>

      <PublicNav />

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
  updated: { fontSize: 13, color: '#999', marginBottom: 28 },
  intro: { fontSize: 16, color: '#555', lineHeight: 1.8, marginBottom: 40, padding: '20px 24px', backgroundColor: '#fff', borderRadius: 10, border: '1px solid #e8e4de' },
  sections: { display: 'flex', flexDirection: 'column', gap: 32 },
  section: {},
  h2: { fontFamily: "'Georgia','Times New Roman',serif", fontSize: 20, color: '#1a1a1a', marginBottom: 10 },
  p: { fontSize: 15, color: '#555', lineHeight: 1.9 },
  footer: { backgroundColor: '#111', padding: '28px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 },
  footerLogo: { fontFamily: "'Georgia','Times New Roman',serif", fontSize: 18, color: '#fff', cursor: 'pointer' },
  footerCopy: { fontSize: 12, color: '#555' },
}
