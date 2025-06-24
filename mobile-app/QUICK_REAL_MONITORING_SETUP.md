# Quick Setup: Real Call/SMS Monitoring with Expo Development Build

## Why Use Expo Development Build?

- ✅ Keep most Expo conveniences
- ✅ Add custom native modules
- ✅ Real call and SMS monitoring
- ✅ Background processing
- ✅ Push notifications
- ✅ Easier than full React Native CLI

## Step-by-Step Implementation

### 1. Install EAS CLI
```bash
npm install -g eas-cli
```

### 2. Login and Configure
```bash
cd mobile-app
eas login
eas build:configure
```

### 3. Add Native Dependencies
```bash
# Call and SMS monitoring
npm install react-native-call-detection@1.8.0
npm install react-native-sms-android@0.4.1

# Permissions
npm install react-native-permissions@4.1.5

# Background tasks
npm install @react-native-community/background-timer
```

### 4. Update app.json
```json
{
  "expo": {
    "name": "Ndimboni Scam Guard",
    "slug": "ndimboni-scam-guard",
    "version": "1.0.0",
    "platforms": ["ios", "android"],
    "android": {
      "permissions": [
        "READ_PHONE_STATE",
        "READ_SMS",
        "RECEIVE_SMS", 
        "READ_CALL_LOG",
        "WAKE_LOCK",
        "SYSTEM_ALERT_WINDOW"
      ],
      "package": "com.ndimboni.scamguard"
    },
    "ios": {
      "bundleIdentifier": "com.ndimboni.scamguard",
      "infoPlist": {
        "NSContactsUsageDescription": "Identify potential scam callers",
        "NSTelephonyUsageDescription": "Monitor calls for scam detection"
      }
    },
    "plugins": [
      [
        "expo-build-properties",
        {
          "android": {
            "compileSdkVersion": 34,
            "targetSdkVersion": 34
          }
        }
      ]
    ]
  }
}
```

### 5. Update CallSMSMonitorService.ts

Replace the dynamic imports with direct imports (this will work with dev build):

```typescript
// At the top of the file
import CallDetection from 'react-native-call-detection';
import SmsAndroid from 'react-native-sms-android';

// Update the startAndroidMonitoring method
private async startAndroidMonitoring(): Promise<void> {
  try {
    // Initialize call detection
    this.callDetector = new CallDetection(true);
    this.callDetector.startListening((phoneNumber: string, state: string) => {
      this.handleCallEvent({
        phoneNumber,
        callState: state as 'incoming' | 'answered' | 'ended',
        timestamp: Date.now(),
      });
    });

    // Initialize SMS monitoring
    const smsListener = DeviceEventEmitter.addListener('onSMSReceived', (message: any) => {
      this.handleSMSEvent({
        phoneNumber: message.originatingAddress,
        message: message.body,
        timestamp: Date.now(),
      });
    });
    this.smsListeners.push(smsListener);

    console.log('Android monitoring started with native modules');
  } catch (error) {
    console.error('Error starting Android monitoring:', error);
    throw error;
  }
}
```

### 6. Build Development Client
```bash
# For Android (easier to test)
eas build --profile development --platform android

# This will take 10-15 minutes
# You'll get a download link when complete
```

### 7. Install and Test
```bash
# Download and install the .apk on your Android device
# Then run:
expo start --dev-client

# Your app will now have real call/SMS monitoring!
```

## Real Monitoring Features You'll Get

### Call Monitoring
- Detect incoming calls in real-time
- Check caller against scammer database
- Show instant notifications for known scammers
- Log all call events to history

### SMS Monitoring  
- Monitor incoming SMS messages
- Scan message content for scam patterns
- Check sender against scammer database
- Alert users to suspicious messages

### Background Processing
- Continue monitoring when app is backgrounded
- Persistent notifications for scam alerts
- Automatic scammer database updates

## Permission Handling

The app will request these permissions on first run:
- **Phone**: For call monitoring
- **SMS**: For message monitoring  
- **Notifications**: For scam alerts
- **Background**: For continuous monitoring

## Testing Real Monitoring

1. **Install development build** on Android device
2. **Grant all permissions** when prompted
3. **Enable monitoring** in the app
4. **Have someone call you** to test call detection
5. **Send yourself SMS** to test message monitoring
6. **Check detection history** to see logged events

## Production Deployment

Once tested, build production versions:

```bash
# Production Android
eas build --platform android

# Production iOS (requires Apple Developer account)
eas build --platform ios
```

## Cost and Requirements

- **EAS Build**: Free tier includes 30 builds/month
- **Android Device**: For testing (iOS requires Apple Developer account)
- **Time**: ~30 minutes setup + 15 minutes build time

This approach gives you **real call and SMS monitoring** while keeping most of the Expo development experience!
