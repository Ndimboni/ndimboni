import { Html, Head, Main, NextScript } from 'next/document'
import { siteConfig } from '../config/site'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Meta tags for SEO */}
        <meta charSet="utf-8" />
        <meta name="description" content={siteConfig.description} />
        <meta name="keywords" content={`${siteConfig.name}, web development, next.js, react`} />
        {/* <meta name="author" content="Your Name" /> Removed as per instruction */}
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        
        {/* Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://ndimboni.com/" />
        <meta property="og:title" content={siteConfig.name} />
        <meta property="og:description" content={siteConfig.description} />
        <meta property="og:image" content="https://ndimboni.com/og-image.jpg" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://ndimboni.com/" />
        <meta name="twitter:title" content={siteConfig.name} />
        {/* The original twitter:description was removed as per the instruction's implied change. */}
        <meta name="twitter:image" content="/twitter-image.png" />
        
        {/* Theme color for mobile browsers */}
        <meta name="theme-color" content="#2980B9" />
        <meta name="msapplication-TileColor" content="#2980B9" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}