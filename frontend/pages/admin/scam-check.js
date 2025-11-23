import Head from 'next/head'
import AdminLayout from '@/components/Admin/AdminLayout'
import ScamCheck from '@/components/Admin/ScamCheck'
import { siteConfig } from '../../config/site'

export default function ScamCheckPage() {
  return (
    <AdminLayout>
      <Head>
        <title>ScamCheck Results - {siteConfig.name}</title>
        <meta name="description" content="Monitor AI-powered scam detection results and manual reviews" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ScamCheck />
    </AdminLayout>
  )
}