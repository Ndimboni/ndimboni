import Head from 'next/head'
import AdminLayout from '../../components/Admin/AdminLayout'
import ContactMessagesPage from '../../components/Admin/Message'

export default function ContactMessages() {
  return (
    <>
      <Head>
        <title>Contact Messages - Digital Scam Protection</title>
        <meta name="description" content="Digital Scam Protection Admin Panel - Manage and respond to contact messages from users" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <AdminLayout>
        <ContactMessagesPage />
      </AdminLayout>
    </>
  )
}