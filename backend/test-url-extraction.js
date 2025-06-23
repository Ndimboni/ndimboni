import { TelegramModerationService } from '../src/telegram-bot/telegram-moderation.service';
import { GroqService } from '../src/common/services/groq.service';
import { ConfigService } from '@nestjs/config';

// Simple test for URL extraction and moderation
const testMessage =
  'Can you take the gift and accept my invitation? Only 2 steps, take your free gifts from top-notch activity TEMU Free Gifts and help me get mine!\nhttps://temu.com/s/OK0DHUxAdgzM8aCC';

console.log('Testing URL extraction from message:');
console.log(testMessage);
console.log('\n');

// Test URL regex
const urlRegex = /(https?:\/\/[^\s]+)/gi;
const extractedUrls = testMessage.match(urlRegex) || [];
console.log('Extracted URLs:', extractedUrls);

// Test with improved regex
const improvedUrlRegex =
  /(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(?:\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})*(?:\/[^\s]*)?/gi;
const improvedUrls = testMessage.match(improvedUrlRegex) || [];
console.log(
  'Improved extraction:',
  improvedUrls.filter((url) => url.includes('.')),
);

// Test basic scam keywords detection
const scamKeywords = ['gift', 'free', 'invitation', 'urgent', 'limited time'];
const foundKeywords = scamKeywords.filter((keyword) =>
  testMessage.toLowerCase().includes(keyword.toLowerCase()),
);
console.log('Found scam keywords:', foundKeywords);
