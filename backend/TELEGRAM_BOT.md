# Telegram Bot Integration for Ndimboni Digital Scam Protection

This document describes how to set up and use the Telegram bot integration for the Ndimboni Digital Scam Protection system.

## Features

### 🤖 Bot Capabilities
- **Message Analysis**: Analyze messages for scam content with confidence scores
- **Auto-Moderation**: Automatically remove malicious links and suspicious messages in groups
- **Scam Reporting**: Allow users to report scams directly through Telegram
- **Interactive Chat**: Respond to direct messages with scam analysis
- **Admin Notifications**: Alert administrators about detected threats
- **Group Protection**: Monitor group messages and protect members

### 🛡️ Detection Capabilities
- **Malicious URLs**: Detect and remove dangerous links
- **Scam Keywords**: Identify common scam language patterns
- **Urgency Tactics**: Recognize pressure tactics used by scammers
- **Impersonation**: Detect attempts to impersonate legitimate organizations
- **Financial Fraud**: Identify money-related scam attempts
- **Phone/SMS Scams**: Recognize phone number harvesting attempts

## Setup Instructions

### 1. Create a Telegram Bot

1. **Contact @BotFather on Telegram**
   ```
   /newbot
   ```

2. **Choose a name and username for your bot**
   - Name: "Ndimboni Scam Protection Bot"
   - Username: "ndimboni_scam_protection_bot" (must end with "bot")

3. **Get your bot token**
   - Save the token provided by BotFather
   - Keep this token secure!

### 2. Configure Environment Variables

Add the following to your `.env` file:

```bash
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your-bot-token-from-@BotFather
TELEGRAM_WEBHOOK_URL=https://your-domain.com/api/telegram/webhook
TELEGRAM_ADMIN_CHAT_IDS=123456789,987654321
TELEGRAM_ALLOWED_GROUPS=
TELEGRAM_MODERATION_ENABLED=true
TELEGRAM_AUTO_DELETE_DELAY=5
```

### 3. Get Your Chat ID (for admin notifications)

1. **Start a chat with your bot**
2. **Send any message to the bot**
3. **Visit**: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
4. **Find your chat ID in the response**
5. **Add it to `TELEGRAM_ADMIN_CHAT_IDS`**

### 4. Optional: Setup Webhook (for production)

If deploying to production, you can use webhooks instead of polling:

1. **Set your webhook URL in the environment**
2. **Use the API endpoint to setup the webhook**:
   ```bash
   POST /api/telegram/setup-webhook
   ```

## Bot Commands

### Public Commands (Available to all users)

#### `/start`
- Shows welcome message and bot capabilities
- Explains how to use the bot

#### `/help`
- Displays detailed help information
- Lists all available commands
- Shows usage examples

#### `/check <message>`
- Analyzes a specific message for scam content
- Returns risk level and confidence score
- Provides detailed explanation of findings

**Example:**
```
/check Hey, I got this message about winning money, should I trust it?
```

#### `/report <description>`
- Report a new scam to the system
- Creates a scam report in the database
- Notifies administrators

**Example:**
```
/report Received fake bank SMS asking for my PIN number
```

### Admin Commands (Restricted to configured admin users)

#### `/stats`
- Shows comprehensive scam statistics
- Displays reports by type, status, and time period
- Only available to users in `TELEGRAM_ADMIN_CHAT_IDS`

## Group Features

### Auto-Moderation
When added to a group, the bot will:

1. **Monitor all messages** for suspicious content
2. **Automatically delete** high-risk messages
3. **Send warnings** about removed content
4. **Notify admins** about moderation actions
5. **Auto-delete warnings** after a configurable delay

### Group Configuration
- Add the bot to your group
- Give it admin permissions to delete messages
- Configure allowed groups in `TELEGRAM_ALLOWED_GROUPS` (optional)
- Enable/disable moderation with `TELEGRAM_MODERATION_ENABLED`

## API Endpoints

### Public Endpoints

#### `POST /api/telegram/webhook`
- Handles incoming webhook updates from Telegram
- Processes bot commands and messages
- No authentication required (Telegram handles security)

#### `GET /api/telegram/health`
- Returns bot health status
- Useful for monitoring

### Protected Endpoints (Require Authentication)

#### `POST /api/telegram/setup-webhook`
- Sets up webhook for the bot
- Requires admin permissions
- Returns success/error status

#### `POST /api/telegram/remove-webhook`
- Removes the webhook configuration
- Requires admin permissions
- Useful for switching back to polling

#### `POST /api/telegram/analyze-message`
- Analyzes a message using the moderation service
- Returns detailed analysis results
- Requires appropriate permissions

**Request Body:**
```json
{
  "message": "Your message to analyze"
}
```

**Response:**
```json
{
  "analysis": {
    "isScam": true,
    "riskLevel": "high",
    "confidence": 0.85,
    "reasons": ["Contains scam-related keywords", "Uses urgent language"],
    "detectedPatterns": ["urgent payment", "suspended account"]
  },
  "timestamp": "2025-06-16T10:30:00Z"
}
```

#### `GET /api/telegram/bot-info`
- Returns bot information and status
- Shows webhook configuration
- Requires admin permissions

## Security Features

### Message Analysis
The bot uses sophisticated pattern matching to detect:

- **Scam Keywords**: Database of known scam phrases
- **URL Analysis**: Checks for malicious domains and suspicious patterns
- **Grammar Patterns**: Identifies poor grammar common in scams
- **Urgency Indicators**: Detects pressure tactics
- **Impersonation**: Recognizes fake authority claims
- **Financial Patterns**: Identifies money-related scam attempts

### Privacy Protection
- Bot only processes messages when explicitly mentioned or in configured groups
- No personal data is stored beyond what's necessary for scam detection
- Admin notifications include minimal user information
- All data handling complies with privacy best practices

## Usage Examples

### Personal Protection
```
User: /check "Congratulations! You've won $1,000,000! Click here to claim now!"

Bot: 🔍 **Message Analysis Results:**

⚠️ **POTENTIAL SCAM DETECTED**

**Risk Level:** HIGH
**Confidence:** 92%

**Red Flags Detected:**
• Contains scam-related keywords: congratulations winner, claim prize
• Uses urgent language to pressure action
• Mentions large amounts of money: $1,000,000

🛡️ **Recommendation:** Be extremely cautious with this message.
```

### Group Protection
When a user posts a malicious link in a monitored group:

1. **Message is automatically deleted**
2. **Warning is posted**: "⚠️ Message Removed - A potentially malicious message was automatically removed. Reason: Contains suspicious links"
3. **Admin notification**: "🚨 Auto-Moderation Alert - Group: Tech Support Chat - User: John (@john_doe) - Reason: Contains suspicious links"
4. **Warning auto-deletes** after configured delay

### Scam Reporting
```
User: /report Got a call claiming to be from my bank asking for my card details

Bot: ✅ **Scam report submitted successfully!**

Thank you for helping to protect the community. Your report will be reviewed by our team.
```

## Troubleshooting

### Common Issues

#### Bot Not Responding
1. Check if `TELEGRAM_BOT_TOKEN` is correct
2. Verify bot is started (check application logs)
3. Ensure bot hasn't been stopped by BotFather

#### Webhook Issues
1. Verify `TELEGRAM_WEBHOOK_URL` is accessible from internet
2. Check SSL certificate is valid
3. Use `/remove-webhook` and `/setup-webhook` to reset

#### Permission Errors
1. Ensure bot has admin rights in groups for message deletion
2. Check `TELEGRAM_ADMIN_CHAT_IDS` configuration
3. Verify user permissions in policy system

#### Auto-Moderation Not Working
1. Check `TELEGRAM_MODERATION_ENABLED` is set to `true`
2. Verify group is in `TELEGRAM_ALLOWED_GROUPS` (if configured)
3. Ensure bot has message deletion permissions

### Logs and Monitoring
- Bot activities are logged with `TelegramBotService` logger
- Monitor application logs for errors
- Use `/api/telegram/health` endpoint for health checks
- Check `/api/telegram/bot-info` for configuration status

## Advanced Configuration

### Custom Scam Patterns
Modify `TelegramModerationService` to add custom detection patterns:
- Add new keywords to `scamKeywords` array
- Create new regex patterns for specific threats
- Adjust confidence scoring algorithms

### Multi-Language Support
Extend the bot to support multiple languages:
- Add language-specific scam keywords
- Implement message translation for analysis
- Provide localized responses

### Integration with External Services
Connect the bot with external threat intelligence:
- URL reputation services
- Phone number databases
- Email reputation services

## Contributing

To contribute to the Telegram bot functionality:
1. Follow the existing code patterns
2. Add comprehensive tests for new features
3. Update documentation
4. Consider security implications
5. Test thoroughly with real Telegram groups

## Support

For issues with the Telegram bot:
1. Check the troubleshooting section
2. Review application logs
3. Verify configuration
4. Contact the development team
