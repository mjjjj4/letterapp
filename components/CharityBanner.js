import { useState, useEffect } from 'react'

const WINE = '#952323'
const CHARCOAL = '#393232'
const F = { sans: "'Inter',Arial,sans-serif", serif: "'Lora','Georgia',serif" }

export default function CharityBanner() {
  const [donated, setDonated] = useState(null)

  useEffect(() => {
    fetch('/api/donation-total')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setDonated(d.total) })
      .catch(() => {})
  }, [])

  const fmt = (n) =>
    n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <a
      href="https://nationalpcf.org"
      target="_blank"
      rel="noopener noreferrer"
      style={s.banner}
    >
      <span style={s.heart}>💛</span>
      <span style={s.text}>
        <span style={s.main}>5% of every capsule sealed goes to the </span>
        <span style={s.org}>National Pediatric Cancer Foundation</span>
        {donated !== null && donated > 0 && (
          <span style={s.counter}> &middot; We&rsquo;ve donated ${fmt(donated)}</span>
        )}
      </span>
      <span style={s.arrow}>↗</span>
    </a>
  )
}

const s = {
  banner: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: 8, padding: '9px 20px',
    backgroundColor: '#fdf4f5', borderBottom: '1px solid #EDBFC6',
    textDecoration: 'none',
  },
  heart: { fontSize: 13, flexShrink: 0 },
  text: {
    fontFamily: F.sans, fontSize: 12, color: CHARCOAL,
    lineHeight: 1.4, textAlign: 'center',
  },
  main: { color: CHARCOAL },
  org: { color: WINE, fontWeight: 600 },
  counter: { color: '#777' },
  arrow: { fontSize: 11, color: '#aaa', flexShrink: 0 },
}
