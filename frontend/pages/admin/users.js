import Head from 'next/head'
import AdminLayout from '../../components/Admin/AdminLayout'
import AdminUsersPage from '../../components/Admin/AdminUsers'

export default function UsersPage() {
  return (
    <>
      <Head>
        <title>Users Management - Digital Scam Protection</title>
        <meta name="description" content="Digital Scam Protection Users Management - Manage user accounts, roles, and permissions" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <AdminLayout>
        <AdminUsersPage />
      </AdminLayout>
    </>
  )
}