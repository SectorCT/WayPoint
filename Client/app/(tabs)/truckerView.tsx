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

interface RouteData {
  zone: number;
  route: {
    waypoint_index: number;
    package_info: Package;
    route: [number, number][];
    location: [number, number];
    duration: number;
  }[];
  driverUsername: string;
}

const DRAWER_WIDTH = 300;

// Function to generate a color based on a value
const generateColorFromValue = (value: number): string => {
  // Multiply by a larger number to create more variation
  // Using prime numbers for better distribution
  const hue = ((value * 47) % 360);  // 47 is prime, gives good distribution over 1-20
  
  // Lower saturation and value ranges for more muted colors
  const s = 0.4 + (value % 3) * 0.15;  // Saturation varies between 0.4 and 0.85
  const v = 0.5 + (value % 2) * 0.15;  // Value varies between 0.5 and 0.65

  const c = v * s;
  const x = c * (1 - Math.abs((hue / 60) % 2 - 1));
  const m = v - c;

  let r, g, b;
  if (hue < 60) { r = c; g = x; b = 0; }
  else if (hue < 120) { r = x; g = c; b = 0; }
  else if (hue < 180) { r = 0; g = c; b = x; }
  else if (hue < 240) { r = 0; g = x; b = c; }
  else if (hue < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }

  // Convert to hex
  const toHex = (n: number) => Math.round((n + m) * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
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
  const [deliveredPackages, setDeliveredPackages] = useState<Set<string>>(new Set());
  const currentZone = testRouteData[0] as RouteData;
  const routeColor = generateColorFromValue(currentZone.zone);
  const { position } = usePosition();
  const drawerRef = useRef<DrawerLayout>(null);
  const mapRef = useRef<MapView>(null);
  const [isTracking, setIsTracking] = useState(false);

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
      // const response = await fetch(`/delivery/deliver/${packageId}`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      // });

      // if (!response.ok) {
      //   // throw new Error('Failed to mark package as delivered');
      //   console.error('Failed to mark package as delivered:', response);
      // }

      await setDeliveredPackages(prev => new Set([...prev, packageId]));
    } catch (error) {
      console.error('Error marking package as delivered:', error);
    }
  };

  // Extract locations from route data
  const locations: RouteLocation[] = currentZone.route.map((routeSection) => ({
    latitude: routeSection.location[1],
    longitude: routeSection.location[0],
    waypoint_index: routeSection.waypoint_index,
    package_info: routeSection.package_info
  }));

  // Extract route points
  const routePoints: Coordinate[] = currentZone.route.flatMap(route => 
    route.route.map((point: [number, number]) => ({
      latitude: point[1],
      longitude: point[0],
    }))
  );

  // Filter out delivered packages from locations
  const activeLocations = locations.filter(
    location => !deliveredPackages.has(location.package_info.packageID)
  );

  const initialRegion = {
    latitude: locations[0].latitude,
    longitude: locations[0].longitude,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  const renderDrawerContent = () => (
    <View style={[styles.drawerContainer, { backgroundColor: theme.color.white }]}>
      <View style={[styles.drawerHeader, { backgroundColor: theme.color.white }]}>
        <Text style={[styles.drawerTitle, { color: theme.color.black }]}>Delivery Route</Text>
        <TouchableOpacity 
          style={[styles.closeButton]} 
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
          onPanDrag={() => setIsTracking(false)}
          onTouchStart={() => setIsTracking(false)}
        >
          <Polyline
            coordinates={routePoints}
            strokeColor={routeColor}
            strokeWidth={3}
          />

          {locations.map((location) => (
            <Marker
              key={location.waypoint_index}
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude
              }}
            >
              <CustomMarker 
                number={location.waypoint_index + 1} 
                isDelivered={deliveredPackages.has(location.package_info.packageID)}
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