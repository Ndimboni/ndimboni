import Head from 'next/head'
import Layout from '../components/Layout/Layout'
import ReportPage from '@/components/Layout/Report'

export default function Report() {
  return (
    <Layout>
      <Head>
        <title>Report Scams - Ndimboni Digital Platform</title>
        <meta name="description" content="Report digital scams and fraudulent activities to help protect the Rwandan digital community. Confidential reporting system for phishing, investment scams, identity theft, and more." />
        <meta name="keywords" content="report scams, digital fraud, phishing, cybersecurity, Rwanda, scam reporting, fraud prevention" />
        <meta property="og:title" content="Report Scams - Ndimboni Digital Platform" />
        <meta property="og:description" content="Help protect Rwanda's digital community by reporting scams and fraudulent activities through our secure reporting system." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Report Scams - Ndimboni Digital Platform" />
        <meta name="twitter:description" content="Secure and confidential scam reporting system for Rwanda's digital protection." />
        <link rel="canonical" href="https://ndimboni.com/report" />
      </Head>
      <ReportPage />
    </Layout>
  )
}