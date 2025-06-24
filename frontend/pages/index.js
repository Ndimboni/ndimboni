import Head from 'next/head'
import Layout from '../components/Layout/Layout'
import Home from '../components/Layout/Home.jsx'


export default function IndexPage() {
  return (
    <Layout>
      <Head>
        <title>Ndimboni - Digital Platform</title>
        <meta name="description" content="Ndimboni- Modern Web Application" />
      </Head>
      <Home />
      
    </Layout>
  )
}