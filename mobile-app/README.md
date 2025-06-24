# Ndimboni Scam Guard - Mobile App

A React Native mobile application that protects users from scam calls and SMS by integrating with the Ndimboni Digital Scam Protection backend.

## Features

- **Real-time Scam Detection**: Monitor incoming calls and SMS messages for known scammers
- **Background Protection**: Continuous monitoring even when the app is in the background
- **Smart Notifications**: Instant alerts when potential scammers are detected
- **Manual Checking**: Look up specific phone numbers against the scam database
- **Easy Reporting**: Report new scam numbers directly from the app
- **Detection History**: View all past detections and manual checks
- **Offline Support**: Basic functionality works without internet connection

## Screenshots

[Screenshots would go here in a real project]

## Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: React Navigation 7
- **State Management**: React Hooks + AsyncStorage
- **Notifications**: Expo Notifications
- **HTTP Client**: Axios
- **Backend Integration**: Ndimboni API

## Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS development) or Android Studio (for Android development)
- Physical device with Expo Go app for testing

## Installation

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd Ndimboni-Digital-Scam-Protection/mobile-app
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Configure backend URL**:
   Edit `src/utils/config.ts` and update the `API_BASE_URL` to point to your Ndimboni backend:

   ```typescript
   const appConfig: AppConfig = {
     API_BASE_URL: "http://your-backend-url:3000", // Update this
     // ... other config
   };
   ```

4. **Start the development server**:

   ```bash
   npm start
   ```

5. **Run on device/simulator**:
   - Scan the QR code with Expo Go app (Android/iOS)
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Press `w` for web browser

## Project Structure

```
mobile-app/
├── src/
│   ├── screens/           # Screen components
│   │   ├── HomeScreen.tsx     # Main dashboard
│   │   ├── ReportScreen.tsx   # Report scammer form
│   │   ├── CheckScreen.tsx    # Manual number checking
│   │   └── HistoryScreen.tsx  # Detection history
│   ├── services/          # Business logic services
│   │   ├── api.ts                    # Backend API integration
│   │   ├── ScamDetectionService.ts   # Detection logic & notifications
│   │   └── CallSMSMonitorService.ts  # Call/SMS monitoring
│   ├── types/             # TypeScript type definitions
│   │   └── index.ts
│   └── utils/             # Utility functions
│       └── config.ts
├── App.tsx               # Main app component with navigation
├── package.json
└── README.md
```

## Configuration

### Backend Integration

The app connects to the Ndimboni backend API. Configure the connection in `src/utils/config.ts`:

```typescript
const appConfig: AppConfig = {
  API_BASE_URL: "http://localhost:3000", // Your backend URL
  API_TIMEOUT: 10000, // Request timeout
  CACHE_DURATION: 300000, // 5 minutes cache
  DEBUG_MODE: __DEV__, // Enable debug logging

  FEATURES: {
    CALL_MONITORING: true, // Enable call monitoring
    SMS_MONITORING: true, // Enable SMS monitoring
    BACKGROUND_DETECTION: true, // Background processing
    MANUAL_REPORTING: true, // Manual scammer reporting
    DETECTION_HISTORY: true, // Store detection history
  },

  PHONE_CONFIG: {
    DEFAULT_COUNTRY_CODE: "+250", // Rwanda country code
    RWANDA_PREFIX: "25", // Rwanda prefix for normalization
    MIN_LENGTH: 9, // Minimum phone number length
    MAX_LENGTH: 13, // Maximum phone number length
  },
};
```

### Notifications

The app uses Expo Notifications for scam alerts. Permissions are requested automatically on first launch.

## Usage

### Home Screen

- **Monitoring Toggle**: Enable/disable call and SMS monitoring
- **Quick Stats**: View detection statistics
- **Quick Actions**: Navigate to check, report, or history screens
- **Dev Tools**: Debug features for development (only in debug mode)

### Report Screen

- **Phone Number**: Enter the scammer's phone number
- **Description**: Describe the scam attempt
- **Additional Info**: Optional extra details
- **Submit**: Send report to backend for verification

### Check Screen

- **Manual Lookup**: Enter any phone number to check against scammer database
- **Results**: View detailed information if number is found in database
- **Quick Report**: Navigate to report screen for unknown numbers

### History Screen

- **Detection Log**: View all past detections and manual checks
- **Filtering**: Browse by detection type (call, SMS, manual)
- **Statistics**: View summary statistics
- **Clear History**: Remove all stored detection history

## API Integration

The app integrates with these Ndimboni backend endpoints:

### Check Scammer

```
GET /scammer-reports/check/{type}/{identifier}
```

- Checks if a phone number is in the scammer database
- Returns scammer details if found

### Report Scammer

```
POST /scammer-reports
```

- Reports a new scammer to the database
- Requires phone number and description

### Response Format

```typescript
interface CheckScammerResponse {
  success: boolean;
  isScammer: boolean;
  data?: ScammerData;
  message: string;
}

interface ReportScammerResponse {
  success: boolean;
  data: ScammerData;
  message: string;
}
```

## Call & SMS Monitoring

### Android

- Uses `react-native-call-detection` for call monitoring
- Uses `react-native-sms-android` for SMS monitoring
- Requires device permissions for phone and SMS access

### iOS

- Limited call monitoring due to iOS restrictions
- SMS monitoring requires special entitlements
- Background processing has limitations

### Permissions Required

- **Notifications**: For scam alerts
- **Phone** (Android): To monitor incoming calls
- **SMS** (Android): To monitor incoming messages
- **Background App Refresh**: For continuous monitoring

## Development

### Adding New Features

1. **Create new screen**: Add to `src/screens/`
2. **Add navigation**: Update `App.tsx` and types in `src/types/index.ts`
3. **Add API integration**: Extend `src/services/api.ts`
4. **Update types**: Add TypeScript definitions to `src/types/index.ts`

### Testing

```bash
# Run type checking
npx tsc --noEmit

# Test on different platforms
expo start --ios
expo start --android
expo start --web
```

### Building for Production

For production builds, you'll need to eject from Expo managed workflow or use Expo Application Services (EAS):

```bash
# Using EAS Build
npm install -g eas-cli
eas build --platform android
eas build --platform ios
```

## Limitations & Notes

### Expo Managed Workflow Limitations

Some features require ejecting from Expo managed workflow:

- **Real-time call detection**: Requires native modules
- **SMS reading**: Needs device permissions and native access
- **Background processing**: Limited by platform restrictions

### Platform Limitations

#### Android

- Full call and SMS monitoring supported
- Background detection possible
- Requires runtime permissions

#### iOS

- Limited call detection capabilities
- SMS monitoring requires special entitlements
- Strict background processing limitations

### Recommended Deployment

For full functionality, consider:

1. **Expo Development Build**: Allows custom native modules
2. **Full React Native**: Complete control over native features
3. **Platform-specific apps**: Separate iOS/Android implementations

## Troubleshooting

### Common Issues

1. **"Module not found" errors**:

   ```bash
   npm install
   expo install --fix
   ```

2. **Metro bundler issues**:

   ```bash
   expo start --clear
   ```

3. **Type errors**:

   ```bash
   npx tsc --noEmit
   ```

4. **Notification permissions denied**:

   - Check device settings
   - Restart app after granting permissions

5. **API connection issues**:
   - Verify backend URL in config
   - Check network connectivity
   - Ensure backend is running

### Debug Mode

Enable debug logging by setting `DEBUG_MODE: true` in config:

- Console logs for API requests
- Detection event logging
- Service status information
- Development tools in Home screen

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on both platforms
5. Submit a pull request

## License

This project is part of the Ndimboni Digital Scam Protection platform, developed as a final year project at the University of Rwanda.

## Contact

For questions or support regarding the mobile app, please contact the development team.

---

**Note**: This mobile app is designed to work with the Ndimboni backend API. Ensure the backend is properly configured and running before using the mobile app.
