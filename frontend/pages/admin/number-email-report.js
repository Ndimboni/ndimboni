// pages/admin/number-email-report.js
import Head from 'next/head'
import AdminLayout from '../../components/Admin/AdminLayout'
import NumberEmailReport from '../../components/Admin/NumberEmailReport'

export default function NumberEmailReportPage() {
  return (
    <>
      <Head>
        <title>Number & Email Reports - Ndimboni Digital Scam Protection</title>
        <meta name="description" content="Manage reported suspicious phone numbers and email addresses" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <AdminLayout>
        <NumberEmailReport />
      </AdminLayout>
    </>
  )
}
