import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export const makeAuthenticatedRequest = async (
  endpoint: string,
  options: RequestInit = {},
) => {
  try {
    const accessToken = await AsyncStorage.getItem("accessToken");
    const refreshToken = await AsyncStorage.getItem("refreshToken");
    console.log(`base url + endpoint ${BASE_URL}${endpoint}`);

    if (!accessToken || !refreshToken) {
      throw new Error("No authentication tokens found");
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.status === 401) {
      // Token expired, try to refresh
      const refreshResponse = await fetch(`${BASE_URL}/refresh-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!refreshResponse.ok) {
        throw new Error("Failed to refresh token");
      }

      const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
        await refreshResponse.json();

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

