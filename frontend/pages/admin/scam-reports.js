// pages/admin/scam-report.js
import Head from 'next/head'
import AdminLayout from '@/components/Admin/AdminLayout'
import ScamReports from '@/components/Admin/ScamReports'
import { siteConfig } from '../../config/site'

export default function ScamReportsPage() {
  return (
    <AdminLayout>
      <Head>
        <title>Scam Reports - {siteConfig.name}</title>
        <meta name="description" content="Manage and review reported scammers and fraudulent activities" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ScamReports />
    </AdminLayout>
  )
}