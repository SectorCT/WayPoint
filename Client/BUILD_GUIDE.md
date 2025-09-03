# 🍎 WayPoint iOS Build Guide

## Overview
This guide will help you build and test the WayPoint app on your iOS device without using Expo Go.

## Prerequisites

### Option 1: Local Mac Development (Recommended)
- **Mac with macOS** (required for iOS development)
- **Xcode** (latest version from App Store)
- **Node.js** (v18 or later)
- **Expo CLI**: `npm install -g @expo/cli`
- **EAS CLI**: `npm install -g eas-cli`

### Option 2: Cloud Build (Easiest)
- **Expo Account**: Sign up at https://expo.dev
- **EAS CLI**: `npm install -g eas-cli`

## Step 1: Server Setup (Docker)

### 1.1 Start Your Backend Server
```bash
cd server
docker-compose up -d
```

### 1.2 Port Forwarding Setup
Since your server runs on Docker, you need to make it accessible to your iOS device:

**For Local Network Testing:**
1. Find your PC's IP address:
   ```bash
   # Windows
   ipconfig
   
   # Look for "IPv4 Address" (usually 192.168.x.x)
   ```

2. Update `Client/config/env.ts` with your PC's IP:
   ```typescript
   const DEV_API_URL = "http://192.168.1.100:8000"; // Replace with your actual IP
   ```

3. Ensure your firewall allows connections on port 8000

**For Internet Testing:**
1. Use a service like ngrok:
   ```bash
   npm install -g ngrok
   ngrok http 8000
   ```

2. Update the API URL with the ngrok URL:
   ```typescript
   const DEV_API_URL = "https://your-ngrok-url.ngrok.io";
   ```

## Step 2: Build Configuration

### 2.1 Update Bundle Identifier
In `Client/app.json`, update the bundle identifier:
```json
"ios": {
  "bundleIdentifier": "com.yourcompany.waypoint"
}
```

### 2.2 Configure API Keys
1. **Google Maps API Key** (for maps functionality):
   - Get from Google Cloud Console
   - Update in `Client/app.json`:
   ```json
   "ios": {
     "config": {
       "googleMapsApiKey": "YOUR_ACTUAL_IOS_API_KEY"
     }
   }
   ```

## Step 3: Build Options

### Option A: EAS Build (Recommended for Testing)

#### 3.1 Install EAS CLI
```bash
npm install -g eas-cli
```

#### 3.2 Login to Expo
```bash
eas login
```

#### 3.3 Configure Project
```bash
cd Client
eas build:configure
```

#### 3.4 Build for iOS
```bash
# Development build (for testing)
eas build --platform ios --profile development

# Preview build (for internal testing)
eas build --platform ios --profile preview

# Production build
eas build --platform ios --profile production
```

#### 3.5 Install on Device
1. Download the `.ipa` file from EAS
2. Install using:
   - **TestFlight** (for App Store distribution)
   - **Xcode** (drag .ipa to device)
   - **iTunes** (legacy method)

### Option B: Local Build (Mac Required)

#### 3.1 Install Dependencies
```bash
cd Client
npm install
npx expo install
```

#### 3.2 Generate iOS Project
```bash
npx expo prebuild --platform ios
```

#### 3.3 Open in Xcode
```bash
open ios/WayPoint.xcworkspace
```

#### 3.4 Build and Run
1. Connect your iOS device
2. Select your device in Xcode
3. Click "Build and Run" (⌘+R)

## Step 4: Testing Setup

### 4.1 Device Configuration
1. **Enable Developer Mode** on your iOS device:
   - Settings → Privacy & Security → Developer Mode
   - Restart device when prompted

2. **Trust Developer Certificate**:
   - Settings → General → VPN & Device Management
   - Trust your developer certificate

### 4.2 Network Testing
1. **Local Network**: Ensure device and PC are on same WiFi
2. **Internet**: Use ngrok or deploy server to cloud
3. **Test API Connection**: Check if app can reach your backend

## Step 5: Troubleshooting

### Common Issues

#### Build Fails
```bash
# Clean and rebuild
cd Client
rm -rf node_modules
npm install
npx expo install --fix
```

#### Network Issues
- Check firewall settings
- Verify IP address is correct
- Test with `curl http://your-ip:8000/health/`

#### Certificate Issues
- Update provisioning profiles in Xcode
- Check bundle identifier matches
- Verify Apple Developer account

### Debug Commands
```bash
# Check Expo configuration
npx expo doctor

# Verify dependencies
npx expo install --check

# Test API connection
curl http://your-server-ip:8000/health/
```

## Step 6: Production Deployment

### 6.1 App Store Preparation
1. Create App Store Connect account
2. Create app record
3. Generate production certificates
4. Submit for review

### 6.2 Server Deployment
1. Deploy Django backend to cloud (AWS, Google Cloud, etc.)
2. Update production API URL in app
3. Configure SSL certificates
4. Set up monitoring and logging

## Environment Variables

### Development
```bash
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.100:8000
```

### Production
```bash
EXPO_PUBLIC_API_BASE_URL=https://your-production-domain.com
```

## Security Considerations

1. **API Keys**: Never commit API keys to version control
2. **HTTPS**: Use HTTPS in production
3. **Certificate Pinning**: Consider implementing for production
4. **Environment Variables**: Use proper environment management

## Support

For issues:
1. Check Expo documentation: https://docs.expo.dev
2. Check React Native documentation: https://reactnative.dev
3. Check EAS documentation: https://docs.expo.dev/eas/
