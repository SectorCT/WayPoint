import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Dimensions, Text, TouchableOpacity, ScrollView, Linking, Alert, ActivityIndicator } from "react-native";
import MapView, { Polyline, Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { getRoute, markPackageAsDelivered, markPackageAsUndelivered, getReturnRoute } from "../../utils/journeyApi";
import { usePosition } from "@context/PositionContext";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useTheme } from "@context/ThemeContext";
import { DrawerLayout } from 'react-native-gesture-handler';
import { useAuth } from "@context/AuthContext";
import { makeAuthenticatedRequest } from "@/utils/api";

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
  status: "pending" | "in_transit" | "delivered" | "undelivered";
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

interface Theme {
  color: {
    white: string;
    black: string;
    mediumPrimary: string;
    darkPrimary: string;
    lightPrimary: string;
    lightGrey: string;
    error: string;
  };
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

const CustomMarker = ({ number, isDelivered, isUndelivered }: { number: number, isDelivered: boolean, isUndelivered: boolean }) => (
  <View style={[
    styles.markerContainer,
    isDelivered && styles.markerContainerDelivered,
    isUndelivered && styles.markerContainerUndelivered
  ]}>
    {isDelivered ? (
      <MaterialIcons name="check" size={20} color="#4CAF50" />
    ) : isUndelivered ? (
      <MaterialIcons name="close" size={20} color="#FF4136" />
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
  const [isReturning, setIsReturning] = useState(false);
  const [routePoints, setRoutePoints] = useState<Coordinate[]>([]);
  const [isReturnMode, setIsReturnMode] = useState(false);
  
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
        status: packageInfo.packageID === "ADMIN" ? "delivered" : packageInfo.status
      }
    }));
    setLocations(newLocations);
  }, [currentZone]);

  useEffect(() => {
    if (!currentZone?.mapRoute) {
      return;
    }

    const allPackagesCompleted = locations.every(
      location => location.package_info.status === 'delivered' || 
                 location.package_info.status === 'undelivered' ||
                 location.package_info.packageID === "ADMIN"
    );

    const baseRoutePoints = currentZone.mapRoute.map((point) => ({
      latitude: point[1],
      longitude: point[0],
    }));

    if (allPackagesCompleted && !isReturning) {
      setIsReturning(true);
      if (baseRoutePoints.length > 0) {
        setRoutePoints([...baseRoutePoints, baseRoutePoints[0]]);
      }
    } else if (!allPackagesCompleted) {
      setRoutePoints(baseRoutePoints);
      setIsReturning(false);
    }
  }, [currentZone?.mapRoute, locations, isReturning]);

  const handleReturnRoute = async () => {
    try {
      setIsReturnMode(true);
      // Close the drawer
      drawerRef.current?.closeDrawer();
      
      // Keep only the default location (ADMIN package)
      const defaultLocation = locations.find(loc => loc.package_info.packageID === "ADMIN");
      if (!defaultLocation || !position.latitude || !position.longitude) {
        throw new Error('Missing location data');
      }

      setLocations([defaultLocation]);
      
      // Get the return route from current position to default location
      const returnRoute = await getReturnRoute(
        position.latitude,
        position.longitude,
        defaultLocation.latitude,
        defaultLocation.longitude
      );
      
      if (!returnRoute || !Array.isArray(returnRoute) || returnRoute.length === 0) {
        throw new Error('Invalid route data received from OSRM');
      }

      // Convert the route coordinates to the format expected by the map
      // OSRM returns coordinates in [longitude, latitude] format
      const routePoints = returnRoute.map(point => {
        if (!Array.isArray(point) || point.length !== 2) {
          throw new Error('Invalid coordinate format in route data');
        }
        return {
          latitude: point[1],  // OSRM returns [lng, lat]
          longitude: point[0]  // OSRM returns [lng, lat]
        };
      });
      
      if (routePoints.length < 2) {
        throw new Error('Route must contain at least 2 points');
      }

      // Only keep the route points from current position to default location
      // Remove any points that would create a return path
      const directRoutePoints = routePoints.slice(0, Math.ceil(routePoints.length / 2));
      setRoutePoints(directRoutePoints);
      
      // Center the map on the route
      if (mapRef.current && directRoutePoints.length > 0) {
        const bounds = directRoutePoints.reduce((acc, point) => ({
          minLat: Math.min(acc.minLat, point.latitude),
          maxLat: Math.max(acc.maxLat, point.latitude),
          minLng: Math.min(acc.minLng, point.longitude),
          maxLng: Math.max(acc.maxLng, point.longitude)
        }), {
          minLat: directRoutePoints[0].latitude,
          maxLat: directRoutePoints[0].latitude,
          minLng: directRoutePoints[0].longitude,
          maxLng: directRoutePoints[0].longitude
        });

        const center = {
          latitude: (bounds.minLat + bounds.maxLat) / 2,
          longitude: (bounds.minLng + bounds.maxLng) / 2
        };

        const span = {
          latitudeDelta: (bounds.maxLat - bounds.minLat) * 1.5,
          longitudeDelta: (bounds.maxLng - bounds.minLng) * 1.5
        };

        mapRef.current.animateToRegion({
          ...center,
          ...span
        }, 1000);
      }
    } catch (error) {
      console.error('Error getting return route:', error);
      // Show error message to user
      Alert.alert(
        'Route Calculation Failed',
        error instanceof Error ? error.message : 'Unable to calculate the return route. Please try again.',
        [{ 
          text: 'OK',
          onPress: () => {
            // Reset state on error
            setRoutePoints([]);
            setIsReturnMode(false);
          }
        }]
      );
    }
  };

  const activeLocations = locations.filter(
    location => location.package_info.status !== 'delivered' && 
                location.package_info.status !== 'undelivered' && 
                location.package_info.packageID !== "ADMIN"
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

  const handleUndelivered = async (packageId: string) => {
    Alert.alert(
      "Mark as Undelivered",
      "Are you sure you want to continue with the other packages?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Continue",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await markPackageAsUndelivered(packageId);

              if (!response.ok) {
                console.error('Failed to mark package as undelivered:', response);
              }

              // Update the status of the package in locations
              const updatedLocations = locations.map(location => 
                location.package_info.packageID === packageId 
                  ? { 
                      ...location, 
                      package_info: { 
                        ...location.package_info, 
                        status: 'undelivered' as const 
                      } 
                    }
                  : location
              );
              setLocations(updatedLocations);
              
            } catch (error) {
              console.error('Error marking package as undelivered:', error);
            }
          }
        }
      ]
    );
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
              {isReturning ? 
                "Great job! Now return to the starting point to complete your journey." :
                "Great job! You've completed all your deliveries for today."}
            </Text>
            {isReturning && (
              <View style={styles.returnRouteContainer}>
                <TouchableOpacity 
                  style={styles.returnRouteButton}
                  onPress={handleReturnRoute}
                >
                  <MaterialIcons name="directions" size={24} color={theme.color.darkPrimary} />
                  <Text style={[styles.returnRouteText, { color: theme.color.darkPrimary }]}>
                    Return Route Active
                  </Text>
                </TouchableOpacity>
              </View>
            )}
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
                <TouchableOpacity 
                  style={[styles.undeliveredButton, { borderColor: '#FF4136' }]}
                  onPress={() => handleUndelivered(location.package_info.packageID)}
                >
                  <MaterialIcons name="close" size={16} color="#FF4136" />
                  <Text style={[styles.undeliveredButtonText, { color: '#FF4136' }]}>
                    Didn't Deliver
                  </Text>
                </TouchableOpacity>
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
          {!isReturnMode && (
            <Polyline
              coordinates={routePoints}
              strokeColor={routeColor}
              strokeWidth={3}
            />
          )}

          {isReturnMode && routePoints.length > 0 && (
            <Polyline
              coordinates={routePoints}
              strokeColor="#0074D9"
              strokeWidth={3}
            />
          )}

          {!isReturnMode && locations.map((location) => (
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
                isUndelivered={location.package_info.status === 'undelivered'}
              />
            </Marker>
          ))}

          {isReturnMode && locations.filter(loc => loc.package_info.packageID === "ADMIN").map((location) => (
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
                isUndelivered={location.package_info.status === 'undelivered'}
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
          style={[styles.logoutButton, { backgroundColor: theme.color.darkPrimary }]} 
          onPress={logout}
        >
          <MaterialIcons name="logout" size={24} color="#FFFFFF" />
        </TouchableOpacity>

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
  markerContainerUndelivered: {
    borderColor: '#FF4136',
    backgroundColor: '#FFEBEE',
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
    justifyContent: 'space-between',
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
    flex: 1,
    marginRight: 8,
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
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginHorizontal: 20,
  },
  logoutButton: {
    position: 'absolute',
    top: 40,
    left: 20,
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
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    gap: 10,
  },
  undeliveredButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    borderRadius: 6,
    borderWidth: 1,
    gap: 4,
  },
  undeliveredButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  returnRouteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    gap: 8,
  },
  returnRouteText: {
    fontSize: 16,
    fontWeight: '500',
  },
  returnRouteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
}); 