import Head from 'next/head'
import Layout from '../components/Layout/Layout'
import Report from '@/components/Layout/Report'
import { siteConfig } from '../config/site'

export default function ReportPage() {
  return (
    <Layout>
      <Head>
        <title>Report Scams - {siteConfig.name}</title>
        <meta name="description" content="Report suspicious numbers, links, or messages to help protect the community." />
        <meta name="keywords" content="report scam, fraud reporting, scammer alert, rwanda scam report, digital safety" />
        <meta property="og:title" content={`Report Scams - ${siteConfig.name}`} />
        <meta property="og:description" content="Report suspicious numbers, links, or messages to help protect the community." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://ndimboni.com/report" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`Report Scams - ${siteConfig.name}`} />
        <meta name="twitter:description" content="Report suspicious numbers, links, or messages to help protect the community." />
        <link rel="canonical" href="https://ndimboni.com/report" />
      </Head>
      <Report />
    </Layout>
  )
}