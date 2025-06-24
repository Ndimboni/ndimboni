import Head from 'next/head'
import ModeratorLayout from '../../components/Moderator/ModeratorLayout'
import ModeratorDashboard from '../../components/Moderator/Dashboard' 

export default function DashboardPage() {
  return (
    <>
      <Head>
        <title>Moderator Dashboard - Digital Scam Protection</title>
        <meta name="description" content="Digital Scam Protection Moderator Dashboard - Monitor scam reports, and security checks" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <ModeratorLayout>
        <ModeratorDashboard />
      </ModeratorLayout>
    </>
  )
}