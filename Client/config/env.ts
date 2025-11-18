// Development API URLs for different environments
// Android Emulator: use 10.0.2.2 (maps to host machine's localhost)
const ANDROID_EMULATOR_URL = "http://10.0.2.2:8000";

// iOS Simulator: use localhost
const IOS_SIMULATOR_URL = "http://localhost:8000";

// Physical Device: use your machine's actual IP on the same WiFi network
// Run: ipconfig (Windows) or hostname -I (Linux) to get your IP
const PHYSICAL_DEVICE_URL = "http://172.20.10.3:8000";

// Production API URL (when deployed)
const PROD_API_URL = "http://185.32.148.190:8000";

// Default to localhost for local builds (no queue, direct connection)
// For physical device testing, change this to your machine's IP address
const DEV_API_URL = "http://localhost:8000";

// API Version
export const API_VERSION = process.env.EXPO_PUBLIC_API_VERSION || 'v1';

// Use environment variable if set, otherwise use development URL
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? DEV_API_URL;

// Debug: Log the API base URL to verify environment variable is loaded
if (__DEV__) {
  console.log('API_BASE_URL:', API_BASE_URL);
  console.log('EXPO_PUBLIC_API_BASE_URL from env:', process.env.EXPO_PUBLIC_API_BASE_URL);
}

// For production builds, you can override this
export const getApiBaseUrl = () => {
  if (__DEV__) {
    return process.env.EXPO_PUBLIC_API_BASE_URL ?? DEV_API_URL;
  }
  return PROD_API_URL;
};

// API Endpoints with versioning
export const SIGN_IN_ENDPOINT = `/${API_VERSION}/auth/login`;
export const REGISTER_ENDPOINT = `/${API_VERSION}/auth/register`;
export const REFRESH_TOKEN_ENDPOINT = `/${API_VERSION}/auth/token/refresh`; 