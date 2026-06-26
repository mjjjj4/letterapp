import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import SignupModal from './SignupModal'

const WINE = '#952323'
const CREAM = '#FFE6E1'
const BLUSH = '#EDBFC6'
const CHARCOAL = '#393232'
const F = { serif: "'Lora','Georgia',serif", sans: "'Inter',Arial,sans-serif" }

export default function SiteNav({ onSignUp }) {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) {
        try {
          const c = JSON.parse(localStorage.getItem('letterCart') || '[]')
          setCartCount(c.length)
        } catch {}
      }
    })
  }, [])

  const triggerSignUp = () => {
    setMenuOpen(false)
    if (onSignUp) onSignUp()
    else setModalOpen(true)
  }

  const handleLogout = async () => {
    setMenuOpen(false)
    await supabase.auth.signOut()
    router.push('/')
  }

  const go = (path) => { setMenuOpen(false); router.push(path) }

  return (
    <>
      {modalOpen && <SignupModal onClose={() => setModalOpen(false)} />}

      {/* Mobile drawer */}
      {menuOpen && (
        <div style={mn.overlay} onClick={() => setMenuOpen(false)}>
          <div style={mn.drawer} onClick={e => e.stopPropagation()}>
            <div style={mn.header}>
              <span style={mn.brand}>The Letter</span>
              <button onClick={() => setMenuOpen(false)} style={mn.closeBtn} aria-label="Close menu">✕</button>
            </div>
            <div style={mn.body}>
              {user ? (
                <>
                  <a href="/dashboard" style={mn.primaryLink} onClick={e => { e.preventDefault(); go('/dashboard') }}>
                    Your Capsules
                  </a>
                  <a href="/create" style={mn.primaryLink} onClick={e => { e.preventDefault(); go('/create') }}>
                    Create Capsule
                  </a>
                  {cartCount > 0 && (
                    <a href="/cart" style={mn.link} onClick={e => { e.preventDefault(); go('/cart') }}>
                      Cart ({cartCount})
                    </a>
                  )}
                  <div style={mn.divider} />
                </>
              ) : (
                <>
                  <button onClick={triggerSignUp} style={mn.signUpBtn}>Sign up</button>
                  <a href="/login" style={mn.signInLink}>Sign in</a>
                  <div style={mn.divider} />
                </>
              )}
              <a href="/how-it-works" style={mn.link}>How it works</a>
              <a href="/faq" style={mn.link}>FAQ</a>
              <a href="/about" style={mn.link}>About</a>
              <a href="/contact" style={mn.link}>Contact</a>
              <div style={mn.divider} />
              <a href="/privacy" style={mn.linkSmall}>Privacy</a>
              <a href="/terms" style={mn.linkSmall}>Terms</a>
              {user && (
                <>
                  <div style={mn.divider} />
                  <button onClick={handleLogout} style={mn.signOutBtn}>Sign out</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Nav bar */}
      <nav style={n.nav}>
        <span style={n.logo} onClick={() => router.push('/')}>The Letter</span>

        {/* Desktop right */}
        <div className="desktop-nav">
          {user ? (
            <>
              {cartCount > 0 && (
                <button onClick={() => router.push('/cart')} style={n.cartBtn}>
                  Cart ({cartCount})
                </button>
              )}
              <button onClick={() => router.push('/create')} style={n.ghostBtn}>Create</button>
              <button onClick={() => router.push('/dashboard')} style={n.signUpBtn}>My Capsules</button>
              <span onClick={handleLogout} style={n.signInLink}>Sign out</span>
            </>
          ) : (
            <>
              <button onClick={triggerSignUp} style={n.signUpBtn}>Sign up</button>
              <span onClick={() => router.push('/login')} style={n.signInLink}>Sign in</span>
            </>
          )}
        </div>

        {/* Hamburger */}
        <button className="hamburger-btn" onClick={() => setMenuOpen(true)} style={n.hamburger} aria-label="Open menu">
          <span style={n.bar} /><span style={n.bar} /><span style={n.bar} />
        </button>
      </nav>
    </>
  )
}

const n = {
  nav: {
    position: 'sticky', top: 0, left: 0, right: 0, zIndex: 1000,
    height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 28px',
    backgroundColor: 'rgba(255,230,225,0.97)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid rgba(237,191,198,0.5)',
  },
  logo: {
    fontFamily: F.serif, fontSize: 22, fontWeight: 700, color: WINE,
    cursor: 'pointer', letterSpacing: '0.3px', userSelect: 'none',
  },
  signUpBtn: {
    padding: '9px 22px', backgroundColor: WINE, color: '#fff',
    border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 600, fontFamily: F.sans,
  },
  ghostBtn: {
    padding: '8px 18px', backgroundColor: 'transparent', color: CHARCOAL,
    border: `1.5px solid ${BLUSH}`, borderRadius: 6,
    fontSize: 14, fontWeight: 500, fontFamily: F.sans,
  },
  cartBtn: {
    padding: '8px 16px', backgroundColor: 'transparent', color: WINE,
    border: `1.5px solid ${WINE}`, borderRadius: 6,
    fontSize: 13, fontWeight: 600, fontFamily: F.sans,
  },
  signInLink: {
    fontSize: 14, color: CHARCOAL, cursor: 'pointer',
    fontFamily: F.sans, fontWeight: 500, userSelect: 'none',
  },
  hamburger: {
    display: 'flex', flexDirection: 'column', gap: 5,
    background: 'transparent', border: 'none', padding: 6,
  },
  bar: { display: 'block', width: 24, height: 2, backgroundColor: CHARCOAL, borderRadius: 2 },
}

const mn = {
  overlay: {
    position: 'fixed', inset: 0, backgroundColor: 'rgba(57,50,50,0.55)', zIndex: 1500,
  },
  drawer: {
    position: 'absolute', top: 0, right: 0, bottom: 0, width: 300,
    backgroundColor: CREAM,
    boxShadow: '-4px 0 24px rgba(57,50,50,0.15)',
    display: 'flex', flexDirection: 'column',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '20px 20px 16px',
    borderBottom: `1px solid ${BLUSH}`,
  },
  brand: { fontFamily: F.serif, fontSize: 20, fontWeight: 700, color: WINE },
  closeBtn: {
    background: 'transparent', border: 'none', fontSize: 20, color: '#999',
  },
  body: {
    display: 'flex', flexDirection: 'column', padding: '20px',
    gap: 4, flex: 1, overflowY: 'auto',
  },
  signUpBtn: {
    width: '100%', padding: '14px',
    backgroundColor: WINE, color: '#fff', border: 'none',
    borderRadius: 8, fontSize: 16, fontWeight: 600,
    fontFamily: F.sans, textAlign: 'center', marginBottom: 4,
  },
  signInLink: {
    display: 'block', fontSize: 16, color: CHARCOAL,
    textDecoration: 'none', padding: '12px 0',
    borderBottom: `1px solid ${BLUSH}`, fontFamily: F.sans, fontWeight: 500,
  },
  primaryLink: {
    display: 'block', fontSize: 16, fontWeight: 600, color: WINE,
    textDecoration: 'none', padding: '12px 0',
    borderBottom: `1px solid ${BLUSH}`, fontFamily: F.sans,
  },
  divider: { height: 1, backgroundColor: BLUSH, margin: '8px 0' },
  link: {
    fontSize: 15, color: CHARCOAL, textDecoration: 'none',
    padding: '11px 0', borderBottom: `1px solid rgba(237,191,198,0.5)`,
    fontFamily: F.sans,
  },
  linkSmall: {
    fontSize: 13, color: '#888', textDecoration: 'none',
    padding: '10px 0', borderBottom: `1px solid rgba(237,191,198,0.3)`,
    fontFamily: F.sans,
  },
  signOutBtn: {
    width: '100%', padding: '12px',
    backgroundColor: 'transparent', color: '#888',
    border: `1px solid ${BLUSH}`, borderRadius: 8,
    fontSize: 14, fontFamily: F.sans, textAlign: 'center',
  },
}
