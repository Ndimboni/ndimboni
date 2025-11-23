import Head from 'next/head'
import Layout from '../components/Layout/Layout'
import About from '@/components/Layout/About'
import { siteConfig } from '../config/site'

export default function AboutPage() {
  return (
    <Layout>
      <Head>
        <title>About - {siteConfig.name}</title>
        <meta name="description" content={`Learn more about ${siteConfig.name} - Digital Scam Protection Platform`} />
      </Head>
      <About />
    </Layout>
  )
}