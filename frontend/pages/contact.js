import Head from 'next/head'
import Layout from '../components/Layout/Layout'
import Contact from '@/components/Layout/Contact'
import { siteConfig } from '../config/site'

export default function ContactPage() {
  return (
    <Layout>
      <Head>
        <title>Contact - {siteConfig.name}</title>
        <meta name="description" content={`Contact ${siteConfig.name}`} />
      </Head>
      <Contact />
    </Layout>
  )
}