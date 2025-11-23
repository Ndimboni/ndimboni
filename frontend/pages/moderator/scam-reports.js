// pages/admin/scam-report.js
import Head from 'next/head'
import ModeratorLayout from '@/components/Moderator/ModeratorLayout'
import ScamReports from '@/components/Moderator/ScamReports'
import { siteConfig } from '../../config/site'

export default function ScamReportsPage() {
  return (
    <ModeratorLayout>
      <Head>
        <title>Scam Reports - {siteConfig.name}</title>
      </Head>
      <ScamReports />
    </ModeratorLayout>
  )
}