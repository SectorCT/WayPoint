import Constants from "expo-constants";

// Development API URL (when running on device/simulator)
const DEV_API_URL = "http://10.0.2.2:8000"; // Special IP for Android emulator to reach host
const DEV_API_URL_PHYSICAL = "http://192.168.0.159:8000"; // Your PC's IP address for physical devices

// Production API URL (when deployed)
const PROD_API_URL = "http://185.32.148.190:8000"; // External server IP for APK builds

// Use environment variable if set, otherwise use development URL
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? DEV_API_URL;

// For production builds, you can override this
export const getApiBaseUrl = () => {
  if (__DEV__) {
    return DEV_API_URL; // Will use 10.0.2.2 for emulator
  }
  return PROD_API_URL;
};

export const SIGN_IN_ENDPOINT = '/auth/login';
export const REGISTER_ENDPOINT = '/auth/register';
export const REFRESH_TOKEN_ENDPOINT = '/auth/token/refresh'; 