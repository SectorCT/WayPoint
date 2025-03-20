import React from 'react';
import { Stack } from 'expo-router';
import { AuthProvider } from '../context/AuthContext';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Redirect } from 'expo-router';

function RootLayoutNav() {
  const { isAuthenticated } = useAuth();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        // Auth screens
        <>
          <Stack.Screen
            name="(auth)/login"
          />
          <Stack.Screen
            name="(auth)/register"
          />
        </>
      ) : (
        // App screens
        <>
          <Stack.Screen
            name="(app)/home"
          />
        </>
      )}
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
