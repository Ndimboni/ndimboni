import Head from 'next/head'
import Layout from '../components/Layout/Layout'
import Education from '@/components/Layout/Education-Page'

export default function EducationPage() {
  return (
    <Layout>
      <Head>
        <title>Digital Security Education - Ndimboni Digital Platform</title>
        <meta name="description" content="Learn to identify, prevent, and report digital scams with our comprehensive educational resources. Empowering Rwandans with knowledge for digital security and scam prevention." />
        <meta name="keywords" content="digital security education, scam prevention, cybersecurity training, Rwanda, phishing awareness, fraud prevention, online safety, digital literacy" />
        <meta property="og:title" content="Digital Security Education - Ndimboni Digital Platform" />
        <meta property="og:description" content="Comprehensive digital security education resources to help Rwandans stay safe online and protect against digital scams and fraud." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://ndimboni.com/images/education-banner.jpg" />
        <meta property="og:url" content="https://ndimboni.com/education" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Digital Security Education - Ndimboni Digital Platform" />
        <meta name="twitter:description" content="Learn digital security skills and scam prevention techniques through our educational resources designed for Rwanda." />
        <meta name="twitter:image" content="https://ndimboni.com/images/education-banner.jpg" />
        <link rel="canonical" href="https://ndimboni.com/education" />
        
        {/* Additional SEO meta tags */}
        <meta name="author" content="Ndimboni Digital Platform" />
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="Content-Language" content="en-RW" />
        
        {/* Structured data for better SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "EducationalOrganization",
              "name": "Ndimboni Digital Platform - Education",
              "description": "Digital security education and scam prevention resources for Rwanda",
              "url": "https://ndimboni.com/education",
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "RW",
                "addressLocality": "Kigali"
              },
              "educationalUse": "Digital Security Training",
              "audience": {
                "@type": "Audience",
                "audienceType": "Rwanda Citizens"
              },
              "teaches": [
                "Scam Prevention",
                "Digital Security",
                "Cybersecurity Awareness",
                "Online Safety",
                "Fraud Detection"
              ]
            })
          }}
        />
      </Head>
      <Education />
    </Layout>
  )
}