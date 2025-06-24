# Troubleshooting Guide - Ndimboni Scam Guard Mobile App

## Common Issues and Solutions

### 1. "BatchedBridge.registerCallableModule is not a function"

This error typically occurs when there are Metro bundler cache issues or package version conflicts.

**Solutions:**

1. **Clear Metro Cache:**

   ```bash
   npx expo start --clear
   ```

2. **Fix Package Versions:**

   ```bash
   npx expo install --fix
   ```

3. **Full Cache Clear:**

   ```bash
   rm -rf node_modules/.cache
   rm -rf .expo
   npx expo start --clear
   ```

4. **Reinstall Dependencies:**
   ```bash
   rm -rf node_modules
   rm package-lock.json
   npm install
   ```

### 2. Module Resolution Errors

**Error:** `Module not found` or import errors

**Solutions:**

1. **Check TypeScript Configuration:**

   ```bash
   npx tsc --noEmit
   ```

2. **Restart Metro Bundler:**

   ```bash
   npx expo start --clear
   ```

3. **Verify Import Paths:**
   - Check relative import paths are correct
   - Ensure all exported modules are properly exported

### 3. Package Version Conflicts

**Error:** Package compatibility warnings

**Solution:**

```bash
npx expo install --fix
```

This automatically installs the correct versions for your Expo SDK.

### 4. Simulator/Device Connection Issues

**iOS Simulator:**

```bash
npx expo start --ios
```

**Android Emulator:**

```bash
npx expo start --android
```

**Physical Device Issues:**

- Ensure device and computer are on same WiFi network
- Use `npx expo start --tunnel` for remote testing
- Check firewall settings

### 5. Native Module Issues

**Error:** Native module related errors (call detection, SMS, etc.)

**Note:** Some modules require ejecting from Expo managed workflow:

1. **For Development:**

   - Use simulation mode in debug builds
   - Test core functionality without native modules

2. **For Production:**
   - Consider Expo Development Build
   - Or eject to bare React Native

### 6. API Connection Issues

**Error:** Network or API connection failures

**Check:**

1. **Backend Status:**

   ```bash
   curl http://localhost:3000/api
   ```

2. **Configuration:**

   - Verify `API_BASE_URL` in `src/utils/config.ts`
   - Use IP address instead of localhost for device testing

3. **Network:**
   - Check device WiFi connection
   - Verify firewall settings

### 7. Permission Issues

**Error:** Notification or device permission denied

**Solutions:**

1. **Check App Settings:**

   - Manually enable permissions in device settings
   - Restart app after granting permissions

2. **Test Permission Flow:**
   - Uninstall and reinstall app
   - Test permission request flow

### 8. Build/Bundle Issues

**Error:** Build failures or bundle corruption

**Solutions:**

1. **Clean Build:**

   ```bash
   npx expo start --clear
   rm -rf .expo
   ```

2. **Reset Everything:**
   ```bash
   rm -rf node_modules
   rm -rf .expo
   rm package-lock.json
   npm install
   npx expo start --clear
   ```

### 9. TypeScript Errors

**Error:** Type checking failures

**Solutions:**

1. **Check Types:**

   ```bash
   npx tsc --noEmit
   ```

2. **Update TypeScript:**

   ```bash
   npm install typescript@latest
   ```

3. **Check tsconfig.json:**
   - Ensure JSX settings are correct
   - Verify module resolution settings

### 10. Performance Issues

**Symptoms:** Slow loading, crashes, memory issues

**Solutions:**

1. **Enable Flipper (if ejected):**

   - Use React Native debugger
   - Monitor performance metrics

2. **Optimize Bundle:**

   - Check bundle size
   - Remove unused dependencies

3. **Memory Management:**
   - Clear detection history periodically
   - Optimize image and asset usage

## Debugging Commands

### Development

```bash
# Start with clear cache
npx expo start --clear

# Start with tunnel (for remote testing)
npx expo start --tunnel

# Start specific platform
npx expo start --ios
npx expo start --android
```

### Package Management

```bash
# Fix version conflicts
npx expo install --fix

# Check for updates
npm outdated

# Update Expo CLI
npm install -g @expo/cli@latest
```

### Troubleshooting

```bash
# Type checking
npx tsc --noEmit

# Check Expo setup
npx expo doctor

# Reset project
rm -rf node_modules .expo
npm install
npx expo start --clear
```

## Environment-Specific Issues

### macOS

- Ensure Xcode is installed for iOS development
- Install Android Studio for Android development
- Check firewall settings for local development

### Windows

- Use WSL2 for better performance
- Ensure Android SDK is properly configured
- Use PowerShell or Command Prompt

### Linux

- Install Android SDK manually
- Configure ANDROID_HOME environment variable
- Ensure proper permissions for device access

## Getting Help

### Check Logs

1. **Metro Bundler Logs:** Check terminal output when running `expo start`
2. **Device Logs:** Use device console for runtime errors
3. **Network Logs:** Monitor API requests in debug mode

### Debug Mode Features

Enable debug mode in `src/utils/config.ts`:

```typescript
DEBUG_MODE: true;
```

This enables:

- Console logging for API requests
- Additional error information
- Development tools in the app

### Community Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Troubleshooting](https://reactnative.dev/docs/troubleshooting)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/expo)

## When to Seek Additional Help

1. **Persistent Native Module Issues:** Consider ejecting or using Expo Development Build
2. **Platform-Specific Problems:** May require native iOS/Android development
3. **Performance Issues:** May need optimization or architecture changes
4. **Production Deployment:** Consider professional React Native development support

Remember: Many issues can be resolved by clearing caches and reinstalling dependencies. Always try the simple solutions first!
