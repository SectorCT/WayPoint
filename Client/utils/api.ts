import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export const makeAuthenticatedRequest = async <T = any>(
  endpoint: string,
  options: RequestInit = {},
): Promise<Response> => {
  try {
    const accessToken = await AsyncStorage.getItem("accessToken");
    const refreshToken = await AsyncStorage.getItem("refreshToken");

    if (!accessToken || !refreshToken) {
      throw new Error("No authentication tokens found");
    }

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

      // if (!refreshResponse.ok) {
      //   console.log(refreshResponse);
      //   throw new Error("Failed to refresh token");
      // }

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
