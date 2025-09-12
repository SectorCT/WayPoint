import Constants from "expo-constants";

// Development API URL (when running on device/simulator)
const DEV_API_URL = "http://192.168.0.109:8000"; // Your PC's IP address

// Production API URL (when deployed)
const PROD_API_URL = "https://your-production-domain.com"; // Replace with your production server

// Use environment variable if set, otherwise use development URL
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? DEV_API_URL;

// For production builds, you can override this
export const getApiBaseUrl = () => {
  if (__DEV__) {
    return DEV_API_URL;
  }
  return PROD_API_URL;
};

export const SIGN_IN_ENDPOINT = '/auth/signin';
export const REGISTER_ENDPOINT = '/auth/register';
export const REFRESH_TOKEN_ENDPOINT = '/auth/refresh-token'; 