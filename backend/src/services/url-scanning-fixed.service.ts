import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface UrlScanResult {
  url: string;
  isSafe: boolean;
  scanSource: 'virustotal' | 'google_safe_browsing' | 'internal';
  threats: string[];
  details?: any;
  scanDate: Date;
}

export interface ScanSummary {
  totalUrls: number;
  safeUrls: number;
  maliciousUrls: number;
  suspiciousUrls: number;
  results: UrlScanResult[];
}

@Injectable()
export class UrlScanningService {
  private readonly logger = new Logger(UrlScanningService.name);
  private readonly virusTotalApiKey: string;
  private readonly googleSafeBrowsingApiKey: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.virusTotalApiKey = this.configService.get<string>('VIRUSTOTAL_API_KEY') || '';
    this.googleSafeBrowsingApiKey = this.configService.get<string>('GOOGLE_SAFE_BROWSING_API_KEY') || '';
  }

  async scanUrls(urls: string[]): Promise<ScanSummary> {
    const results: UrlScanResult[] = [];

    for (const url of urls) {
      try {
        let result: UrlScanResult;

        // Try VirusTotal first, then Google Safe Browsing, then internal checks
        if (this.virusTotalApiKey) {
          result = await this.scanWithVirusTotal(url);
        } else if (this.googleSafeBrowsingApiKey) {
          result = await this.scanWithGoogleSafeBrowsing(url);
        } else {
          result = await this.scanWithInternalChecks(url);
        }

        results.push(result);
      } catch (error) {
        this.logger.error(`Error scanning URL ${url}:`, error);
        results.push({
          url,
          isSafe: false,
          scanSource: 'internal',
          threats: ['scan_error'],
          scanDate: new Date(),
        });
      }
    }

    return this.compileSummary(results);
  }

  private async scanWithVirusTotal(url: string): Promise<UrlScanResult> {
    try {
      // First, submit the URL for analysis
      const submitResponse = await firstValueFrom(
        this.httpService.post(
          'https://www.virustotal.com/vtapi/v2/url/scan',
          `apikey=${this.virusTotalApiKey}&url=${encodeURIComponent(url)}`,
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        ),
      );

      // Wait a moment for analysis
      await new Promise((resolve) => setTimeout(resolve, 5000));

      // Get the report
      const reportResponse = await firstValueFrom(
        this.httpService.get(
          `https://www.virustotal.com/vtapi/v2/url/report?apikey=${this.virusTotalApiKey}&resource=${encodeURIComponent(url)}`,
        ),
      );

      const data = reportResponse.data;
      const threats: string[] = [];

      if (data.positives > 0) {
        Object.entries(data.scans || {}).forEach(([engine, result]: [string, any]) => {
          if (result.detected) {
            threats.push(`${engine}: ${result.result}`);
          }
        });
      }

      return {
        url,
        isSafe: data.positives === 0,
        scanSource: 'virustotal',
        threats,
        details: data,
        scanDate: new Date(),
      };
    } catch (error) {
      this.logger.error(`VirusTotal scan failed for ${url}:`, error);
      return this.scanWithInternalChecks(url);
    }
  }

  private async scanWithGoogleSafeBrowsing(url: string): Promise<UrlScanResult> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${this.googleSafeBrowsingApiKey}`,
          {
            client: {
              clientId: 'ndimboni-scam-protection',
              clientVersion: '1.0.0',
            },
            threatInfo: {
              threatTypes: [
                'MALWARE',
                'SOCIAL_ENGINEERING',
                'UNWANTED_SOFTWARE',
                'POTENTIALLY_HARMFUL_APPLICATION',
              ],
              platformTypes: ['ANY_PLATFORM'],
              threatEntryTypes: ['URL'],
              threatEntries: [{ url }],
            },
          },
        ),
      );

      const threats = response.data.matches || [];
      const threatTypes = threats.map((match: any) => match.threatType);

      return {
        url,
        isSafe: threats.length === 0,
        scanSource: 'google_safe_browsing',
        threats: threatTypes,
        details: response.data,
        scanDate: new Date(),
      };
    } catch (error) {
      this.logger.error(`Google Safe Browsing scan failed for ${url}:`, error);
      return this.scanWithInternalChecks(url);
    }
  }

  private async scanWithInternalChecks(url: string): Promise<UrlScanResult> {
    const threats: string[] = [];
    const urlLower = url.toLowerCase();

    // Check for suspicious patterns
    const suspiciousPatterns = [
      /bit\.ly|tinyurl|t\.co|goo\.gl|ow\.ly/i, // URL shorteners
      /[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/i, // IP addresses
      /[a-z0-9]+-[a-z0-9]+-[a-z0-9]+\.(tk|ml|ga|cf)/i, // Suspicious TLDs
      /login|bank|paypal|amazon|microsoft|google|apple/i, // Common phishing targets
      /urgent|verify|suspend|expire|click|now|limited/i, // Urgency keywords
      /[0-9]{10,}/i, // Long numbers (could be phone harvesting)
    ];

    suspiciousPatterns.forEach((pattern, index) => {
      if (pattern.test(urlLower)) {
        threats.push(`suspicious_pattern_${index}`);
      }
    });

    // Check for common scam domains
    const scamDomains = [
      'scam-example.com',
      'phishing-site.net',
      'fake-bank.org',
      // Add more known scam domains here
    ];

    try {
      const domain = new URL(url).hostname.toLowerCase();
      if (scamDomains.includes(domain)) {
        threats.push('known_scam_domain');
      }
    } catch (error) {
      threats.push('invalid_url');
    }

    return {
      url,
      isSafe: threats.length === 0,
      scanSource: 'internal',
      threats,
      scanDate: new Date(),
    };
  }

  private compileSummary(results: UrlScanResult[]): ScanSummary {
    const summary: ScanSummary = {
      totalUrls: results.length,
      safeUrls: 0,
      maliciousUrls: 0,
      suspiciousUrls: 0,
      results,
    };

    results.forEach((result) => {
      if (result.isSafe) {
        summary.safeUrls++;
      } else if (result.threats.length > 2) {
        summary.maliciousUrls++;
      } else {
        summary.suspiciousUrls++;
      }
    });

    return summary;
  }

  async scanSingleUrl(url: string): Promise<UrlScanResult> {
    const summary = await this.scanUrls([url]);
    return summary.results[0];
  }
}
