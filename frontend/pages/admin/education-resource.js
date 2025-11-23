// pages/admin/blog-management.js
import Head from 'next/head'
import AdminLayout from '@/components/Admin/AdminLayout'
import EducationResource from '@/components/Admin/Education-Resource'
import { siteConfig } from '../../config/site'

export default function EducationResourcePage() {
  return (
    <>
      <Head>
        <title>Blog Management - {siteConfig.name}</title>
        <meta name="description" content="Manage education resources and blog content for scam protection awareness" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <AdminLayout>
        <EducationResource />
      </AdminLayout>
    </>
  )
}