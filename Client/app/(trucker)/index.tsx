import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Dimensions, Text, TouchableOpacity, ScrollView, Linking, Alert, ActivityIndicator, Drawer } from "react-native";
import MapView, { Polyline, Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { getRoute, markPackageAsDelivered } from "../../utils/journeyApi";
import { usePosition } from "@context/PositionContext";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@context/ThemeContext";
import { DrawerLayout } from 'react-native-gesture-handler';
import { useAuth } from "@context/AuthContext";
import { makeAuthenticatedRequest } from "@/utils/api";
import useStyles from "./index.styles";

interface Coordinate {
  latitude: number;
  longitude: number;
}

interface RouteLocation extends Coordinate {
  waypoint_index: number;
  package_info: Package;
}

interface User {
  email: string;
  username: string;
  phoneNumber: string;
  isManager: boolean;
}

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

const CustomMarker = ({ number, isDelivered }: { number: number, isDelivered: boolean }) => (
  <View style={[
    styles.markerContainer,
    isDelivered && styles.markerContainerDelivered
  ]}>
    {isDelivered ? (
      <MaterialIcons name="check" size={20} color="#4CAF50" />
    ) : (
      <Text style={styles.markerText}>{number}</Text>
    )}
  </View>
);

const CurrentPositionMarker = ({ heading }: { heading: number | null }) => (
  <View style={styles.currentPositionContainer}>
    <MaterialIcons 
      name="navigation" 
      size={35} 
      color="#2196F3"
      style={[
        styles.navigationIcon,
        heading !== null ? {
          transform: [{ rotate: `${heading}deg` }]
        } : undefined
      ]}
    />
  </View>
);

export default function TruckerViewScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { position } = usePosition();
  const { logout } = useAuth();
  const drawerRef = useRef<DrawerLayout>(null);
  const mapRef = useRef<MapView>(null);
  const [isDrawerReady, setIsDrawerReady] = useState(false);
  const [locations, setLocations] = useState<RouteLocation[]>([]);
  const [currentZone, setCurrentZone] = useState<RouteData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const styles = useStyles();
  
  const routeColor = generateColorFromValue(currentZone?.user || '');
  
  useEffect(() => {
    const fetchRoute = async () => {
      try {
        if (!user) {
          throw new Error('User not found');
        }
        setIsLoading(true);
        setError(null);
        const data = await getRoute(user.username);
        setCurrentZone(data);
      } catch (err) {
        setError('Failed to load route data');
        console.error('Error loading route:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRoute();
  }, []);
  
  useEffect(() => {
    if (!currentZone?.packageSequence) {
      return;
    }
    
    const newLocations = currentZone.packageSequence.map((packageInfo, index) => ({
      latitude: packageInfo.latitude,
      longitude: packageInfo.longitude,
      waypoint_index: index,
      package_info: {
        ...packageInfo,
        // Automatically mark ADMIN packages as delivered
        status: packageInfo.packageID === "ADMIN" ? "delivered" : packageInfo.status
      }
    }));
    setLocations(newLocations);
  }, [currentZone]);

  const routePoints: Coordinate[] = currentZone?.mapRoute?.map((point) => ({
    latitude: point[1],
    longitude: point[0],
  })) || [];

  const activeLocations = locations.filter(
    location => location.package_info.status !== 'delivered' && location.package_info.packageID !== "ADMIN"
  );

  useEffect(() => {
    // Set drawer ready after initial render
    setIsDrawerReady(true);
  }, []);

  const handleRecenter = () => {
    if (mapRef.current && position.latitude && position.longitude) {
      mapRef.current.animateCamera({
        center: {
          latitude: position.latitude,
          longitude: position.longitude,
        },
        heading: position.heading || 0,
        pitch: 0,
        zoom: 17,
      }, { duration: 200 });
    }
  };

  useEffect(() => {
    // Initial centering on user's position when it becomes available
    if (position.latitude && position.longitude) {
      handleRecenter();
    }
  }, []);

  const handleDelivery = async (packageId: string) => {
    try {
      const response = await markPackageAsDelivered(packageId);

      if (!response.ok) {
        console.error('Failed to mark package as delivered:', response);
      }

      // Update the status of the package in locations
      const updatedLocations = locations.map(location => 
        location.package_info.packageID === packageId 
          ? { 
              ...location, 
              package_info: { 
                ...location.package_info, 
                status: 'delivered' as const 
              } 
            }
          : location
      );
      setLocations(updatedLocations);
      
    } catch (error) {
      console.error('Error marking package as delivered:', error);
    }
  };

  const initialRegion = locations && locations.length > 0 ? {
    latitude: locations[0].latitude,
    longitude: locations[0].longitude,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  } : {
    latitude: 42.692865, // Default to first package location from test data
    longitude: 23.334036,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  const renderDrawerContent = () => (
    <View style={[styles.drawerContainer, { backgroundColor: theme.color.white }]}>
      <View style={[styles.drawerHeader, { backgroundColor: theme.color.white }]}>
        <Text style={[styles.drawerTitle, { color: theme.color.black }]}>Delivery Route</Text>
        <TouchableOpacity 
          style={styles.closeButton} 
          onPress={() => setDrawerVisible(false)}
        >
          <MaterialIcons name="close" size={24} color={theme.color.darkPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.packageList}
        contentContainerStyle={styles.packageListContent}
        showsVerticalScrollIndicator={true}
      >
        {activeLocations.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <MaterialIcons name="check-circle" size={64} color={theme.color.darkPrimary} />
            <Text style={[styles.emptyStateTitle, { color: theme.color.black }]}>
              All Deliveries Complete!
            </Text>
            <Text style={[styles.emptyStateSubtitle, { color: theme.color.lightGrey }]}>
              Great job! You've completed all your deliveries for today.
            </Text>
          </View>
        ) : (
          activeLocations.map((location) => (
            <View key={location.waypoint_index} style={styles.packageItem}>
              <View style={styles.packageHeader}>
                <View style={[styles.indexBadge, { backgroundColor: theme.color.darkPrimary }]}>
                  <Text style={styles.indexText}>{location.waypoint_index}</Text>
                </View>
                <Text style={[styles.recipientName, { color: theme.color.black }]}>
                  {location.package_info.recipient}
                </Text>
              </View>
              <View style={styles.addressRow}>
                <Text style={styles.address}>{location.package_info.address}</Text>
                <TouchableOpacity 
                  style={[styles.callButton, { backgroundColor: theme.color.darkPrimary }]}
                  onPress={() => Linking.openURL(`tel:${location.package_info.recipientPhoneNumber}`)}
                >
                  <MaterialIcons name="phone" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              <TouchableOpacity 
                style={[styles.completeButton, { borderColor: theme.color.darkPrimary }]}
                onPress={() => handleDelivery(location.package_info.packageID)}
              >
                <MaterialIcons name="check" size={20} color={theme.color.darkPrimary} />
                <Text style={[styles.completeButtonText, { color: theme.color.darkPrimary }]}>
                  Mark as Delivered
                </Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );

  if (!isDrawerReady || isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={theme.color.darkPrimary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={[styles.errorText, { color: '#FF4136' }]}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={position.latitude && position.longitude ? {
          latitude: position.latitude,
          longitude: position.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        } : initialRegion}
        showsUserLocation
        showsMyLocationButton
      >
        <Polyline
          coordinates={routePoints}
          strokeColor={routeColor}
          strokeWidth={3}
        />

        {locations.map((location) => (
          <Marker
            key={`marker-${location.package_info.packageID}`}
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude
            }}
          >
            <CustomMarker 
              number={location.waypoint_index} 
              isDelivered={location.package_info.status === 'delivered'}
            />
          </Marker>
        ))}

        {position.latitude && position.longitude && (
          <Marker
            coordinate={{
              latitude: position.latitude,
              longitude: position.longitude
            }}
            anchor={{ x: 0.5, y: 0.5 }}
            flat={true}
          >
            <CurrentPositionMarker heading={position.heading} />
          </Marker>
        )}
      </MapView>

      <TouchableOpacity style={styles.menuButton} onPress={() => setDrawerVisible(true)}>
        <MaterialIcons name="menu" size={24} color="#000" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <MaterialIcons name="logout" size={24} color="#000" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.recenterButton} onPress={handleRecenter}>
        <MaterialIcons name="my-location" size={24} color="#000" />
      </TouchableOpacity>

      <Drawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        style={styles.drawerContainer}
      >
        <View style={styles.drawerHeader}>
          <Text style={styles.drawerTitle}>Packages</Text>
          <TouchableOpacity style={styles.closeButton} onPress={() => setDrawerVisible(false)}>
            <MaterialIcons name="close" size={24} color="#000" />
          </TouchableOpacity>
        </View>
        <ScrollView
          contentContainerStyle={styles.packageListContent}
          style={styles.packageList}
        >
          {activeLocations.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <MaterialIcons name="check-circle" size={64} color={theme.color.darkPrimary} />
              <Text style={[styles.emptyStateTitle, { color: theme.color.black }]}>
                All Deliveries Complete!
              </Text>
              <Text style={[styles.emptyStateSubtitle, { color: theme.color.lightGrey }]}>
                Great job! You've completed all your deliveries for today.
              </Text>
            </View>
          ) : (
            activeLocations.map((location) => (
              <View key={location.waypoint_index} style={styles.packageItem}>
                <View style={styles.packageHeader}>
                  <View style={[styles.indexBadge, { backgroundColor: theme.color.darkPrimary }]}>
                    <Text style={styles.indexText}>{location.waypoint_index}</Text>
                  </View>
                  <Text style={[styles.recipientName, { color: theme.color.black }]}>
                    {location.package_info.recipient}
                  </Text>
                </View>
                <View style={styles.addressRow}>
                  <Text style={styles.address}>{location.package_info.address}</Text>
                  <TouchableOpacity 
                    style={[styles.callButton, { backgroundColor: theme.color.darkPrimary }]}
                    onPress={() => Linking.openURL(`tel:${location.package_info.recipientPhoneNumber}`)}
                  >
                    <MaterialIcons name="phone" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity 
                  style={[styles.completeButton, { borderColor: theme.color.darkPrimary }]}
                  onPress={() => handleDelivery(location.package_info.packageID)}
                >
                  <MaterialIcons name="check" size={20} color={theme.color.darkPrimary} />
                  <Text style={[styles.completeButtonText, { color: theme.color.darkPrimary }]}>
                    Mark as Delivered
                  </Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>
      </Drawer>
    </View>
  );
} 