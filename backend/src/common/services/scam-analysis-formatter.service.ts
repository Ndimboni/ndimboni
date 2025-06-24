import { Injectable } from '@nestjs/common';
import { ScamCheckResponse } from '../../scam-check/scam-check.service';

@Injectable()
export class ScamAnalysisFormatterService {
  /**
   * Format scam analysis response consistently for all bot platforms
   */
  formatScamAnalysisResponse(
    message: string,
    { result }: ScamCheckResponse,
    platform: 'telegram' | 'whatsapp' = 'telegram',
  ): string {
    // Format risk level with consistent logic
    let riskLabel = 'LOW RISK';
    let riskIcon = '✅';
    if (result.riskScore >= 0.8) {
      riskLabel = '🚨 HIGH RISK';
      riskIcon = '🚨';
    } else if (result.riskScore >= 0.5) {
      riskLabel = '⚠️ MEDIUM RISK';
      riskIcon = '⚠️';
    }

    // Format risk score as percent
    const riskPercent = Math.round(result.riskScore * 100);

    // Recommendation based on risk level
    let recommendation =
      'Message appears relatively safe, but always stay vigilant.';
    if (result.riskScore >= 0.8) {
      recommendation =
        'This message is likely a SCAM. Do NOT engage, share personal info, or send money.';
    } else if (result.riskScore >= 0.5) {
      recommendation =
        'Be very cautious. This message shows suspicious patterns.';
    }

    // Format detected scam indicators
    let indicatorsText = '';
    if (result.reasons && result.reasons.length > 0) {
      // Use consistent header format
      indicatorsText =
        platform === 'telegram'
          ? '\n\n🔍 <b>Detected Red Flags:</b>\n'
          : '\n\n🔍 Detected Red Flags:\n';

      result.reasons.forEach((indicator: string, index: number) => {
        if (index < 5) {
          // Limit to 5 indicators to avoid long messages
          indicatorsText += `${index + 1}. ${indicator}\n`;
        }
      });

      if (result.reasons.length > 5) {
        indicatorsText += `... and ${result.reasons.length - 5} more indicators\n`;
      }
    }

    // Format scam type if detected (using aiAnalysis data if available)
    let scamTypeText = '';
    const scamType = result.aiAnalysis?.intentScore?.intent;
    if (scamType && scamType !== 'unknown' && scamType !== 'UNKNOWN') {
      scamTypeText =
        platform === 'telegram'
          ? `\n📋 <b>Scam Type:</b> ${scamType.replace('_', ' ').toUpperCase()}\n`
          : `\n📋 Scam Type: ${scamType.replace('_', ' ').toUpperCase()}\n`;
    }

    // Safety tips based on risk level
    let safetyTips = '';
    if (result.riskScore >= 0.5) {
      safetyTips =
        platform === 'telegram'
          ? '\n\n🛡️ <b>Safety Tips:</b>\n'
          : '\n\n🛡️ Safety Tips:\n';
      safetyTips += '• Never share personal information\n';
      safetyTips += "• Don't click suspicious links\n";
      safetyTips += '• Verify requests through official channels\n';
      safetyTips += '• Report suspicious messages to authorities\n';
    }

    // URL warning if suspicious links found (using aiAnalysis data)
    let urlWarning = '';
    const extractedUrls = result.aiAnalysis?.extractedIdentifiers?.urls;
    if (extractedUrls && extractedUrls.length > 0) {
      urlWarning =
        '\n\n⚠️ <b>Links Found:</b> Be extremely careful with any links in this message!';
    }

    // Handle message truncation consistently
    const truncatedMessage =
      message.length > 100 ? `${message.substring(0, 100)}...` : message;

    // Build response with consistent formatting using HTML for Telegram
    const messageFormat =
      platform === 'telegram'
        ? `📱 <b>Message Analyzed:</b>\n"${truncatedMessage}"`
        : `📱 Message Analyzed:\n"${truncatedMessage}"`;

    const riskFormat =
      platform === 'telegram'
        ? `${riskIcon} <b>Risk Level:</b> ${riskLabel}\n📊 <b>Risk Score:</b> ${riskPercent}%`
        : `${riskIcon} Risk Level: ${riskLabel}\n📊 Risk Score: ${riskPercent}%`;

    const recommendationFormat =
      platform === 'telegram'
        ? `💡 <b>Recommendation:</b> ${recommendation}`
        : `💡 Recommendation: ${recommendation}`;

    return `🔍 ${platform === 'telegram' ? '<b>Scam Analysis Results:</b>' : 'Scam Analysis Results:'}

${messageFormat}

${riskFormat}${scamTypeText}${indicatorsText}

${recommendationFormat}${safetyTips}${urlWarning}

🚨 ${platform === 'telegram' ? '<b>Remember:</b>' : 'Remember:'} When in doubt, don't engage!`;
  }

  /**
   * Format greeting response consistently for all platforms
   */
  formatGreetingResponse(
    platform: 'telegram' | 'whatsapp' = 'telegram',
  ): string {
    const botName =
      platform === 'telegram'
        ? 'Ndimboni Digital Scam Protection Bot'
        : 'Ndimboni Digital Scam Protection Bot Capabilities';

    return `🤖 ${platform === 'telegram' ? '<b>' + botName + '</b>' : botName}

${platform === 'telegram' ? '<b>You can:</b>' : 'You can:'}
• ${platform === 'telegram' ? '<b>/report</b>' : '/report'} [description] — Report a scammer or scam incident
• ${platform === 'telegram' ? '<b>/check</b>' : '/check'} [message] — Check if a message might be a scam
• ${platform === 'telegram' ? '<b>/start</b>' : '/start'} — View welcome message and overview

${platform === 'telegram' ? '<b>Or simply send me any message to analyze for scam indicators!</b>' : 'Just type your command or message!'}

🛡️ ${platform === 'telegram' ? "Just type your message and I'll help you stay safe online." : ''}`.trim();
  }

  /**
   * Format report success response consistently for all platforms
   */
  formatReportSuccessResponse(
    reportId: string,
    platform: 'telegram' | 'whatsapp' = 'telegram',
  ): string {
    return `✅ ${platform === 'telegram' ? '<b>Report Submitted Successfully!</b>' : 'Report Submitted Successfully!'}

${platform === 'telegram' ? '<b>Report ID:</b>' : 'Report ID:'} ${reportId}
${platform === 'telegram' ? '<b>Status:</b>' : 'Status:'} Under Review

Thank you for helping protect others from scams. Our team will review your report and take appropriate action.

🛡️ Stay vigilant and keep reporting suspicious activity!`;
  }
}
