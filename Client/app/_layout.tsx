import { Stack } from "expo-router";
import { useEffect } from "react";
import { useColorScheme } from "react-native";
import { ThemeProvider } from "@context/ThemeContext";
import { AuthProvider } from "@context/AuthContext";
import { PositionProvider } from "@context/PositionContext";
import * as Font from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const FONTS = {
  Regular: require("@assets/fonts/Regular.ttf"),
  Medium: require("@assets/fonts/Medium.ttf"),
  SemiBold: require("@assets/fonts/SemiBold.ttf"),
  Bold: require("@assets/fonts/Bold.ttf"),
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync(FONTS);
        await SplashScreen.hideAsync();
      } catch (error) {
        console.error("Error loading fonts:", error);
      }
    }
    loadFonts();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <ThemeProvider>
          <PositionProvider>
            <Stack
              screenOptions={{
                headerShown: false,
              }}
            />
          </PositionProvider>
        </ThemeProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
