import Head from 'next/head'
import Layout from '../components/Layout/Layout'
import Auth from '../components/Layout/Auth'
import { siteConfig } from '../config/site'

export default function AuthPage() {
  return (
    <Layout>
      <Head>
        <title>Auth - {siteConfig.name}</title>
        <meta name="description" content={`Register And Login to ${siteConfig.name}`} />
      </Head>
      <Auth/>
    </Layout>
  )
}