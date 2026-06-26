import Head from 'next/head'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
        <style>{`
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          html { scroll-behavior: smooth; }
          body { font-family: 'Inter','Helvetica Neue',Arial,sans-serif; background: #FFFBF5; color: #3A2418; }
          a { text-decoration: none; color: inherit; }
          button { font-family: inherit; cursor: pointer; }

          /* Shared nav responsive */
          .desktop-nav { display: flex; align-items: center; gap: 16px; }
          .hamburger-btn { display: none !important; }

          /* Footer grid */
          .footer-cols { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 48px; }

          @media (max-width: 767px) {
            .desktop-nav { display: none !important; }
            .hamburger-btn { display: flex !important; flex-direction: column; gap: 5px; }
            .footer-cols { grid-template-columns: 1fr; gap: 32px; }
          }
        `}</style>
      </Head>
      <Component {...pageProps} />
    </>
  )
}
