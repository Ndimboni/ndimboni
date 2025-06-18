// pages/admin/scam-check.js
import Head from 'next/head'
import AdminLayout from '../../components/Admin/AdminLayout'
import ScamCheck from '../../components/Admin/ScamCheck'

export default function ScamCheckPage() {
  return (
    <>
      <Head>
        <title>ScamCheck Results - Ndimboni Digital Scam Protection</title>
        <meta name="description" content="Monitor AI-powered scam detection results and manual reviews" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <AdminLayout>
        <ScamCheck />
      </AdminLayout>
    </>
  )
}