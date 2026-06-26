import { useRouter } from 'next/router'

const WINE = '#952323'
const BLUSH = '#EDBFC6'
const CHARCOAL = '#393232'
const F = { serif: "'Lora','Georgia',serif", sans: "'Inter',Arial,sans-serif" }

export default function SiteFooter() {
  const router = useRouter()
  return (
    <footer style={ft.footer}>
      <div className="footer-cols" style={ft.cols}>

        {/* Brand + contact */}
        <div style={ft.col}>
          <span style={ft.logo} onClick={() => router.push('/')}>The Letter</span>
          <a href="mailto:hello@theletter.app" style={ft.email}>hello@theletter.app</a>
          <div style={ft.socialRow}>
            <a href="#" style={ft.socialLink} aria-label="Instagram">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a href="#" style={ft.socialLink} aria-label="Twitter / X">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a href="#" style={ft.socialLink} aria-label="TikTok">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Navigation */}
        <div style={ft.col}>
          <p style={ft.colLabel}>Explore</p>
          <a href="/how-it-works" style={ft.link}>How it works</a>
          <a href="/faq" style={ft.link}>FAQ</a>
          <a href="/about" style={ft.link}>About</a>
          <a href="/contact" style={ft.link}>Contact</a>
        </div>

        {/* Legal */}
        <div style={ft.col}>
          <p style={ft.colLabel}>Legal</p>
          <a href="/privacy" style={ft.link}>Privacy Policy</a>
          <a href="/terms" style={ft.link}>Terms of Service</a>
        </div>

      </div>

      <div style={ft.bottom}>
        <span style={ft.copy}>© 2026 The Letter — Messages worth waiting for</span>
      </div>
    </footer>
  )
}

const ft = {
  footer: { backgroundColor: CHARCOAL, padding: '56px 28px 0' },
  cols: { maxWidth: 1100, margin: '0 auto', paddingBottom: 48 },
  col: { display: 'flex', flexDirection: 'column', gap: 12 },
  logo: {
    fontFamily: F.serif, fontSize: 22, fontWeight: 700, color: '#fff',
    cursor: 'pointer', userSelect: 'none',
  },
  email: { fontFamily: F.sans, fontSize: 13, color: '#a89494', textDecoration: 'none' },
  socialRow: { display: 'flex', gap: 14, marginTop: 4 },
  socialLink: { color: '#c8a8a8', textDecoration: 'none', display: 'flex', alignItems: 'center' },
  colLabel: {
    fontFamily: F.sans, fontSize: 11, fontWeight: 600,
    color: '#a89494', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 4,
  },
  link: { fontFamily: F.sans, fontSize: 14, color: '#c8a8a8', textDecoration: 'none' },
  bottom: {
    borderTop: '1px solid #4a3838',
    padding: '20px 0',
    maxWidth: 1100, margin: '0 auto',
    textAlign: 'center',
  },
  copy: { fontFamily: F.sans, fontSize: 12, color: '#6a5858' },
}
