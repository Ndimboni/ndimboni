// pages/admin/scam-check.js
import Head from 'next/head'
import ModeratorLayout from '@/components/Moderator/ModeratorLayout'
import ScamCheck from '@/components/Moderator/ScamCheck'
import { siteConfig } from '../../config/site'

export default function ScamCheckPage() {
  return (
    <ModeratorLayout>
      <Head>
        <title>ScamCheck Results - {siteConfig.name}</title>
      </Head>
      <ScamCheck />
    </ModeratorLayout>
  )
}