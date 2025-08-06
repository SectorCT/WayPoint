import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Dimensions, Text, TouchableOpacity, ScrollView, Linking, Alert, ActivityIndicator, Modal } from "react-native";
import MapView, { Polyline, Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { getRoute, markPackageAsDelivered, markPackageAsUndelivered, getReturnRoute, recalculateRoute, getUndeliveredPackagesRoute, saveOfficeDelivery } from "../../utils/journeyApi";
import { usePosition } from "@context/PositionContext";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useTheme } from "@context/ThemeContext";
import { DrawerLayout } from 'react-native-gesture-handler';
import { useAuth } from "@context/AuthContext";
import { makeAuthenticatedRequest } from "@/utils/api";
import House from "@assets/icons/house.svg";
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import SignatureScreen from 'react-native-signature-canvas';

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
  verified: boolean;
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
  route?: any[]; // OSRM route legs with steps
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

// Constants for deviation detection
const DEVIATION_THRESHOLD_METERS = 100; // 100 meters from route
const CHECK_INTERVAL_MS = 10000; // Check every 10 seconds
const MAX_DEVIATION_METERS = 500; // 500 meters - trigger recalculation

// Function to calculate distance between two coordinates in meters
const calculateDistance = (coord1: Coordinate, coord2: Coordinate): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = coord1.latitude * Math.PI / 180;
  const φ2 = coord2.latitude * Math.PI / 180;
  const Δφ = (coord2.latitude - coord1.latitude) * Math.PI / 180;
  const Δλ = (coord2.longitude - coord1.longitude) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
};

// Function to find the closest route point to current position
const findClosestRoutePoint = (currentPos: Coordinate, routePoints: Coordinate[]): { distance: number, index: number } => {
  let minDistance = Infinity;
  let closestIndex = 0;

  routePoints.forEach((point, index) => {
    const distance = calculateDistance(currentPos, point);
    if (distance < minDistance) {
      minDistance = distance;
      closestIndex = index;
    }
  });

  return { distance: minDistance, index: closestIndex };
};

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

const CustomMarker = ({ number, isDelivered, isUndelivered, isWarehouse }: { number: number, isDelivered: boolean, isUndelivered: boolean, isWarehouse?: boolean }) => (
  <View style={
    isWarehouse
      ? undefined
      : [
          styles.markerContainer,
          isDelivered && styles.markerContainerDelivered,
          isUndelivered && styles.markerContainerUndelivered
        ]
  }>
    {isWarehouse ? (
      <House width={24} height={24} />
    ) : isDelivered ? (
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

// Add helper to get all steps from route legs
function getAllStepsFromRoute(route: any[]): any[] {
  if (!route || !Array.isArray(route)) return [];
  let steps: any[] = [];
  for (const leg of route) {
    if (leg.steps && Array.isArray(leg.steps)) {
      steps = steps.concat(leg.steps);
    }
  }
  return steps;
}

// Helper to get icon for maneuver type/modifier
function getManeuverIcon(type: string, modifier: string, theme: any): JSX.Element {
  const iconColor = theme.color.darkPrimary;
  if (type === 'arrive') return <MaterialCommunityIcons name="flag-checkered" size={28} color={iconColor} />;
  if (type === 'depart') return <MaterialCommunityIcons name="car" size={28} color={iconColor} />;
  if (type === 'turn') {
    switch (modifier) {
      case 'left': return <MaterialCommunityIcons name="arrow-left" size={28} color={iconColor} />;
      case 'right': return <MaterialCommunityIcons name="arrow-right" size={28} color={iconColor} />;
      case 'straight': return <MaterialCommunityIcons name="arrow-up" size={28} color={iconColor} />;
      case 'slight left': return <MaterialCommunityIcons name="arrow-top-left" size={28} color={iconColor} />;
      case 'slight right': return <MaterialCommunityIcons name="arrow-top-right" size={28} color={iconColor} />;
      case 'sharp left': return <MaterialCommunityIcons name="arrow-left-bold" size={28} color={iconColor} />;
      case 'sharp right': return <MaterialCommunityIcons name="arrow-right-bold" size={28} color={iconColor} />;
      default: return <MaterialCommunityIcons name="arrow-up" size={28} color={iconColor} />;
    }
  }
  if (type === 'roundabout') return <MaterialCommunityIcons name="rotate-3d-variant" size={28} color={iconColor} />;
  return <MaterialCommunityIcons name="arrow-up" size={28} color={iconColor} />;
}

// Add helper to compute estimate (duration or distance) for full route or next package
function getRouteEstimate(routeSteps: any[], mode: 'full' | 'next'): string | null {
  if (!routeSteps || !routeSteps.length) return null;
  if (mode === 'full') {
    // Sum all durations
    const totalSeconds = routeSteps.reduce((sum, step) => sum + (step.duration || 0), 0);
    if (totalSeconds > 0) {
      const mins = Math.round(totalSeconds / 60);
      return mins < 60 ? `${mins} min` : `${Math.floor(mins / 60)}h ${mins % 60}m`;
    }
  } else {
    // Next mode: show duration for the next step only
    const next = routeSteps[0];
    if (next && next.duration) {
      const mins = Math.round(next.duration / 60);
      return mins < 60 ? `${mins} min` : `${Math.floor(mins / 60)}h ${mins % 60}m`;
    }
  }
  return null;
}

// Helper to offset the map center forward in the direction of travel
function getOffsetCenter(position: Coordinate, offsetMeters = 120, heading = 0): Coordinate {
  // Offset latitude/longitude by offsetMeters in the direction of heading
  // Earth radius in meters
  const R = 6378137;
  const dLat = (offsetMeters * Math.cos((heading * Math.PI) / 180)) / R;
  const dLng = (offsetMeters * Math.sin((heading * Math.PI) / 180)) / (R * Math.cos((position.latitude * Math.PI) / 180));
  return {
    latitude: position.latitude + (dLat * 180) / Math.PI,
    longitude: position.longitude + (dLng * 180) / Math.PI,
  };
}

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
  
  // Deviation detection state
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [lastDeviationCheck, setLastDeviationCheck] = useState<number>(0);
  const [deviationAlertShown, setDeviationAlertShown] = useState(false);
  const deviationCheckIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // Test mode state
  const [isTestModeVisible, setIsTestModeVisible] = useState(false);
  
  // Route view mode state
  const [showFullJourney, setShowFullJourney] = useState(true);
  
  // Add state to track if camera should follow heading
  const [isFollowingHeading, setIsFollowingHeading] = useState(false);
  
  // Add state for steps and next step
  const [routeSteps, setRouteSteps] = useState<any[]>([]);
  const [nextStep, setNextStep] = useState<any | null>(null);
  
  // Add state for undelivered packages functionality
  const [undeliveredPackagesCount, setUndeliveredPackagesCount] = useState(0);
  const [isUndeliveredRouteMode, setIsUndeliveredRouteMode] = useState(false);
  const [undeliveredRouteData, setUndeliveredRouteData] = useState<any>(null);
  
  // Add state for office package details modal
  const [officePackageModalVisible, setOfficePackageModalVisible] = useState(false);
  const [selectedOfficePackages, setSelectedOfficePackages] = useState<any[]>([]);
  const [selectedOfficeName, setSelectedOfficeName] = useState<string>('');
  
  const routeColor = generateColorFromValue(currentZone?.user || '');
  const signatureRef = React.useRef<any>(null);

  // Function to get the next undelivered package
  const getNextDeliveryPoint = (): RouteLocation | null => {
    const undeliveredLocations = locations.filter(
      (location: RouteLocation) => location.package_info.status !== 'delivered' && 
                  location.package_info.status !== 'undelivered' && 
                  location.package_info.packageID !== "ADMIN"
    );
    
    if (undeliveredLocations.length === 0) return null;
    
    // If we have current position, find the closest undelivered package
    if (position.latitude && position.longitude) {
      const currentPos: Coordinate = {
        latitude: position.latitude,
        longitude: position.longitude
      };
      
      let closestLocation = undeliveredLocations[0];
      let minDistance = Infinity;
      
      undeliveredLocations.forEach((location: RouteLocation) => {
        const distance = calculateDistance(currentPos, location);
        if (distance < minDistance) {
          minDistance = distance;
          closestLocation = location;
        }
      });
      
      return closestLocation;
    }
    
    // Otherwise return the first undelivered package
    return undeliveredLocations[0];
  };

  // Function to get route points to next delivery
  const getRouteToNextDelivery = (): Coordinate[] => {
    if (!position.latitude || !position.longitude || !routePoints.length) {
      return routePoints;
    }

    const nextDelivery = getNextDeliveryPoint();
    if (!nextDelivery) {
      return routePoints; // Return full route if no next delivery
    }

    const currentPos: Coordinate = {
      latitude: position.latitude,
      longitude: position.longitude
    };

    // Find the closest point on the current route to our position
    const { index: currentRouteIndex } = findClosestRoutePoint(currentPos, routePoints);
    
    // Find the closest point on the route to the next delivery
    const nextDeliveryPos: Coordinate = {
      latitude: nextDelivery.latitude,
      longitude: nextDelivery.longitude
    };
    const { index: deliveryRouteIndex } = findClosestRoutePoint(nextDeliveryPos, routePoints);

    // Get the route segment from current position to next delivery
    const startIndex = Math.min(currentRouteIndex, deliveryRouteIndex);
    const endIndex = Math.max(currentRouteIndex, deliveryRouteIndex);
    
    // Add current position at the beginning and next delivery at the end
    const routeSegment = routePoints.slice(startIndex, endIndex + 1);
    
    return [currentPos, ...routeSegment, nextDeliveryPos];
  };

  // Function to check for route deviation and recalculate if necessary
  const checkRouteDeviation = async () => {
    if (!position.latitude || !position.longitude || !routePoints.length || isRecalculating || isReturnMode) {
      return;
    }

    const currentPos: Coordinate = {
      latitude: position.latitude,
      longitude: position.longitude
    };

    const { distance } = findClosestRoutePoint(currentPos, routePoints);
    
    // If deviation is significant, recalculate route
    if (distance > MAX_DEVIATION_METERS) {
      if (!deviationAlertShown) {
        Alert.alert(
          "Route Deviation Detected",
          `You are ${distance.toFixed(0)} meters away from your planned route. Recalculating route...`,
          [{ text: "OK" }]
        );
        setDeviationAlertShown(true);
      }

      try {
        setIsRecalculating(true);
        
        if (!user) {
          throw new Error('User not found');
        }

        const result = await recalculateRoute(
          user.username,
          position.latitude,
          position.longitude
        );

        // Update route points with new route
        const newRoutePoints = result.route.map(point => ({
          latitude: point[1], // OSRM returns [lng, lat]
          longitude: point[0]  // OSRM returns [lng, lat]
        }));

        setRoutePoints(newRoutePoints);
        
        // Refresh route data
        const updatedRouteData = await getRoute(user.username);
        setCurrentZone(updatedRouteData);

        Alert.alert(
          "Route Updated",
          `New route calculated with ${result.remaining_packages} remaining deliveries.`,
          [{ text: "OK" }]
        );

        setDeviationAlertShown(false);
      } catch (error) {
        console.error('Error recalculating route:', error);
        Alert.alert(
          "Route Recalculation Failed",
          "Unable to recalculate route. Please continue following the original route.",
          [{ text: "OK" }]
        );
        setDeviationAlertShown(false);
      } finally {
        setIsRecalculating(false);
      }
    } else if (distance > DEVIATION_THRESHOLD_METERS && !deviationAlertShown) {
      // Show warning for minor deviation
      Alert.alert(
        "Route Deviation Warning",
        `You are ${distance.toFixed(0)} meters away from your planned route. Please return to the route.`,
        [{ text: "OK" }]
      );
      setDeviationAlertShown(true);
    } else if (distance <= DEVIATION_THRESHOLD_METERS) {
      // Reset alert flag when back on route
      setDeviationAlertShown(false);
    }
  };

  // Set up periodic deviation checking
  useEffect(() => {
    if (routePoints.length > 0 && !isReturnMode) {
      // Clear any existing interval
      if (deviationCheckIntervalRef.current) {
        clearInterval(deviationCheckIntervalRef.current);
      }

      // Start checking for deviations
      deviationCheckIntervalRef.current = setInterval(() => {
        checkRouteDeviation();
      }, CHECK_INTERVAL_MS);

      // Initial check
      checkRouteDeviation();
    }

    // Cleanup interval on unmount or when route changes
    return () => {
      if (deviationCheckIntervalRef.current) {
        clearInterval(deviationCheckIntervalRef.current);
      }
    };
  }, [routePoints, position.latitude, position.longitude, isReturnMode]);

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

  // Update steps when currentZone changes
  useEffect(() => {
    if (currentZone && currentZone.route && Array.isArray(currentZone.route)) {
      setRouteSteps(getAllStepsFromRoute(currentZone.route));
    } else {
      setRouteSteps([]);
    }
  }, [currentZone]);

  // Update next step as position changes
  useEffect(() => {
    if (!routeSteps.length || !position.latitude || !position.longitude) {
      setNextStep(null);
      return;
    }
    // Find the closest step ahead of the driver
    let minDist = Infinity;
    let closestStep = null;
    for (const step of routeSteps) {
      if (!step.maneuver || !step.maneuver.location) continue;
      const [lng, lat] = step.maneuver.location;
      const dist = calculateDistance(
        { latitude: position.latitude, longitude: position.longitude },
        { latitude: lat, longitude: lng }
      );
      if (dist < minDist && dist > 5) { // ignore steps already passed (within 5m)
        minDist = dist;
        closestStep = { ...step, distanceToManeuver: dist };
      }
    }
    setNextStep(closestStep);
  }, [routeSteps, position.latitude, position.longitude]);

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
      if (!user) {
        throw new Error('User not found');
      }
      const returnRoute = await getReturnRoute(
        position.latitude,
        position.longitude,
        defaultLocation.latitude,
        defaultLocation.longitude,
        user.username
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

  const handleUndeliveredPackagesRoute = async () => {
    try {
      if (!user) {
        throw new Error('User not found');
      }

      // Get undelivered packages route data
      const undeliveredData = await getUndeliveredPackagesRoute(user.username);
      
      if (!undeliveredData.undelivered_offices || undeliveredData.undelivered_offices.length === 0) {
        Alert.alert('No Undelivered Packages', 'There are no undelivered packages to deliver to offices.');
        return;
      }

      // Set undelivered route mode
      setIsUndeliveredRouteMode(true);
      setIsReturnMode(false);
      
      // Clear current route and locations
      setRoutePoints([]);
      setLocations([]);
      
      // Store the undelivered route data
      setUndeliveredRouteData(undeliveredData);
      
      // Create new locations from office data - just list offices without optimization
      const newLocations: RouteLocation[] = [];
      let waypointIndex = 1;
      
      // Just use the offices as they come from the server, no sorting/optimization
      undeliveredData.undelivered_offices.forEach((officeData: any) => {
        const office = officeData.office;
        newLocations.push({
          latitude: office.latitude,
          longitude: office.longitude,
          waypoint_index: waypointIndex,
          package_info: {
            packageID: `OFFICE_${office.id}`,
            status: 'pending' as const,
            weight: 0,
            address: office.address,
            latitude: office.latitude,
            longitude: office.longitude,
            recipient: office.name,
            deliveryDate: new Date().toISOString().split('T')[0],
            recipientPhoneNumber: 'N/A'
          }
        });
        waypointIndex++;
      });
      
      setLocations(newLocations);
      
    } catch (error) {
      console.error('Error getting undelivered packages route:', error);
      Alert.alert(
        'Route Calculation Failed',
        error instanceof Error ? error.message : 'Unable to calculate the undelivered packages route. Please try again.',
        [{ 
          text: 'OK',
          onPress: () => {
            // Reset state on error
            setIsUndeliveredRouteMode(false);
            setUndeliveredRouteData(null);
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

  // Function to count undelivered packages
  const countUndeliveredPackages = () => {
    return locations.filter(
      location => location.package_info.status === 'undelivered' && 
                  location.package_info.packageID !== "ADMIN"
    ).length;
  };

  useEffect(() => {
    // Set drawer ready after initial render
    setIsDrawerReady(true);
  }, []);

  // Update undelivered packages count when locations change
  useEffect(() => {
    const count = countUndeliveredPackages();
    setUndeliveredPackagesCount(count);
  }, [locations]);

  const handleRecenter = () => {
    if (
      mapRef.current &&
      typeof position.latitude === 'number' &&
      typeof position.longitude === 'number'
    ) {
      const offsetCenter = getOffsetCenter(
        { latitude: position.latitude, longitude: position.longitude },
        120,
        position.heading || 0
      );
      mapRef.current.animateCamera({
        center: offsetCenter,
        heading: position.heading || 0,
        pitch: 60, // Tilt the camera to show more in front
        zoom: 18,
      }, { duration: 200 });
      setIsFollowingHeading(true); // Now stays true forever after first click
    }
  };

  useEffect(() => {
    if (!isFollowingHeading) return;
    if (
      mapRef.current &&
      typeof position.latitude === 'number' &&
      typeof position.longitude === 'number' &&
      typeof position.heading === 'number'
    ) {
      const offsetCenter = getOffsetCenter(
        { latitude: position.latitude, longitude: position.longitude },
        120,
        position.heading
      );
      mapRef.current.animateCamera({
        center: offsetCenter,
        heading: position.heading,
        pitch: 60,
        zoom: 18,
      }, { duration: 200 });
    }
  }, [isFollowingHeading, position.heading, position.latitude, position.longitude]);

  const [deliveryModalVisible, setDeliveryModalVisible] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [showSignature, setShowSignature] = useState(false);
  const [isSavingSignature, setIsSavingSignature] = useState(false);
  // Remove signaturePaths, currentPath, panResponder, handleClearSignature

  // SignatureScreen handlers
  const handleSignatureOK = async (signature: string) => {
    if (!selectedPackageId) {
      return;
    }
    // Prevent empty signature submission (check for very short base64 or empty string)
    if (!signature || signature.replace(/^data:image\/png;base64,/, '').length < 100) {
      Alert.alert('Signature Required', 'Please provide a signature before continuing.');
      return;
    }
    setIsSavingSignature(true);
    try {
      const response = await markPackageAsDelivered(selectedPackageId, signature);
      if (!response.ok) {
        throw new Error('Failed to mark package as delivered');
      }
      // Refresh route data after marking as delivered
      if (user) {
        const data = await getRoute(user.username);
        setCurrentZone(data);
      }
      setShowSignature(false);
      setSelectedPackageId(null);
    } catch (error) {
      Alert.alert('Error', 'Failed to save signature and mark as delivered.');
    } finally {
      setIsSavingSignature(false);
    }
  };
  const handleSignatureEmpty = () => {
    // Optionally show a warning or just close
    setShowSignature(false);
    setSelectedPackageId(null);
  };
  const handleSignatureClear = () => {
    // No-op, handled by SignatureScreen
  };
  const handleSignatureBack = () => {
    setShowSignature(false);
    setSelectedPackageId(null);
  };

  const handleOfficeDelivery = async (packageId: string) => {
    try {
      if (!user) {
        throw new Error('User not found');
      }

      const officeIdNumber = parseInt(packageId.replace('OFFICE_', ''));
      
      // Get the office data to find the packages
      const officeData = undeliveredRouteData?.undelivered_offices?.find((office: any) => 
        office.office.id === officeIdNumber
      );
      
      if (!officeData) {
        throw new Error('Office data not found');
      }
      
      // Get package IDs for this office
      const packageIds = officeData.packages.map((pkg: any) => pkg.packageID);
      
      // Save office delivery to server
      await saveOfficeDelivery(user.username, officeIdNumber, packageIds);
      
      console.log(`Office ${packageId} marked as delivered with ${packageIds.length} packages`);
      
      // Remove the office from the locations list
      const updatedLocations = locations.filter(location => 
        location.package_info.packageID !== packageId
      );
      setLocations(updatedLocations);
      
      // If no more offices, exit office delivery mode
      if (updatedLocations.length === 0) {
        setIsUndeliveredRouteMode(false);
        setUndeliveredRouteData(null);
        // Refresh the original route data
        if (user) {
          getRoute(user.username).then(setCurrentZone);
        }
      }
    } catch (error) {
      console.error('Error handling office delivery:', error);
      Alert.alert('Error', 'Failed to mark office as delivered.');
    }
  };

  const handleOfficePackageDetails = (officeId: string) => {
    const officeIdNumber = officeId.replace('OFFICE_', '');
    console.log('Looking for office ID:', officeIdNumber);
    console.log('Available offices:', undeliveredRouteData?.undelivered_offices);
    
    const officeData = undeliveredRouteData?.undelivered_offices?.find((office: any) => 
      office.office.id === parseInt(officeIdNumber)
    );
    
    console.log('Found office data:', officeData);
    
    if (officeData) {
      setSelectedOfficePackages(officeData.packages || []);
      setSelectedOfficeName(officeData.office.name);
      setOfficePackageModalVisible(true);
    }
  };

  const handleDeliveryButton = (packageId: string) => {
    if (isUndeliveredRouteMode) {
      // For office delivery mode, directly mark as delivered
      handleOfficeDelivery(packageId);
    } else {
      // For normal delivery mode, show the modal
      setSelectedPackageId(packageId);
      setDeliveryModalVisible(true);
    }
  };

  // Modified delivery option handler
  const handleDeliveryOption = (option: 'client' | 'smartbox') => {
    setDeliveryModalVisible(false);
    // Do not clear selectedPackageId here, keep it for signature info
    if (option === 'client') {
      setShowSignature(true);
    }
    // In the future, trigger smartbox flow here
  };

  // Remove handleDoneSignature

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

              // Fetch the office assignment for this package from the backend and log it
              try {
                const res = await makeAuthenticatedRequest(`/delivery/packages/${packageId}/`); // TODO: Replace with actual endpoint if needed
                const pkg = await res.json();
                if (pkg.office) {
                  console.log(`Package ${packageId} is now assigned to office: ${pkg.office.name} (ID: ${pkg.office.id})`);
                } else {
                  console.log(`Package ${packageId} is not assigned to any office.`);
                }
              } catch (err) {
                console.log('Could not fetch office assignment for package', packageId, err);
              }
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
              Great job! You've completed all your deliveries for today.
            </Text>
            
            {/* Undelivered Packages Section */}
            {undeliveredPackagesCount > 0 && !isUndeliveredRouteMode && (
              <View style={styles.undeliveredSection}>
                <Text style={[styles.undeliveredMessage, { color: theme.color.black }]}>
                  There are {undeliveredPackagesCount} packages that were not delivered, you should deliver them to the assigned offices.
                </Text>
                <TouchableOpacity 
                  style={[styles.undeliveredRouteButton, { backgroundColor: theme.color.darkPrimary }]}
                  onPress={handleUndeliveredPackagesRoute}
                >
                  <MaterialIcons name="local-shipping" size={24} color="#FFFFFF" />
                  <Text style={[styles.undeliveredRouteText, { color: "#FFFFFF" }]}>
                    Deliver to Offices
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
                {isUndeliveredRouteMode ? (
                  // Show package count for office delivery mode
                  <TouchableOpacity 
                    style={[styles.packageCountButton, { backgroundColor: theme.color.darkPrimary }]}
                    onPress={() => handleOfficePackageDetails(location.package_info.packageID)}
                  >
                    <MaterialIcons name="inventory" size={16} color="#FFFFFF" />
                    <Text style={[styles.packageCountButtonText, { color: '#FFFFFF' }]}>
                      {undeliveredRouteData?.undelivered_offices?.find((office: any) => 
                        office.office.id === parseInt(location.package_info.packageID.replace('OFFICE_', ''))
                      )?.packages?.length || 0} Packages
                    </Text>
                  </TouchableOpacity>
                ) : (
                  // Show "Didn't Deliver" button for normal delivery mode
                  <TouchableOpacity 
                    style={[styles.undeliveredButton, { borderColor: '#FF4136' }]}
                    onPress={() => handleUndelivered(location.package_info.packageID)}
                  >
                    <MaterialIcons name="close" size={16} color="#FF4136" />
                    <Text style={[styles.undeliveredButtonText, { color: '#FF4136' }]}>
                      Didn't Deliver
                    </Text>
                  </TouchableOpacity>
                )}
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
                onPress={() => handleDeliveryButton(location.package_info.packageID)}
              >
                <MaterialIcons name="check" size={20} color={theme.color.darkPrimary} />
                <Text style={[styles.completeButtonText, { color: theme.color.darkPrimary }]}>Mark as Delivered</Text>
              </TouchableOpacity>
            </View>
          ))
        )}


      </ScrollView>
      {/* Delivery Option Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={deliveryModalVisible}
        onRequestClose={() => setDeliveryModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: theme.color.white }]}> 
            <TouchableOpacity onPress={() => setDeliveryModalVisible(false)} style={styles.modalBackButton}>
              <MaterialIcons name="arrow-back" size={24} color={theme.color.darkPrimary} />
              <Text style={{color: theme.color.darkPrimary, marginLeft: 6, fontSize: 16, fontWeight: 'bold'}}>Back</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.color.black, textAlign: 'center', marginTop: 56 }]}>Who is receiving the package?</Text>
            <View style={styles.optionsRow}>
              <TouchableOpacity
                style={[styles.optionButton, { backgroundColor: theme.color.darkPrimary, marginRight: 8 }]}
                onPress={() => handleDeliveryOption('client')}
              >
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold', textAlign: 'center' }}>Client</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.optionButton, { backgroundColor: theme.color.mediumPrimary, marginLeft: 8 }]}
                onPress={() => handleDeliveryOption('smartbox')}
              >
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold', textAlign: 'center' }}>Smartbox</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Office Package Details Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={officePackageModalVisible}
        onRequestClose={() => setOfficePackageModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: theme.color.white }]}> 
            <TouchableOpacity onPress={() => setOfficePackageModalVisible(false)} style={styles.modalBackButton}>
              <MaterialIcons name="arrow-back" size={24} color={theme.color.darkPrimary} />
              <Text style={{color: theme.color.darkPrimary, marginLeft: 6, fontSize: 16, fontWeight: 'bold'}}>Back</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.color.black, textAlign: 'center', marginTop: 56 }]}>
              Packages at {selectedOfficeName}
            </Text>
            <ScrollView style={styles.packageListModal}>
              {selectedOfficePackages.map((pkg: any, index: number) => (
                <View key={pkg.packageID} style={styles.packageItemModal}>
                  <View style={styles.packageHeaderModal}>
                    <View style={[styles.indexBadge, { backgroundColor: theme.color.darkPrimary }]}>
                      <Text style={styles.indexText}>{index + 1}</Text>
                    </View>
                    <Text style={[styles.recipientName, { color: theme.color.black }]}>
                      {pkg.recipient}
                    </Text>
                  </View>
                  <View style={styles.packageDetailsModal}>
                    <Text style={styles.packageDetailText}>Package ID: {pkg.packageID}</Text>
                    <Text style={styles.packageDetailText}>Address: {pkg.address}</Text>
                    <Text style={styles.packageDetailText}>Weight: {pkg.weight} kg</Text>
                    <Text style={styles.packageDetailText}>Phone: {pkg.recipientPhoneNumber}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Signature Modal */}
      <Modal
        animationType="fade"
        transparent={false}
        visible={showSignature}
        onRequestClose={handleSignatureBack}
      >
        <View style={styles.signatureContainer}>
          <TouchableOpacity onPress={handleSignatureBack} style={styles.signatureBackButton}>
            <MaterialIcons name="arrow-back" size={24} color={theme.color.darkPrimary} />
            <Text style={{color: theme.color.darkPrimary, marginLeft: 6, fontSize: 16, fontWeight: 'bold'}}>Back</Text>
          </TouchableOpacity>
          <View style={styles.signatureTitleWrapper}>
            <Text style={[styles.signatureTitle, { color: theme.color.black }]}>Client Signature</Text>
          </View>
          <View style={styles.signaturePadWrapper}>
            <SignatureScreen
              ref={signatureRef}
              backgroundColor="#fff"
              penColor={theme.color.darkPrimary}
              onOK={handleSignatureOK}
              onEmpty={handleSignatureEmpty}
              onClear={handleSignatureClear}
              autoClear={false}
              webStyle={`.m-signature-pad--footer {display: none;}`}
            />
          </View>
          {/* Package Info Card should be above the Done button, not after it */}
          {selectedPackageId && (() => {
            const pkg = (locations || []).find(loc => loc.package_info.packageID === selectedPackageId)?.package_info;
            if (!pkg) return null;
            return (
              <>
                <View style={styles.packageInfoDivider} />
                <View style={styles.packageInfoCard}>
                  <Text style={styles.packageInfoTitle}>Package Information</Text>
                  <View style={styles.packageInfoGroupRow}><Text style={styles.packageInfoLabel}>Recipient:</Text><Text style={styles.packageInfoValue}>{pkg.recipient}</Text></View>
                  <View style={styles.packageInfoGroupRow}><Text style={styles.packageInfoLabel}>Address:</Text><Text style={styles.packageInfoValue}>{pkg.address}</Text></View>
                  <View style={styles.packageInfoGroupRow}><Text style={styles.packageInfoLabel}>Package ID:</Text><Text style={styles.packageInfoValue}>{pkg.packageID}</Text></View>
                  <View style={styles.packageInfoGroupRow}><Text style={styles.packageInfoLabel}>Weight:</Text><Text style={styles.packageInfoValue}>{pkg.weight} kg</Text></View>
                  <View style={styles.packageInfoGroupRow}><Text style={styles.packageInfoLabel}>Delivery Date:</Text><Text style={styles.packageInfoValue}>{pkg.deliveryDate}</Text></View>
                </View>
              </>
            );
          })()}
          <View style={styles.signatureButtonRow}>
            <TouchableOpacity
              style={[styles.signatureButton, { backgroundColor: theme.color.darkPrimary }]}
              onPress={() => {
                if (signatureRef.current) {
                  signatureRef.current.readSignature();
                }
              }}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
        {isSavingSignature && (
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.7)', justifyContent: 'center', alignItems: 'center', zIndex: 10 }}>
            <ActivityIndicator size="large" color={theme.color.darkPrimary} />
          </View>
        )}
      </Modal>
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

  if (user && user.verified === false) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.color.white }}>
        <View style={{ position: 'absolute', top: 48, left: 20 }}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={28} color={theme.color.darkPrimary} />
          </TouchableOpacity>
        </View>
        <MaterialIcons name="error-outline" size={64} color={theme.color.mediumPrimary} />
        <Text style={{ fontSize: 22, fontWeight: 'bold', marginTop: 16, color: theme.color.black }}>
          You need to get verified first
        </Text>
        <Text style={{ fontSize: 16, color: theme.color.lightGrey, marginTop: 8, textAlign: 'center', maxWidth: 300 }}>
          Please wait for your manager to verify your account before you can deliver packages.
        </Text>
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
        {nextStep && (
          <View style={[styles.navigationBox, { backgroundColor: theme.color.white, shadowColor: theme.color.darkPrimary }]}> 
            <View style={[styles.navigationIconBox, { backgroundColor: theme.color.lightPrimary }]}> 
              {getManeuverIcon(nextStep.maneuver.type, nextStep.maneuver.modifier, theme)}
            </View>
            <View style={styles.navigationTextBox}>
              <Text style={[styles.navigationDistance, { color: theme.color.mediumPrimary }]}>{nextStep.distanceToManeuver < 1000 ? `${Math.round(nextStep.distanceToManeuver)} m` : `${(nextStep.distanceToManeuver/1000).toFixed(1)} km`}</Text>
              <Text style={[styles.navigationInstruction, { color: theme.color.darkPrimary }]}> 
                {nextStep.maneuver.type === 'arrive' ? 'Arrive at destination' :
                 nextStep.maneuver.type === 'depart' ? 'Start driving' :
                 nextStep.maneuver.type === 'turn' ? `Turn ${nextStep.maneuver.modifier || ''}` :
                 nextStep.maneuver.type === 'roundabout' ? 'Enter roundabout' :
                 nextStep.maneuver.type === 'merge' ? 'Merge' :
                 nextStep.maneuver.type === 'fork' ? 'Take fork' :
                 nextStep.maneuver.type === 'end of road' ? 'End of road' :
                 nextStep.maneuver.type === 'continue' ? 'Continue' :
                 nextStep.maneuver.type}
              </Text>
              {nextStep.name ? (
                <Text style={[styles.navigationStreet, { color: theme.color.black }]}>Street: {nextStep.name}</Text>
              ) : null}
              {typeof nextStep.waypoint_index === 'number' ? (
                <Text style={[styles.navigationWaypoint, { color: theme.color.lightGrey }]}>Waypoint: {nextStep.waypoint_index + 1}</Text>
              ) : null}
            </View>
            {/* Estimate bubble on the right */}
            {(() => {
              const estimate = getRouteEstimate(routeSteps, showFullJourney ? 'full' : 'next');
              return estimate ? (
                <View style={[styles.estimateBubble, { backgroundColor: theme.color.lightPrimary, borderColor: theme.color.mediumPrimary }]}> 
                  <Text style={[styles.estimateBubbleText, { color: theme.color.darkPrimary }]}>⏱ {estimate}</Text>
                </View>
              ) : null;
            })()}
          </View>
        )}
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
          onPanDrag={() => setIsFollowingHeading(false)}
        >
          {!isReturnMode && !isUndeliveredRouteMode && (
            <Polyline
              coordinates={showFullJourney ? routePoints : getRouteToNextDelivery()}
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

          {!isReturnMode && !isUndeliveredRouteMode && locations.map((location) => (
            <Marker
              key={`marker-${location.package_info.packageID}-${location.waypoint_index}`}
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude
              }}
            >
              <CustomMarker 
                number={location.waypoint_index} 
                isDelivered={location.package_info.status === 'delivered'}
                isUndelivered={location.package_info.status === 'undelivered'}
                isWarehouse={location.package_info.packageID === "ADMIN"}
              />
            </Marker>
          ))}



          {isReturnMode && locations.filter(loc => loc.package_info.packageID === "ADMIN").map((location) => (
            <Marker
              key={`marker-${location.package_info.packageID}-${location.waypoint_index}`}
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude
              }}
            >
              <CustomMarker 
                number={location.waypoint_index} 
                isDelivered={location.package_info.status === 'delivered'}
                isUndelivered={location.package_info.status === 'undelivered'}
                isWarehouse={true}
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

        {/* Route View Mode Switch */}
        <View style={[styles.routeModeSwitch, { backgroundColor: theme.color.white }]}>
          <TouchableOpacity 
            style={[
              styles.switchOption, 
              styles.switchOptionLeft,
              { 
                backgroundColor: showFullJourney ? theme.color.darkPrimary : 'transparent',
                borderColor: theme.color.darkPrimary
              }
            ]}
            onPress={() => setShowFullJourney(true)}
          >
            <MaterialIcons 
              name="timeline" 
              size={14} 
              color={showFullJourney ? "#FFFFFF" : theme.color.darkPrimary} 
            />
            <Text style={[
              styles.switchText, 
              { color: showFullJourney ? "#FFFFFF" : theme.color.darkPrimary }
            ]}>
              Full
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.switchOption, 
              styles.switchOptionRight,
              { 
                backgroundColor: !showFullJourney ? theme.color.darkPrimary : 'transparent',
                borderColor: theme.color.darkPrimary
              }
            ]}
            onPress={() => setShowFullJourney(false)}
          >
            <MaterialIcons 
              name="navigation" 
              size={14} 
              color={!showFullJourney ? "#FFFFFF" : theme.color.darkPrimary} 
            />
            <Text style={[
              styles.switchText, 
              { color: !showFullJourney ? "#FFFFFF" : theme.color.darkPrimary }
            ]}>
              Next
            </Text>
          </TouchableOpacity>
        </View>

        {/* Route recalculation indicator */}
        {isRecalculating && (
          <View style={[styles.recalculationIndicator, { backgroundColor: theme.color.darkPrimary }]}>
            <ActivityIndicator size="small" color="#FFFFFF" />
            <Text style={styles.recalculationText}>Recalculating Route...</Text>
          </View>
        )}

        {/* Route Mode Indicator */}
        {!showFullJourney && !isReturnMode && !isUndeliveredRouteMode && (
          <View style={[styles.routeModeIndicator, { backgroundColor: '#666666' }]}>
            <MaterialIcons name="navigation" size={14} color="#FFFFFF" />
            <Text style={styles.routeModeIndicatorText}>
              {getNextDeliveryPoint() ? `Next: ${getNextDeliveryPoint()?.package_info.recipient}` : 'No more deliveries'}
            </Text>
          </View>
        )}


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
    paddingTop: 50, // Add extra top padding to move header down
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
  undeliveredSection: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFEAA7',
  },
  undeliveredMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 20,
  },
  undeliveredRouteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  undeliveredRouteText: {
    fontSize: 16,
    fontWeight: '600',
  },
  packageCountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
  },
  packageCountButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  packageListModal: {
    maxHeight: 400,
    marginTop: 20,
  },
  packageItemModal: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    marginBottom: 10,
  },
  packageHeaderModal: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  packageDetailsModal: {
    marginTop: 8,
  },
  packageDetailText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  recalculationIndicator: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recalculationText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  routeModeSwitch: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    width: 120,
    height: 40,
    borderRadius: 20,
    flexDirection: 'row',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  switchOption: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 20,
    flexDirection: 'row',
    gap: 4,
  },
  switchOptionLeft: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    borderRightWidth: 0,
  },
  switchOptionRight: {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    borderLeftWidth: 0,
  },
  switchText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  routeModeIndicator: {
    position: 'absolute',
    top: 50,
    left: 100,
    right: 100,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  routeModeIndicatorText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  navigationBox: {
    position: 'absolute',
    top: 120, // More space from the top
    left: '5%',
    right: '5%',
    zIndex: 10,
    backgroundColor: '#fff', // will be overridden by theme
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 28,
    borderRadius: 18,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 8,
    minHeight: 80,
    maxWidth: 420,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#F8D5B0', // fallback, will be overridden by theme
  },
  navigationIconBox: {
    marginRight: 24,
    justifyContent: 'center',
    alignItems: 'center',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F8D5B0', // will be overridden by theme
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 2,
    elevation: 2,
  },
  navigationTextBox: {
    flex: 1,
    justifyContent: 'center',
  },
  navigationDistance: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#F39358', // will be overridden by theme
    marginBottom: 2,
  },
  navigationInstruction: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F05033', // will be overridden by theme
    marginBottom: 1,
  },
  navigationStreet: {
    fontSize: 16,
    color: '#000', // will be overridden by theme
  },
  navigationEstimate: {
    fontSize: 14,
    color: '#B2B2B2', // will be overridden by theme
    marginTop: 2,
  },
  estimateBubble: {
    marginLeft: 12,
    alignSelf: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    backgroundColor: 'rgba(248,213,176,0.7)', // lighter, more subtle
    borderWidth: 1,
    borderColor: '#F8D5B0', // lighter border
    minWidth: 48,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 1,
    elevation: 1,
  },
  estimateBubbleText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#F05033', // will be overridden by theme
  },
  navigationWaypoint: {
    fontSize: 14,
    color: '#B2B2B2', // will be overridden by theme
    marginTop: 2,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    borderRadius: 10,
    padding: 24,
    maxHeight: '80%',
    alignItems: 'center',
    position: 'relative',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    width: '100%',
  },
  optionButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
    width: '100%',
  },
  modalBackButton: {
    position: 'absolute',
    top: 12,
    left: 12,
    zIndex: 2,
    padding: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  signatureContainer: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 90,
    paddingHorizontal: 20,
  },
  signatureTitleWrapper: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  signatureBackButton: {
    position: 'absolute',
    top: 56,
    left: 16,
    zIndex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
  },
  signatureTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  signaturePadWrapper: {
    width: '100%',
    height: 320,
    borderWidth: 2,
    borderColor: '#eee',
    borderRadius: 12,
    backgroundColor: '#fff',
    marginBottom: 32,
    overflow: 'hidden',
  },
  signatureButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 12,
    gap: 16,
  },
  signatureButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  packageInfoBox: {
    width: '100%',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    marginTop: 8,
    alignItems: 'flex-start',
  },
  packageInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  packageInfoRow: {
    fontSize: 14,
    marginBottom: 4,
    color: '#222',
  },
  packageInfoLabel: {
    fontWeight: 'bold',
    color: '#444',
  },
  packageInfoDivider: {
    width: '100%',
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 8,
  },
  packageInfoCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  packageInfoGroupRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  packageInfoValue: {
    color: '#222',
    fontSize: 14,
    flex: 2,
    textAlign: 'right',
    marginLeft: 8,
  },
}); 