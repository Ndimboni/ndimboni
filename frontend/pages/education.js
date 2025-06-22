// pages/education.js
import Head from 'next/head'
import Layout from '../components/Layout/Layout'
import Education from '@/components/Layout/Education'

export default function EducationPage() {
  return (
    <Layout>
      <Head>
        <title>Education Resources - Ndimboni- Digital Platform</title>
        <meta name="description" content="Learn how to protect yourself from digital scams with comprehensive educational resources from Ndimboni" />
        <meta name="keywords" content="digital scams, cybersecurity education, Rwanda, scam prevention, digital literacy" />
        <meta property="og:title" content="Education Resources - Ndimboni Digital Platform" />
        <meta property="og:description" content="Learn how to protect yourself from digital scams with comprehensive educational resources" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Education Resources - Ndimboni" />
        <meta name="twitter:description" content="Learn digital scam prevention with interactive educational resources" />
      </Head>
      <Education />
    </Layout>
  )
}