# Expo Development Build Setup for Call/SMS Monitoring

## Prerequisites
- EAS CLI: `npm install -g eas-cli`
- Expo account (free)

## Setup Steps

### 1. Initialize EAS
```bash
eas login
eas build:configure
```

### 2. Create app.json configuration
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
        "READ_CALL_LOG"
      ]
    },
    "ios": {
      "infoPlist": {
        "NSContactsUsageDescription": "This app needs access to contacts to identify potential scam calls.",
        "NSTelephonyUsageDescription": "This app monitors calls to detect potential scam numbers."
      }
    },
    "plugins": [
      [
        "expo-build-properties",
        {
          "android": {
            "compileSdkVersion": 34,
            "targetSdkVersion": 34,
            "buildToolsVersion": "34.0.0"
          }
        }
      ]
    ]
  }
}
```

### 3. Install Compatible Native Modules
```bash
# For call detection
npm install react-native-call-detection

# For SMS monitoring  
npm install react-native-sms-android

# For permissions
npm install react-native-permissions

# For background tasks
npm install @react-native-async-storage/async-storage
```

### 4. Build Development Client
```bash
# For Android
eas build --profile development --platform android

# For iOS (requires Apple Developer account)
eas build --profile development --platform ios
```

### 5. Install the development build on your device and use:
```bash
expo start --dev-client
```

## Option 3: Alternative Native Modules (Recommended for Production)

For more reliable call and SMS monitoring, consider these alternatives:

### 1. Install Better Native Modules
```bash
# Install compatible versions
npm install react-native-call-detection@1.8.0
npm install react-native-sms-android@0.4.1
npm install react-native-permissions@4.1.5

# For background tasks
npm install @react-native-async-storage/async-storage
npm install react-native-background-job
```

### 2. Updated app.json for Expo Development Build
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
        "SYSTEM_ALERT_WINDOW",
        "WAKE_LOCK"
      ]
    },
    "ios": {
      "infoPlist": {
        "NSContactsUsageDescription": "This app needs access to contacts to identify potential scam calls.",
        "NSTelephonyUsageDescription": "This app monitors calls to detect potential scam numbers.",
        "NSUserNotificationsUsageDescription": "This app sends notifications about potential scam calls and messages."
      }
    },
    "plugins": [
      [
        "expo-build-properties",
        {
          "android": {
            "compileSdkVersion": 34,
            "targetSdkVersion": 34,
            "buildToolsVersion": "34.0.0"
          }
        }
      ],
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#ffffff"
        }
      ]
    ]
  }
}
```

### 3. Create Development Build
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Initialize build configuration
eas build:configure

# Build development client for Android
eas build --profile development --platform android

# Build for iOS (requires Apple Developer account)
eas build --profile development --platform ios
```

### 4. Install Development Client and Run
```bash
# Install the .apk/.ipa on your device
# Then run:
expo start --dev-client
```

## Option 4: React Native CLI (Full Native Control)

For maximum control and all native features:

### 1. Create New React Native Project
```bash
npx react-native init NdimboniScamGuard --template react-native-template-typescript
cd NdimboniScamGuard
```

### 2. Install Dependencies
```bash
# Navigation
npm install @react-navigation/native @react-navigation/stack
npm install react-native-screens react-native-safe-area-context
npm install react-native-gesture-handler

# Call/SMS monitoring
npm install react-native-call-detection
npm install react-native-sms-android

# Other dependencies
npm install @react-native-async-storage/async-storage
npm install react-native-permissions
npm install axios

# Link native modules (for React Native < 0.60)
npx react-native link
```

### 3. Configure Android Permissions
Edit `android/app/src/main/AndroidManifest.xml`:
```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.READ_PHONE_STATE" />
    <uses-permission android:name="android.permission.READ_CALL_LOG" />
    <uses-permission android:name="android.permission.READ_SMS" />
    <uses-permission android:name="android.permission.RECEIVE_SMS" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    
    <application
        android:name=".MainApplication"
        android:allowBackup="false"
        android:theme="@style/AppTheme">
        
        <!-- SMS Receiver -->
        <receiver android:name="com.centaurwarchief.smslistener.SmsListener">
            <intent-filter android:priority="2147483647">
                <action android:name="android.provider.Telephony.SMS_RECEIVED" />
            </intent-filter>
        </receiver>
        
        <activity android:name=".MainActivity" />
    </application>
</manifest>
```

### 4. Build and Run
```bash
# Android
npx react-native run-android

# iOS
npx react-native run-ios
```

## Current App Status

Your current app is now working in **simulation mode** with Expo managed workflow. This means:

✅ **Working Features:**
- Complete UI and navigation
- Backend API integration
- Manual scammer checking and reporting
- Detection history
- Simulated call/SMS monitoring for development

⚠️ **Limitations:**
- No real call/SMS monitoring (simulation only)
- Limited to what Expo Go supports

## Next Steps for Real Monitoring

### Option A: Quick Testing (Current Setup)
- Use simulation mode for UI/UX testing
- Test backend integration
- Develop and refine features

### Option B: Development Build (Recommended)
- Implement Expo Development Build
- Add native modules for call/SMS monitoring
- Test on real devices with actual monitoring

### Option C: Full Native (Production)
- Eject to React Native CLI
- Implement complete native functionality
- Build for app store distribution

## Testing Your Current App

Your app is now working! You can:

1. **Scan the QR code** with Expo Go
2. **Test all screens** and navigation
3. **Check backend integration** (make sure backend is running)
4. **Use simulation mode** for call/SMS testing (in debug mode)
5. **Report and check scammers** using real backend API

The `BatchedBridge.registerCallableModule` error is resolved, and you have a solid foundation for adding real monitoring capabilities later.
