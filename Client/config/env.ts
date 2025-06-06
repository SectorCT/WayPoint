import Constants from "expo-constants";

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? `http://${Constants.expoConfig?.hostUri?.split(':')[0]}:8000`;
export const SIGN_IN_ENDPOINT = '/auth/signin';
export const REGISTER_ENDPOINT = '/auth/register';
export const REFRESH_TOKEN_ENDPOINT = '/auth/refresh-token'; 