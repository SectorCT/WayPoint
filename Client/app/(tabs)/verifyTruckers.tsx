import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useTheme } from '@context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../config/env';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { router } from 'expo-router';

export default function VerifyTruckersScreen() {
  const { user } = useAuth();
  const theme = useTheme().theme;
  const [unverifiedTruckers, setUnverifiedTruckers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.isManager) {
      fetchUnverifiedTruckers();
    }
  }, [user]);

  const fetchUnverifiedTruckers = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const url = `${API_BASE_URL}/delivery/truckers/unverified/`;
      const headers = { 'Authorization': `Bearer ${token}` };
      if (!token) {
        setUnverifiedTruckers([]);
        setLoading(false);
        return;
      }
      const response = await fetch(url, { headers });
      const data = await response.json();
      setUnverifiedTruckers(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyTrucker = async (username: string) => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE_URL}/delivery/truckers/verify/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username })
      });
      if (response.ok) {
        setUnverifiedTruckers(prev => prev.filter(t => t.username !== username));
      } else {
        Alert.alert('Error', 'Failed to verify trucker.');
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to verify trucker.');
    }
  };

  const handleBack = () => {
    router.push('/(tabs)/home');
  };

  if (!user?.isManager) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.color.white }}>
        <Text style={{ fontSize: 18, color: theme.color.black }}>Access denied.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.color.white }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingBottom: 8, paddingHorizontal: 20, backgroundColor: theme.color.white, borderBottomWidth: 1, borderBottomColor: theme.color.lightGrey, elevation: 2 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 22, fontWeight: 'bold', color: theme.color.black }}>Drivers Awaiting Verification</Text>
          {user.company ? (
            <Text style={{ fontSize: 15, color: theme.color.mediumPrimary, marginTop: 2 }}>
              {user.company.name} (ID: {user.company.unique_id})
            </Text>
          ) : (
            <Text style={{ fontSize: 15, color: theme.color.darkPrimary, marginTop: 2 }}>
              No company assigned to this manager account.
            </Text>
          )}
        </View>
        <TouchableOpacity onPress={handleBack} style={{ padding: 8, borderRadius: 20, backgroundColor: '#f5f5f5', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 }}>
          <MaterialIcons name="arrow-back" size={24} color={theme.color.darkPrimary} />
        </TouchableOpacity>
      </View>
      <View style={{ flex: 1, padding: 20 }}>
        {loading ? (
          <ActivityIndicator size="large" color={theme.color.mediumPrimary} />
        ) : unverifiedTruckers.length === 0 ? (
          <Text style={{ color: theme.color.lightGrey, marginTop: 32, textAlign: 'center' }}>No drivers awaiting verification.</Text>
        ) : (
          unverifiedTruckers.map(trucker => (
            <View key={trucker.username} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, backgroundColor: theme.color.lightPrimary, borderRadius: 10, padding: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4 }}>
              <MaterialIcons name="person" size={28} color={theme.color.mediumPrimary} style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 17, fontWeight: 'bold', color: theme.color.black }}>{trucker.username}</Text>
                <Text style={{ fontSize: 15, color: theme.color.black }}>{trucker.email}</Text>
              </View>
              <TouchableOpacity onPress={() => handleVerifyTrucker(trucker.username)} style={{ backgroundColor: theme.color.mediumPrimary, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 6, marginRight: 8 }}>
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Verify</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>
    </View>
  );
} 