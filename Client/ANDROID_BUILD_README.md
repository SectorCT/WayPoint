# 🤖 Android APK Local Build Guide

This guide will help you build the WayPoint Android APK locally without waiting in the EAS Build queue.

## Prerequisites

### 1. Install Java JDK

You need Java JDK 17 or 21 installed:

```bash
# Install JDK 17 (recommended)
sudo apt install openjdk-17-jdk

# Or install JDK 21
sudo apt install openjdk-21-jdk
```

### 2. Set JAVA_HOME

After installation, set the JAVA_HOME environment variable:

```bash
# For JDK 17
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64

# For JDK 21
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
```

To make this permanent, add it to your `~/.bashrc` or `~/.zshrc`:

```bash
echo 'export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64' >> ~/.bashrc
source ~/.bashrc
```

### 3. Verify Installation

```bash
java -version
echo $JAVA_HOME
```

## Building the APK

### Option 1: Using the Build Script (Recommended)

```bash
cd Client
./build-android-local.sh
```

### Option 2: Using npm Script

```bash
cd Client
npm run build:android:local
```

### Option 3: Direct Gradle Command

```bash
cd Client/android
./gradlew assembleRelease
```

## Output Location

The APK will be generated at:
```
Client/android/app/build/outputs/apk/release/app-release.apk
```

## Installing the APK

### On Android Device via ADB

```bash
adb install Client/android/app/build/outputs/apk/release/app-release.apk
```

### Manual Installation

1. Copy the APK to your Android device
2. Enable "Install from Unknown Sources" in your device settings
3. Open the APK file on your device and install it

## Configuration

### API URL Configuration

The app is configured to use localhost by default. To change the API URL:

1. Edit `Client/config/env.ts`
2. Update the `DEV_API_URL` constant:
   ```typescript
   const DEV_API_URL = "http://YOUR_IP_ADDRESS:8000";
   ```
3. Rebuild the APK

### For Physical Device Testing

If you're testing on a physical device (not emulator), you need to:

1. Find your machine's IP address:
   ```bash
   hostname -I
   # or
   ip addr show | grep "inet "
   ```

2. Update `Client/config/env.ts`:
   ```typescript
   const DEV_API_URL = "http://192.168.1.100:8000"; // Your actual IP
   ```

3. Make sure your device and computer are on the same WiFi network
4. Ensure your firewall allows connections on port 8000

## Troubleshooting

### Build Fails with "JAVA_HOME not set"

Make sure JAVA_HOME is set correctly:
```bash
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
```

### Build Fails with Gradle Errors

Try cleaning and rebuilding:
```bash
cd Client/android
./gradlew clean
./gradlew assembleRelease
```

### APK Not Found After Build

Check the build output for errors. The APK should be at:
```
Client/android/app/build/outputs/apk/release/app-release.apk
```

### Network Connection Issues

If the app can't connect to your server:
- Verify the server is running: `curl http://localhost:8000/health/`
- Check firewall settings
- For physical devices, ensure they're on the same network
- Verify the IP address in `config/env.ts`

## Build Types

- **Debug APK**: `./gradlew assembleDebug` (larger, includes debug symbols)
- **Release APK**: `./gradlew assembleRelease` (optimized, smaller size)

## Notes

- This is a **local build** - no EAS queue, builds immediately on your machine
- The APK is signed with a debug keystore (for production, you'll need a release keystore)
- Build time depends on your machine's performance (typically 2-5 minutes)

