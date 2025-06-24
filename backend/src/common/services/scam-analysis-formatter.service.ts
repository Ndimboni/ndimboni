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
    // Extract comprehensive scan results if available
    const scanResults = (result as any).scanResults;

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
      indicatorsText =
        platform === 'telegram'
          ? '\n\n🔍 <b>Detected Red Flags:</b>\n'
          : '\n\n🔍 Detected Red Flags:\n';

      result.reasons.forEach((indicator: string, index: number) => {
        if (index < 5) {
          indicatorsText += `${index + 1}. ${indicator}\n`;
        }
      });

      if (result.reasons.length > 5) {
        indicatorsText += `... and ${result.reasons.length - 5} more indicators\n`;
      }
    }

    // Format scam type/intent with more detail
    let scamTypeText = '';
    const detectedIntent = (result as any).detectedIntent;
    const intentAnalysis = scanResults?.intentAnalysis;

    if (
      detectedIntent &&
      detectedIntent !== 'unknown' &&
      detectedIntent !== 'legitimate'
    ) {
      const intentName = detectedIntent.replace(/_/g, ' ').toUpperCase();
      const confidence = intentAnalysis?.confidence
        ? ` (${Math.round(intentAnalysis.confidence * 100)}% confidence)`
        : '';

      scamTypeText =
        platform === 'telegram'
          ? `\n📋 <b>Scam Type:</b> ${intentName}${confidence}\n`
          : `\n📋 Scam Type: ${intentName}${confidence}\n`;
    }

    // Format extracted identifiers with details
    let identifiersText = '';
    const extractedIdentifiers = scanResults?.extractedIdentifiers;
    if (extractedIdentifiers) {
      const identifierTypes: string[] = [];

      if (extractedIdentifiers.phoneNumbers?.length > 0) {
        identifierTypes.push(
          `📞 ${extractedIdentifiers.phoneNumbers.length} phone number(s)`,
        );
      }
      if (extractedIdentifiers.emails?.length > 0) {
        identifierTypes.push(
          `📧 ${extractedIdentifiers.emails.length} email(s)`,
        );
      }
      if (extractedIdentifiers.urls?.length > 0) {
        identifierTypes.push(`🔗 ${extractedIdentifiers.urls.length} URL(s)`);
      }
      if (extractedIdentifiers.cryptoAddresses?.length > 0) {
        identifierTypes.push(
          `💰 ${extractedIdentifiers.cryptoAddresses.length} crypto address(es)`,
        );
      }
      if (extractedIdentifiers.socialMediaHandles?.length > 0) {
        identifierTypes.push(
          `📱 ${extractedIdentifiers.socialMediaHandles.length} social handle(s)`,
        );
      }

      if (identifierTypes.length > 0) {
        identifiersText =
          platform === 'telegram'
            ? `\n🔍 <b>Found:</b> ${identifierTypes.join(', ')}\n`
            : `\n🔍 Found: ${identifierTypes.join(', ')}\n`;
      }
    }

    // Format URL scan results if available
    let urlScanText = '';
    const virusTotalResults = scanResults?.virusTotalResults;
    if (virusTotalResults && virusTotalResults.totalUrls > 0) {
      const { maliciousUrls, suspiciousUrls, safeUrls, totalUrls } =
        virusTotalResults;

      if (maliciousUrls > 0 || suspiciousUrls > 0) {
        const status = maliciousUrls > 0 ? '🚨 DANGEROUS' : '⚠️ SUSPICIOUS';
        urlScanText =
          platform === 'telegram'
            ? `\n🛡️ <b>URL Security Scan:</b> ${status}\n`
            : `\n🛡️ URL Security Scan: ${status}\n`;
        urlScanText += `• ${maliciousUrls} malicious, ${suspiciousUrls} suspicious, ${safeUrls} safe (of ${totalUrls} total)\n`;
      } else if (safeUrls > 0) {
        urlScanText =
          platform === 'telegram'
            ? `\n�️ <b>URL Security Scan:</b> ✅ All ${totalUrls} URLs appear safe\n`
            : `\n🛡️ URL Security Scan: ✅ All ${totalUrls} URLs appear safe\n`;
      }
    }

    // Format database matches if any
    let databaseMatchText = '';

    const databaseMatches = scanResults?.databaseMatches;
    console.log('Database Matches:', databaseMatches);
    if (
      databaseMatches?.scammerDbMatches?.length > 0 &&
      databaseMatches?.scammerDbMatches[0] != 'All URLs appear safe'
    ) {
      databaseMatchText =
        platform === 'telegram'
          ? `\n🗃️ <b>Database Check:</b> ⚠️ Found in scammer database\n`
          : `\n🗃️ Database Check: ⚠️ Found in scammer database\n`;
    }

    // Format linguistic patterns
    let linguisticText = '';
    const linguisticPatterns = intentAnalysis?.linguisticPatterns;
    if (linguisticPatterns && linguisticPatterns.length > 0) {
      const patterns = linguisticPatterns
        .slice(0, 3)
        .map((pattern) => pattern.replace(/_/g, ' '))
        .join(', ');

      linguisticText =
        platform === 'telegram'
          ? `\n🧠 <b>Language Patterns:</b> ${patterns}\n`
          : `\n🧠 Language Patterns: ${patterns}\n`;
    }

    // Format analysis method and processing info
    let analysisMethodText = '';
    const analysisMethod = (result as any).analysisMethod;
    if (analysisMethod) {
      analysisMethodText =
        platform === 'telegram'
          ? `\n⚙️ <b>Analysis Method:</b> ${analysisMethod.toUpperCase()}\n`
          : `\n⚙️ Analysis Method: ${analysisMethod.toUpperCase()}\n`;
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

    // URL warning if suspicious links found
    let urlWarning = '';
    const extractedUrls = extractedIdentifiers?.urls;
    if (extractedUrls && extractedUrls.length > 0 && result.riskScore >= 0.3) {
      urlWarning =
        platform === 'telegram'
          ? '\n\n⚠️ <b>Links Found:</b> Be extremely careful with any links in this message!'
          : '\n\n⚠️ Links Found: Be extremely careful with any links in this message!';
    }

    // Handle message truncation consistently
    const truncatedMessage =
      message.length > 100 ? `${message.substring(0, 100)}...` : message;

    // Build comprehensive response
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

    return `🔍 ${platform === 'telegram' ? '<b>Comprehensive Scam Analysis:</b>' : 'Comprehensive Scam Analysis:'}

${messageFormat}

${riskFormat}${scamTypeText}${identifiersText}${urlScanText}${databaseMatchText}${linguisticText}${analysisMethodText}${indicatorsText}

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
