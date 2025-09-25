import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../config/env";

const BASE_URL = API_BASE_URL;

export const makeAuthenticatedRequest = async (
  endpoint: string,
  options: RequestInit = {},
): Promise<Response> => {
  try {
    const accessToken = await AsyncStorage.getItem("accessToken");
    const refreshToken = await AsyncStorage.getItem("refreshToken");

    if (!accessToken || !refreshToken) {
      throw new Error("No authentication tokens found");
    }
    console.log(`${BASE_URL}${endpoint}`);
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.status === 401) {
      // Token expired, try to refresh
      const refreshResponse = await fetch(`${BASE_URL}/auth/token/refresh/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh : refreshToken }),
      });

      if (!refreshResponse.ok) {
        throw new Error("Failed to refresh token");
      }

      const data = await refreshResponse.json();
      const { access: newAccessToken, refresh: newRefreshToken } = data;

      // Store new tokens
      await AsyncStorage.setItem("accessToken", newAccessToken);
      await AsyncStorage.setItem("refreshToken", newRefreshToken);
      // Retry the original request with new token
      return fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${newAccessToken}`,
        },
      });
    }

    return response;
  } catch (error) {
    
    console.error("API request error:", error);
    throw error;
  }
};

export const getDeliveryHistory = async (days: number = 7): Promise<unknown[]> => {
  try {
    const response = await makeAuthenticatedRequest(`/delivery/history/?days=${days}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching delivery history:', error);
    throw error;
  }
};
