import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Dimensions, Text, TouchableOpacity, ScrollView, Linking, Alert } from "react-native";
import MapView, { Polyline, Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { testRouteData } from "../../testRouteData";
import { usePosition } from "@context/PositionContext";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@context/ThemeContext";
import { DrawerLayout } from 'react-native-gesture-handler';

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
  driver: User;
  packageSequence: Package[];
  mapRoute: [number, number][];
  dateOfCreation: string;
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
  const { theme } = useTheme();
  const { position } = usePosition();
  const drawerRef = useRef<DrawerLayout>(null);
  const mapRef = useRef<MapView>(null);
  const [isDrawerReady, setIsDrawerReady] = useState(false);
  const [locations, setLocations] = useState<RouteLocation[]>([]);
  const currentZone = (testRouteData[0] as unknown as RouteData);
  const routeColor = generateColorFromValue(currentZone.driver.username);

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

  useEffect(() => {
    // Initialize locations from package sequence
    const newLocations = currentZone.packageSequence.map((packageInfo, index) => ({
      latitude: packageInfo.latitude,
      longitude: packageInfo.longitude,
      waypoint_index: index,
      package_info: packageInfo as Package
    }));
    setLocations(newLocations);
  }, [currentZone]);

  const handleDelivery = async (packageId: string) => {
    try {
      // const response = await fetch(`/delivery/deliver/${packageId}`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      // });

      // if (!response.ok) {
      //   console.error('Failed to mark package as delivered:', response);
      // }

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

  // Extract route points
  const routePoints: Coordinate[] = currentZone.mapRoute.map((point) => ({
    latitude: point[1],
    longitude: point[0],
  }));

  // Filter out delivered packages from locations based on status
  const activeLocations = locations.filter(
    location => location.package_info.status !== 'delivered'
  );

  const initialRegion = locations.length > 0 ? {
    latitude: locations[0].latitude,
    longitude: locations[0].longitude,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  } : {
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  const renderDrawerContent = () => (
    <View style={[styles.drawerContainer, { backgroundColor: theme.color.white }]}>
      <View style={[styles.drawerHeader, { backgroundColor: theme.color.white }]}>
        <Text style={[styles.drawerTitle, { color: theme.color.black }]}>Delivery Route</Text>
        <TouchableOpacity 
          style={styles.closeButton} 
          onPress={() => drawerRef.current?.closeDrawer()}
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
                  <Text style={styles.indexText}>{location.waypoint_index + 1}</Text>
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

  if (!isDrawerReady) {
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
        />
      </View>
    );
  }

  return (
    <DrawerLayout
      ref={drawerRef}
      drawerWidth={DRAWER_WIDTH}
      drawerPosition="right"
      drawerType="slide"
      drawerBackgroundColor={theme.color.white}
      renderNavigationView={renderDrawerContent}
    >
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
                number={location.waypoint_index + 1} 
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

        <TouchableOpacity 
          style={[styles.menuButton, { backgroundColor: theme.color.darkPrimary }]} 
          onPress={() => drawerRef.current?.openDrawer()}
        >
          <MaterialIcons name="local-shipping" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.recenterButton, 
            { 
              backgroundColor: theme.color.darkPrimary,
            }
          ]} 
          onPress={handleRecenter}
        >
          <MaterialIcons 
            name="my-location"
            size={24} 
            color="#FFFFFF" 
          />
        </TouchableOpacity>
      </View>
    </DrawerLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  markerContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  markerContainerDelivered: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
  },
  markerText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  currentPositionContainer: {
    width: 35,
    height: 35,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  navigationIcon: {
    backfaceVisibility: 'hidden',
    position: 'absolute',
  },
  menuButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  drawerContainer: {
    flex: 1,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1.41,
  },
  drawerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  packageList: {
    flex: 1,
  },
  packageListContent: {
    padding: 20,
  },
  packageItem: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    marginBottom: 10,
  },
  packageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  indexBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  indexText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  recipientName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  address: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    marginRight: 10,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  callButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  completeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  recenterButton: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
}); 