import Head from 'next/head'
import Layout from '../components/Layout/Layout'
import Education from '@/components/Layout/Education'

export default function EducationPage() {
  return (
    <Layout>
      <Head>
        <title>Digital Security Education - Ndimboni Digital Platform</title>
        <meta name="description" content="Empowering Rwandans with knowledge to identify, prevent, and report digital scams. Access educational resources, scam prevention tips, and community safety information." />
        <meta name="keywords" content="digital security, scam prevention, education, Rwanda, cybersecurity, online safety" />
        <meta property="og:title" content="Digital Security Education - Ndimboni Digital Platform" />
        <meta property="og:description" content="Empowering Rwandans with knowledge to identify, prevent, and report digital scams." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Digital Security Education - Ndimboni Digital Platform" />
        <meta name="twitter:description" content="Empowering Rwandans with knowledge to identify, prevent, and report digital scams." />
      </Head>
      <Education />
    </Layout>
  )
}