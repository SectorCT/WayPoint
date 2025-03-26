import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useAuth } from '@context/AuthContext';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';

export default function TruckerLayout() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      router.replace('/(auth)/login');
    } else if (user.isManager) {
      router.replace('/(tabs)/home');
    }
  }, [user]);

  return (
    <>
      <StatusBar 
        style="light" 
        translucent 
        backgroundColor="transparent"
      />
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            title: 'Trucker View',
            headerShown: false,
            statusBarStyle: 'light',
            statusBarTranslucent: true,
            statusBarHidden: true,
            navigationBarColor: 'transparent',
            navigationBarHidden: true,
          }}
        />
      </Stack>
    </>
  );
} 