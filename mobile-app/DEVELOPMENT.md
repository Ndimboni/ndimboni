# Development & Testing Guide

## Quick Setup for Development

### 1. Start the Backend
```bash
cd backend
pnpm install
pnpm run start:dev
```
The backend will run on `http://localhost:3000`

### 2. Configure Mobile App
Update `mobile-app/src/utils/config.ts`:
```typescript
const appConfig: AppConfig = {
  API_BASE_URL: 'http://localhost:3000', // or your IP address for device testing
  DEBUG_MODE: true, // Enable debug features
  // ... rest of config
};
```

### 3. Start Mobile App
```bash
cd mobile-app
npm install
npm start
```

## Testing Features

### 1. Manual Number Checking
- Open the app → tap "Check Number"
- Enter a phone number (e.g., `+250123456789`)
- The app will query the backend API

### 2. Reporting Scammers
- Open the app → tap "Report Scammer" 
- Fill in the form with scammer details
- Submit to create a new scammer report

### 3. Detection History
- Open the app → tap "History"
- View all past checks and reports
- Clear history if needed

### 4. Monitoring (Simulation)
- On Home screen, toggle "Enable Monitoring"
- In debug mode, use the "Simulate Detection" button
- This will create fake detection events for testing

## API Testing

### Check if Backend is Running
```bash
curl http://localhost:3000/api
```

### Test Scammer Check Endpoint
```bash
curl "http://localhost:3000/scammer-reports/check/phone/250123456789"
```

### Test Scammer Report Endpoint
```bash
curl -X POST http://localhost:3000/scammer-reports \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+250123456789",
    "description": "Test scam report"
  }'
```

## Development Tips

### 1. Enable Debug Mode
Set `DEBUG_MODE: true` in config to see:
- Console logs for all API requests
- Additional debug information
- Development tools in the app

### 2. Using Device vs Simulator
- **Simulator**: Great for UI testing and basic functionality
- **Physical Device**: Required for testing real call/SMS monitoring (when ejected)

### 3. Network Configuration
For testing on physical devices, use your computer's IP address:
```typescript
API_BASE_URL: 'http://192.168.1.100:3000' // Replace with your IP
```

### 4. Monitoring Real Calls/SMS
Note: Real call and SMS monitoring requires:
- Ejecting from Expo managed workflow, OR
- Using Expo Development Build
- Device permissions for phone and SMS access

### 5. Common Issues

#### Metro bundler cache issues:
```bash
expo start --clear
```

#### Package version conflicts:
```bash
expo install --fix
```

#### TypeScript errors:
```bash
npx tsc --noEmit
```

## Testing on Different Platforms

### iOS
```bash
expo start --ios
```

### Android  
```bash
expo start --android
```

### Web (limited functionality)
```bash
expo start --web
```

## Production Considerations

### 1. API Configuration
- Use production backend URL
- Disable debug mode
- Configure proper error handling

### 2. Permissions
- Request permissions gracefully
- Handle permission denials
- Provide clear permission explanations

### 3. Background Processing
- Implement proper background task handling
- Consider battery optimization
- Test on different Android versions

### 4. Notifications
- Test notification delivery
- Handle notification taps
- Configure notification icons and sounds

## File Structure Reference

```
mobile-app/src/
├── screens/           # UI screens
├── services/          # Business logic
│   ├── api.ts                    # Backend communication
│   ├── ScamDetectionService.ts   # Core detection logic
│   └── CallSMSMonitorService.ts  # Call/SMS monitoring
├── types/             # TypeScript definitions
└── utils/             # Configuration and utilities
```

## Useful Commands

```bash
# Development
npm start                    # Start Expo dev server
npm run android             # Run on Android
npm run ios                 # Run on iOS

# Code Quality
npx tsc --noEmit           # Type checking
npx eslint src/            # Linting (if configured)

# Debugging
expo start --tunnel        # Use tunnel for remote testing
expo start --localhost     # Force localhost
expo start --clear         # Clear cache

# Dependencies
expo install --fix         # Fix version conflicts
npm outdated               # Check for updates
```

This setup provides a complete development environment for testing the Ndimboni Scam Guard mobile app against the backend API.
