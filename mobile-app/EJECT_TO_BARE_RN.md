# Ejecting to Bare React Native for Full Call/SMS Monitoring

## ⚠️ Warning
Ejecting is irreversible and removes many Expo conveniences. Consider Expo Development Build first.

## Ejection Process

### 1. Eject from Expo
```bash
expo eject
```

### 2. Install Native Dependencies
```bash
# React Native CLI
npm install -g @react-native-community/cli

# Call detection
npm install react-native-call-detection
cd ios && pod install && cd .. # iOS only

# SMS monitoring
npm install react-native-sms-android

# Permissions
npm install react-native-permissions
cd ios && pod install && cd .. # iOS only

# Background tasks
npm install @react-native-community/background-timer
```

### 3. Configure Android Permissions
Edit `android/app/src/main/AndroidManifest.xml`:
```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <!-- Call monitoring permissions -->
    <uses-permission android:name="android.permission.READ_PHONE_STATE" />
    <uses-permission android:name="android.permission.READ_CALL_LOG" />
    
    <!-- SMS monitoring permissions -->
    <uses-permission android:name="android.permission.READ_SMS" />
    <uses-permission android:name="android.permission.RECEIVE_SMS" />
    
    <!-- Background processing -->
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    
    <application>
        <!-- Your app configuration -->
    </application>
</manifest>
```

### 4. Configure iOS Permissions
Edit `ios/YourApp/Info.plist`:
```xml
<key>NSContactsUsageDescription</key>
<string>This app needs access to contacts to identify potential scam calls.</string>
<key>NSTelephonyUsageDescription</key>
<string>This app monitors calls to detect potential scam numbers.</string>
```

### 5. Build and Run
```bash
# Android
npx react-native run-android

# iOS
npx react-native run-ios
```
