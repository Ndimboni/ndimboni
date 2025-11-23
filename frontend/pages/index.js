import Head from 'next/head'
import Layout from '../components/Layout/Layout'
import Home from '../components/Layout/Home.jsx'
import { siteConfig } from '../config/site'

export default function IndexPage() {
  return (
    <Layout>
      <Head>
        <title>{siteConfig.name} - {siteConfig.tagline}</title>
        <meta name="description" content={siteConfig.description} />
      </Head>
      <Home />
      
    </Layout>
  )
}