import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, Linking, Alert, ActivityIndicator, SafeAreaView, ScrollView } from "react-native";
import { getRoute, markPackageAsDelivered } from "../../utils/journeyApi";
import { usePosition } from "@context/PositionContext";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@context/ThemeContext";
import { DrawerLayout, DrawerState } from 'react-native-gesture-handler';
import { useAuth } from "@context/AuthContext";
import { makeAuthenticatedRequest } from "@/utils/api";
import useStyles from "./index.styles";
import RouteMap from "@/components/map/RouteMap";

interface Package {
  status: "pending" | "in_transit" | "delivered";
  weight: number;
  address: string;
  latitude: number;
  longitude: number;
  packageID: string;
  recipient: string;
  deliveryDate: string;
  recipientPhoneNumber: string;
}

interface RouteData {
  user: string;
  packageSequence: Package[];
  mapRoute: [number, number][];
  dateOfCreation: string;
  truck?: string;
  _id?: string;
}

const DRAWER_WIDTH = 300;

// Function to generate a color based on a value
const generateColorFromValue = (value: string): string => {
  // Predefined distinct colors that are bright and easily distinguishable
  const colors = [
    '#FF4136', // Red
    '#2ECC40', // Green
    '#0074D9', // Blue
    '#FF851B', // Orange
    '#B10DC9', // Purple
    '#01FF70', // Neon Green
    '#F012BE', // Magenta
    '#7FDBFF', // Light Blue
    '#FFD700', // Gold
    '#39CCCC', // Teal
  ];

  // Simple hash function to get a consistent index for each username
  let total = 0;
  for (let i = 0; i < value.length; i++) {
    total = (total + value.charCodeAt(i) * (i + 1)) % colors.length;
  }

  return colors[Math.abs(total)];
};

const CurrentPositionMarker = () => {
  const styles = useStyles();
  return (
    <View style={styles.currentPositionContainer}>
      <MaterialIcons 
        name="navigation" 
        size={35} 
        color="#007AFF"
      />
    </View>
  );
};

export default function TruckerViewScreen() {
  const { theme } = useTheme();
  const { position } = usePosition();
  const { user } = useAuth();
  const drawerRef = useRef<DrawerLayout>(null);
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [loading, setLoading] = useState(true);
  const styles = useStyles();

  useEffect(() => {
    const fetchRoute = async () => {
      try {
        setLoading(true);
        const route = await getRoute(user?.username || '');
        if (route) {
          setRouteData(route);
        }
      } catch (error) {
        console.error('Error fetching route:', error);
        Alert.alert('Error', 'Failed to fetch route data');
      } finally {
        setLoading(false);
      }
    };

    fetchRoute();
  }, [user?.username]);

  const handleRecenter = () => {
    if (position.latitude && position.longitude) {
      // Recenter logic will be handled by the RouteMap component
    }
  };

  const handleDelivery = async (packageId: string) => {
    try {
      await markPackageAsDelivered(packageId);
      // Update the route data to reflect the delivery
      if (routeData) {
        const updatedPackages = routeData.packageSequence.map(pkg => 
          pkg.packageID === packageId ? { ...pkg, status: 'delivered' as const } : pkg
        );
        setRouteData({ ...routeData, packageSequence: updatedPackages });
      }
    } catch (error) {
      console.error('Error marking package as delivered:', error);
      Alert.alert('Error', 'Failed to mark package as delivered');
    }
  };

  const renderDrawerContent = () => (
    <View style={styles.drawerContainer}>
      <View style={styles.drawerHeader}>
        <Text style={styles.drawerTitle}>Delivery List</Text>
        <TouchableOpacity style={styles.closeButton} onPress={() => drawerRef.current?.closeDrawer()}>
          <MaterialIcons name="close" size={24} color="#000" />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.drawerContent}>
        {routeData?.packageSequence.map((pkg, index) => (
          <TouchableOpacity
            key={pkg.packageID}
            style={[
              styles.packageItem,
              pkg.status === 'delivered' && styles.packageItemDelivered
            ]}
            onPress={() => {
              if (pkg.status !== 'delivered') {
                handleDelivery(pkg.packageID);
              }
            }}
          >
            <View style={styles.packageHeader}>
              <Text style={styles.packageNumber}>Package {index + 1}</Text>
              {pkg.status === 'delivered' && (
                <MaterialIcons name="check-circle" size={24} color="#4CAF50" />
              )}
            </View>
            <Text style={styles.packageAddress}>{pkg.address}</Text>
            <Text style={styles.packageRecipient}>Recipient: {pkg.recipient}</Text>
            <Text style={styles.packagePhone}>Phone: {pkg.recipientPhoneNumber}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.color.darkPrimary} />
      </View>
    );
  }

  if (!routeData) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No active route assigned</Text>
      </View>
    );
  }

  return (
    <DrawerLayout
      ref={drawerRef}
      drawerWidth={DRAWER_WIDTH}
      drawerPosition="right"
      drawerType="front"
      drawerBackgroundColor="#FFFFFF"
      renderNavigationView={renderDrawerContent}
    >
      <SafeAreaView style={styles.container}>
        <RouteMap
          zones={[routeData]}
          onMapPress={() => drawerRef.current?.openDrawer()}
          generateColorFromValue={generateColorFromValue}
        />
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => drawerRef.current?.openDrawer()}
        >
          <MaterialIcons name="menu" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.recenterButton}
          onPress={handleRecenter}
        >
          <MaterialIcons name="my-location" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </SafeAreaView>
    </DrawerLayout>
  );
} 