// pages/admin/blog-management.js
import Head from 'next/head'
import AdminLayout from '../../components/Admin/AdminLayout'
import BlogManagementPage from '../../components/Admin/Education-Resource'

export default function EducationResource() {
  return (
    <>
      <Head>
        <title>Blog Management - Ndimboni Digital Scam Protection</title>
        <meta name="description" content="Manage education resources and blog content for scam protection awareness" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <AdminLayout>
        <BlogManagementPage />
      </AdminLayout>
    </>
  )
}