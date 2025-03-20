import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@context/ThemeContext';
import { makeAuthenticatedRequest } from '../../utils/api';

interface Package {
  id: string;
  recipientName: string;
  status: 'pending' | 'in_transit' | 'delivered';
  createdAt: string;
}

export default function PackagesScreen() {
  const { theme } = useTheme();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const response = await makeAuthenticatedRequest('/delivery/packages/', {
        method: 'GET'
      });
      const data = await response.json();
      setPackages(data);
    } catch (error) {
      console.error('Error fetching packages:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={[styles.headerTitle, { color: theme.color.black }]}>Packages</Text>
        <Text style={[styles.headerSubtitle, { color: 'rgba(0, 0, 0, 0.6)' }]}>
          View and manage your deliveries
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    marginTop: 20,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    lineHeight: 24,
  }
}); 