# Google Maps Setup Verification Guide

## ✅ Current Status
- API Key is correctly configured in `gradle.properties`: `AIzaSyCXN7BPdndiF1rirGQ67o5g36tvogji2yk`
- API Key is correctly injected into AndroidManifest.xml
- The key appears in the built APK's manifest

## 🔍 Troubleshooting Steps

### 1. Verify Maps SDK for Android is Enabled

Go to [Google Cloud Console - APIs & Services](https://console.cloud.google.com/apis/library) and ensure:

1. **Maps SDK for Android** is enabled
   - Search for "Maps SDK for Android"
   - Click on it and ensure it shows "API enabled"
   - If not enabled, click "Enable"

2. **Maps SDK for iOS** (if needed for future iOS builds)
   - Search for "Maps SDK for iOS"
   - Enable if needed

### 2. Check API Key Restrictions

Your API key is currently **unrestricted**. For production, you should restrict it:

1. Go to [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials)
2. Click on your API key: "Maps Platform API Key"
3. Under **Application restrictions**, select **Android apps**
4. Click **Add an item** and add:
   - **Package name**: `com.waypoint.app`
   - **SHA-1 certificate fingerprint**: (see step 3 below)

### 3. Get SHA-1 Fingerprint for Release Build

Run this command to get your release keystore's SHA-1:

```bash
cd /home/zayko/Documents/WayPoint/Client/android/app
keytool -list -v -keystore debug.keystore -alias androiddebugkey -storepass android -keypass android | grep SHA1
```

**Note**: You're currently using the debug keystore for release builds. For production, you should:
1. Create a production keystore
2. Get its SHA-1 fingerprint
3. Add it to Google Cloud Console

### 4. Verify Billing is Enabled

Google Maps requires billing to be enabled (even for free tier):

1. Go to [Google Cloud Console - Billing](https://console.cloud.google.com/billing)
2. Ensure billing is enabled for your project
3. Check that you have a valid payment method (free tier is available)

### 5. Check API Quotas

1. Go to [Google Cloud Console - APIs & Services - Dashboard](https://console.cloud.google.com/apis/dashboard)
2. Check if there are any quota limits or errors
3. Verify the Maps SDK for Android shows usage (if you've tested the app)

### 6. Test with Logcat

Run the app and check Android Logcat for Google Maps errors:

```bash
adb logcat | grep -i "maps\|google\|api"
```

Look for errors like:
- "API key not valid"
- "Maps SDK not enabled"
- "Authentication failed"

### 7. Verify the API Key in the Running App

You can verify the API key is being read by the app by checking the merged manifest:

```bash
cd /home/zayko/Documents/WayPoint/Client/android
./gradlew :app:processReleaseManifest
# Then check: app/build/intermediates/merged_manifests/release/AndroidManifest.xml
```

## 🚨 Common Issues

### Issue: Map shows but is blank/white
- **Cause**: API key restrictions blocking the app
- **Solution**: Add SHA-1 fingerprint to API key restrictions, or temporarily remove restrictions

### Issue: Map doesn't load at all
- **Cause**: Maps SDK for Android not enabled
- **Solution**: Enable Maps SDK for Android in Google Cloud Console

### Issue: Works in Expo but not in APK
- **Cause**: Different API keys or SHA-1 fingerprints
- **Solution**: Ensure the same API key is used and SHA-1 is registered

## 📝 Quick Checklist

- [ ] Maps SDK for Android is enabled in Google Cloud Console
- [ ] API key has correct restrictions (or is unrestricted for testing)
- [ ] SHA-1 fingerprint is added to API key restrictions (if restricted)
- [ ] Billing is enabled in Google Cloud Console
- [ ] API key is in `gradle.properties`
- [ ] App has been rebuilt after adding API key
- [ ] Checked Logcat for errors

## 🔧 Next Steps

1. **Enable Maps SDK for Android** (most likely issue)
2. **Get SHA-1 fingerprint** and add it to API key restrictions
3. **Rebuild the APK** after making changes
4. **Test again** and check Logcat for errors

