import Head from 'next/head'
import AdminLayout from '../../components/Admin/AdminLayout'
 import AdminDashboard from '../../components/Admin/Dashboard' 

export default function DashboardPage() {
  return (
    <>
      <Head>
        <title>Admin Dashboard - Digital Scam Protection</title>
        <meta name="description" content="Digital Scam Protection Admin Dashboard - Monitor users, scam reports, and security checks" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <AdminLayout>
      <AdminDashboard /> 
      </AdminLayout>
    </>
  )
}