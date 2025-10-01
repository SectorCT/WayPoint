// Development API URL (when running on device/simulator)
// IMPORTANT: Update this IP to match your computer's IP on the same WiFi network
// Run: hostname -I | awk '{print $1}' to get your IP
const DEV_API_URL = "http://172.20.10.3:8000"; // Your current IP address from .env file

// Production API URL (when deployed)
const PROD_API_URL = "http://185.32.148.190:8000"; // External server IP for APK builds

// API Version
export const API_VERSION = 'v1';

// Use environment variable if set, otherwise use development URL
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? DEV_API_URL;

// For production builds, you can override this
export const getApiBaseUrl = () => {
  if (__DEV__) {
    return process.env.EXPO_PUBLIC_API_BASE_URL ?? DEV_API_URL; // Use env variable if available
  }
  return PROD_API_URL;
};

// API Endpoints with versioning
export const SIGN_IN_ENDPOINT = `/${API_VERSION}/auth/login`;
export const REGISTER_ENDPOINT = `/${API_VERSION}/auth/register`;
export const REFRESH_TOKEN_ENDPOINT = `/${API_VERSION}/auth/token/refresh`; 