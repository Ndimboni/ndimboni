import Head from 'next/head'
import ModeratorLayout from '../../components/Moderator/ModeratorLayout'
import ContactMessagesPage from '../../components/Moderator/Message'

export default function ContactMessages() {
  return (
    <>
      <Head>
        <title>Contact Messages - Digital Scam Protection</title>
        <meta name="description" content="Digital Scam Protection Moderator Panel - Manage and respond to contact messages from users" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <ModeratorLayout>
        <ContactMessagesPage />
      </ModeratorLayout>
    </>
  )
}