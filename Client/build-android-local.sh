    #!/bin/bash

# WayPoint Android APK Local Build Script
# This script builds the Android APK locally without using EAS (no queue wait)

set -e  # Exit on error

echo "🚀 Building WayPoint Android APK locally..."

# Check for Java
if ! command -v java &> /dev/null; then
    echo "❌ Java is not installed!"
    echo ""
    echo "Please install Java JDK 17 or 21:"
    echo "  sudo apt install openjdk-17-jdk"
    echo "  # or"
    echo "  sudo apt install openjdk-21-jdk"
    echo ""
    echo "After installation, set JAVA_HOME:"
    echo "  export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64"
    echo "  # or for JDK 21:"
    echo "  export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64"
    exit 1
fi

# Check JAVA_HOME
if [ -z "$JAVA_HOME" ]; then
    # Try to find Java automatically
    JAVA_PATH=$(which java)
    if [ -n "$JAVA_PATH" ]; then
        JAVA_HOME=$(readlink -f "$JAVA_PATH" | sed "s:bin/java::")
        export JAVA_HOME
        echo "📍 Auto-detected JAVA_HOME: $JAVA_HOME"
    else
        echo "⚠️  JAVA_HOME is not set. Attempting to find Java..."
        # Try common locations
        if [ -d "/usr/lib/jvm/java-17-openjdk-amd64" ]; then
            export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
        elif [ -d "/usr/lib/jvm/java-21-openjdk-amd64" ]; then
            export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
        else
            echo "❌ Could not find JAVA_HOME. Please set it manually:"
            echo "  export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64"
            exit 1
        fi
    fi
fi

echo "✅ Java found: $(java -version 2>&1 | head -n 1)"
echo "✅ JAVA_HOME: $JAVA_HOME"

# Check for Android SDK
if [ -z "$ANDROID_HOME" ]; then
    if [ -d "$HOME/Android/Sdk" ]; then
        export ANDROID_HOME="$HOME/Android/Sdk"
        echo "📍 Auto-detected ANDROID_HOME: $ANDROID_HOME"
    else
        echo "⚠️  ANDROID_HOME is not set and Android SDK not found in ~/Android/Sdk"
        echo "   Please install Android SDK or set ANDROID_HOME environment variable"
        exit 1
    fi
fi

# Create local.properties if it doesn't exist
LOCAL_PROPERTIES="android/local.properties"
if [ ! -f "$LOCAL_PROPERTIES" ]; then
    echo "📝 Creating local.properties..."
    mkdir -p android
    echo "sdk.dir=$ANDROID_HOME" > "$LOCAL_PROPERTIES"
fi

# Navigate to Client directory
cd "$(dirname "$0")"

# Load .env file if it exists
if [ -f ".env" ]; then
    echo "📄 Loading .env file..."
    export $(grep -v '^#' .env | xargs)
    echo "   ✅ Loaded environment variables from .env"
    echo "   EXPO_PUBLIC_API_BASE_URL=${EXPO_PUBLIC_API_BASE_URL:-not set}"
    echo "   EXPO_PUBLIC_GEOAPIFY_API_KEY=${EXPO_PUBLIC_GEOAPIFY_API_KEY:+set}"
    echo "   GOOGLE_MAPS_API_KEY=${GOOGLE_MAPS_API_KEY:+set}"
else
    echo "⚠️  No .env file found. Environment variables may not be loaded."
fi

# Check for Google Maps API Key (from .env or gradle.properties)
if [ -z "$GOOGLE_MAPS_API_KEY" ]; then
    # Try to read from gradle.properties
    if [ -f "android/gradle.properties" ]; then
        GRADLE_KEY=$(grep "^GOOGLE_MAPS_API_KEY=" android/gradle.properties | cut -d'=' -f2- | tr -d ' ' | head -1)
        if [ -n "$GRADLE_KEY" ] && [ "$GRADLE_KEY" != "YOUR_ANDROID_API_KEY" ]; then
            export GOOGLE_MAPS_API_KEY="$GRADLE_KEY"
            echo "✅ Found Google Maps API Key in gradle.properties"
        fi
    fi
fi

if [ -z "$GOOGLE_MAPS_API_KEY" ] || [ "$GOOGLE_MAPS_API_KEY" = "YOUR_ANDROID_API_KEY" ]; then
    echo "⚠️  WARNING: GOOGLE_MAPS_API_KEY is not set or is still a placeholder!"
    echo "   The map will appear black in the built APK."
    echo "   Set it in .env file or gradle.properties:"
    echo "   GOOGLE_MAPS_API_KEY=your_actual_api_key_here"
    echo ""
fi

# Patch React Native std::format issue
echo "🔧 Checking for React Native std::format patch..."
if [ -f "./patch-react-native.sh" ]; then
    chmod +x ./patch-react-native.sh
    ./patch-react-native.sh
else
    echo "⚠️  patch-react-native.sh not found. std::format errors may occur."
fi

# Patch expo-blur BlurView dependency if JitPack is having issues
echo "🔧 Checking expo-blur dependency..."
if [ -f "node_modules/expo-blur/android/build.gradle" ]; then
    # Fix the version tag if needed (JitPack sometimes has issues with "version-2.0.6")
    if grep -q "version-2.0.6" "node_modules/expo-blur/android/build.gradle" 2>/dev/null; then
        echo "   ℹ️  Using BlurView version-2.0.6 (if JitPack fails, this may need manual fix)"
    fi
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if Android directory exists
if [ ! -d "android" ]; then
    echo "📱 Prebuilding Android project..."
    npx expo prebuild --platform android
fi

# Navigate to Android directory
cd android

# Clean previous builds
echo "🧹 Cleaning previous builds..."
./gradlew clean

# Build release APK with environment variables
echo "🔨 Building release APK with environment variables..."
echo "   EXPO_PUBLIC_API_BASE_URL=${EXPO_PUBLIC_API_BASE_URL:-not set}"
echo "   EXPO_PUBLIC_GEOAPIFY_API_KEY=${EXPO_PUBLIC_GEOAPIFY_API_KEY:+set}"
echo "   GOOGLE_MAPS_API_KEY=${GOOGLE_MAPS_API_KEY:+set}"

# Build with output capture
set +e  # Temporarily disable exit on error
./gradlew assembleRelease -PEXPO_PUBLIC_API_BASE_URL="${EXPO_PUBLIC_API_BASE_URL}" -PEXPO_PUBLIC_GEOAPIFY_API_KEY="${EXPO_PUBLIC_GEOAPIFY_API_KEY}" -PGOOGLE_MAPS_API_KEY="${GOOGLE_MAPS_API_KEY}" 2>&1 | tee /tmp/gradle_build.log
BUILD_STATUS=${PIPESTATUS[0]}
set -e  # Re-enable exit on error

# If build failed, check if it's due to std::format error
if [ $BUILD_STATUS -ne 0 ]; then
    if grep -q "no member named 'format' in namespace 'std'" /tmp/gradle_build.log; then
        echo ""
        echo "🔧 Build failed due to std::format error. Patching and retrying..."
        if [ -f "../patch-react-native.sh" ]; then
            cd ..
            ./patch-react-native.sh
            cd android
            echo "🔄 Retrying build after patch..."
            ./gradlew assembleRelease -PEXPO_PUBLIC_API_BASE_URL="${EXPO_PUBLIC_API_BASE_URL}" -PEXPO_PUBLIC_GEOAPIFY_API_KEY="${EXPO_PUBLIC_GEOAPIFY_API_KEY}" -PGOOGLE_MAPS_API_KEY="${GOOGLE_MAPS_API_KEY}"
        else
            echo "❌ Build failed and patch script not found. Please run patch-react-native.sh manually."
            exit 1
        fi
    else
        echo "❌ Build failed with a different error. Check the logs above."
        exit 1
    fi
fi

# Check if APK was created
APK_PATH="app/build/outputs/apk/release/app-release.apk"
if [ -f "$APK_PATH" ]; then
    echo "✅ APK built successfully!"
    echo "📱 APK location: $(pwd)/$APK_PATH"
    echo ""
    echo "To install on your device:"
    echo "  adb install $APK_PATH"
    echo ""
    echo "Or copy the APK to your device and install manually."
else
    echo "❌ APK not found. Build may have failed."
    exit 1
fi

