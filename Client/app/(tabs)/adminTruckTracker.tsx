import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Dimensions, Text, TouchableOpacity, ScrollView } from "react-native";
import MapView, { Polyline, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { testRouteData } from "../../testRouteData";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@context/ThemeContext";
import { usePosition } from "@context/PositionContext";
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

const DRAWER_WIDTH = 300;
const PADDING_MULTIPLIER = 1.5; // For padding around the route bounds

const calculateRouteBounds = (routePoints: Coordinate[]) => {
  let minLat = routePoints[0].latitude;
  let maxLat = routePoints[0].latitude;
  let minLng = routePoints[0].longitude;
  let maxLng = routePoints[0].longitude;

  routePoints.forEach(point => {
    minLat = Math.min(minLat, point.latitude);
    maxLat = Math.max(maxLat, point.latitude);
    minLng = Math.min(minLng, point.longitude);
    maxLng = Math.max(maxLng, point.longitude);
  });

  const centerLat = (minLat + maxLat) / 2;
  const centerLng = (minLng + maxLng) / 2;
  const latDelta = (maxLat - minLat) * PADDING_MULTIPLIER;
  const lngDelta = (maxLng - minLng) * PADDING_MULTIPLIER;

  return {
    center: { latitude: centerLat, longitude: centerLng },
    span: { latitudeDelta: latDelta, longitudeDelta: lngDelta }
  };
};

export default function AdminTruckTrackerScreen() {
  const { theme } = useTheme();
  const { position } = usePosition();
  const drawerRef = useRef<DrawerLayout>(null);
  const mapRef = useRef<MapView>(null);
  const [zoneLocations, setZoneLocations] = useState<Map<string, RouteLocation[]>>(new Map());

  useEffect(() => {
    // Initialize locations for all zones
    const newZoneLocations = new Map<string, RouteLocation[]>();
    
    (testRouteData as unknown as RouteData[]).forEach((zoneData) => {
      const locations = zoneData.packageSequence.map((packageInfo, index) => ({
        latitude: packageInfo.latitude,
        longitude: packageInfo.longitude,
        waypoint_index: index,
        package_info: packageInfo as Package
      }));
      newZoneLocations.set(zoneData.driver.username, locations);
    });

    setZoneLocations(newZoneLocations);
  }, []);

  useEffect(() => {
    // Center on user's position when it becomes available
    if (position.latitude && position.longitude && mapRef.current) {
      mapRef.current.animateCamera({
        center: {
          latitude: position.latitude,
          longitude: position.longitude,
        },
        zoom: 15,
      });
    }
  }, []);

  // Calculate initial region based on all locations or device position
  const allLocations = Array.from(zoneLocations.values()).flat();
  const initialRegion = position.latitude && position.longitude ? {
    latitude: position.latitude,
    longitude: position.longitude,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  } : allLocations.length > 0 ? {
    latitude: allLocations[0].latitude,
    longitude: allLocations[0].longitude,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  } : {
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  const calculateRouteProgress = (routeData: RouteData) => {
    const totalPackages = routeData.packageSequence.length;
    const deliveredPackages = routeData.packageSequence.filter(
      pkg => pkg.status === 'delivered'
    ).length;
    return (deliveredPackages / totalPackages) * 100;
  };

  const handleRoutePress = (routeData: RouteData) => {
    // Convert route points to coordinates
    const routePoints: Coordinate[] = [
      ...routeData.mapRoute.map(point => ({
        latitude: point[1],
        longitude: point[0],
      })),
      ...routeData.packageSequence.map(pkg => ({
        latitude: pkg.latitude,
        longitude: pkg.longitude,
      }))
    ];

    // Calculate bounds including both route and package locations
    const bounds = calculateRouteBounds(routePoints);

    // Animate to the route region
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: bounds.center.latitude,
        longitude: bounds.center.longitude,
        latitudeDelta: bounds.span.latitudeDelta,
        longitudeDelta: bounds.span.longitudeDelta
      }, 1000);
    }

    // Close the drawer
    drawerRef.current?.closeDrawer();
  };

  const renderDrawerContent = () => (
    <View style={[styles.drawerContainer, { backgroundColor: theme.color.white }]}>
      <View style={[styles.drawerHeader, { backgroundColor: theme.color.white }]}>
        <Text style={[styles.drawerTitle, { color: theme.color.black }]}>Route Summary</Text>
        <TouchableOpacity 
          style={styles.closeButton} 
          onPress={() => drawerRef.current?.closeDrawer()}
        >
          <MaterialIcons name="close" size={24} color={theme.color.darkPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.routeList}
        contentContainerStyle={styles.routeListContent}
        showsVerticalScrollIndicator={true}
      >
        {(testRouteData as unknown as RouteData[]).map((routeData) => {
          const progress = calculateRouteProgress(routeData);
          const routeColor = generateColorFromValue(routeData.driver.username);
          
          return (
            <TouchableOpacity
              key={routeData.driver.username}
              style={styles.routeItem}
              onPress={() => handleRoutePress(routeData)}
              activeOpacity={0.7}
            >
              <View style={styles.routeHeader}>
                <View style={[styles.driverBadge, { backgroundColor: routeColor }]}>
                  <MaterialIcons name="person" size={20} color="#FFFFFF" />
                </View>
                <Text style={[styles.driverText, { color: theme.color.black }]}>
                  {routeData.driver.username}
                </Text>
              </View>
              
              <View style={styles.progressContainer}>
                <View style={styles.progressBarBackground}>
                  <View 
                    style={[
                      styles.progressBarFill, 
                      { 
                        width: `${progress}%`,
                        backgroundColor: routeColor
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>
                  {Math.round(progress)}% Complete
                </Text>
              </View>

              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <MaterialIcons name="local-shipping" size={20} color={theme.color.darkPrimary} />
                  <Text style={styles.statText}>
                    {routeData.packageSequence.length} Packages
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <MaterialIcons 
                    name="check-circle" 
                    size={20} 
                    color={theme.color.darkPrimary} 
                  />
                  <Text style={styles.statText}>
                    {routeData.packageSequence.filter(pkg => pkg.status === 'delivered').length} Delivered
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
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
          initialRegion={initialRegion}
        >
          {(testRouteData as unknown as RouteData[]).map((zoneData) => {
            const routePoints: Coordinate[] = zoneData.mapRoute.map((point) => ({
              latitude: point[1],
              longitude: point[0],
            }));
            const zoneLocationsArray = zoneLocations.get(zoneData.driver.username) || [];
            const routeColor = generateColorFromValue(zoneData.driver.username);

            return (
              <React.Fragment key={`route-${zoneData.driver.username}-${zoneData.dateOfCreation}`}>
                <Polyline
                  coordinates={routePoints}
                  strokeColor={routeColor}
                  strokeWidth={3}
                />
                {zoneLocationsArray.map((location) => (
                  <Marker
                    key={`marker-${zoneData.driver.username}-${location.package_info.packageID}`}
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
              </React.Fragment>
            );
          })}
        </MapView>

        <TouchableOpacity 
          style={[styles.menuButton, { backgroundColor: theme.color.darkPrimary }]} 
          onPress={() => drawerRef.current?.openDrawer()}
        >
          <MaterialIcons name="menu" size={24} color="#FFFFFF" />
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
  },
  drawerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  routeList: {
    flex: 1,
  },
  routeListContent: {
    padding: 20,
  },
  routeItem: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    marginBottom: 10,
    elevation: 2, // Add elevation for better touch feedback
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  routeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  driverBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  driverText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
    color: '#666',
  },
}); 