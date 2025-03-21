import { Stack } from 'expo-router';
import { useAuth } from '@context/AuthContext';
import { useEffect } from 'react';
import { router } from 'expo-router';

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
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Trucker View',
          headerShown: false,
        }}
      />
    </Stack>
  );
} 