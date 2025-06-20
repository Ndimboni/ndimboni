// pages/admin/scam-report.js
import Head from 'next/head'
import ModeratorLayout from '../../components/Moderator/ModeratorLayout'
import ScammerReportPage from '../../components/Moderator/ScamReports'

export default function ScamReportPage() {
  return (
    <>
      <Head>
        <title>Scam Reports - Ndimboni Digital Scam Protection</title>
        <meta name="description" content="Manage and review reported scammers and fraudulent activities" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ModeratorLayout>
        <ScammerReportPage />
      </ModeratorLayout>
    </>
  )
}