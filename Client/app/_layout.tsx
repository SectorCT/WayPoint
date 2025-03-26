import React, { useState } from "react";
import { Stack, Slot } from "expo-router";
import { AuthProvider } from "../context/AuthContext";
import { PositionProvider } from "../context/PositionContext";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import * as Font from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { FONTS } from "@/constants/fonts";
import { ThemeProvider } from "@context/ThemeContext";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { router } from 'expo-router';
import { StatusBar } from "expo-status-bar";

const loadFonts = () => {
  return Font.loadAsync({
    [FONTS.regular]: require("../assets/fonts/Regular.ttf"),
    [FONTS.medium]: require("../assets/fonts/Medium.ttf"),
    [FONTS.semibold]: require("../assets/fonts/SemiBold.ttf"),
    [FONTS.bold]: require("../assets/fonts/Bold.ttf"),
  });
};

function RootLayoutNav() {
  const { user } = useAuth();
  const [fontsLoaded, setFontsLoaded] = useState(false);
  
  useEffect(() => {
    async function prepare() {
      try {
        await loadFonts();
      } catch (e) {
        console.warn(e);
      } finally {
        setFontsLoaded(true);
        await SplashScreen.hideAsync();
      }
    }
    prepare();
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      if (!user) {
        router.replace('/(auth)/login');
      } else if (user.isManager) {
        router.replace('/(tabs)/home');
      } else {
        router.replace('/(trucker)');
      }
    }
  }, [user, fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <ThemeProvider>
      <PositionProvider>
        <StatusBar hidden={true} />
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "fade",
            navigationBarHidden: true,
          }}
        >
          <Slot />
        </Stack>
      </PositionProvider>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
