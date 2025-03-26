import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, Linking, Platform } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@context/ThemeContext";
import { usePosition } from "@context/PositionContext";
import { DrawerLayout } from 'react-native-gesture-handler';
import { getAllRoutes, getUserByUsername } from "../../utils/journeyApi";
import { useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import useStyles from "./adminTruckTracker.styles";
import moment from "moment";
import RouteDrawer from "@/components/drawer/RouteDrawer";
import RouteMap, { calculateRouteBounds } from "@/components/map/RouteMap";

interface RouteData {
  user: string;
  dateOfCreation: string;
  packageSequence: any[];
  mapRoute: [number, number][];
  isActive?: boolean;
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

export default function AdminTruckTrackerScreen() {
  const { theme } = useTheme();
  const { position } = usePosition();
  const drawerRef = useRef<DrawerLayout>(null);
  const [routeData, setRouteData] = useState<RouteData[]>([]);
  const [userData, setUserData] = useState<Map<string, any>>(new Map());
  const params = useLocalSearchParams<{ routes?: string }>();
  const styles = useStyles();
  const mapRef = useRef<any>(null);

  useEffect(() => {
    const initializeRouteData = async () => {
      try {
        let routes: RouteData[];
        
        if (params.routes) {
          routes = JSON.parse(params.routes as string);
        } else {
          routes = await getAllRoutes();
        }

        // Deduplicate routes based on user and date
        const uniqueRoutes = routes.reduce((acc, route) => {
          const key = `${route.user}-${route.dateOfCreation}`;
          if (!acc.has(key)) {
            acc.set(key, route);
          }
          return acc;
        }, new Map<string, RouteData>());

        const deduplicatedRoutes = Array.from(uniqueRoutes.values());
        setRouteData(deduplicatedRoutes);
        
        // Initialize user data
        const newUserData = new Map<string, any>();
        const processedUsers = new Set<string>();
        
        // Fetch user data for each unique route
        for (const zoneData of deduplicatedRoutes) {
          if (!zoneData.packageSequence) {
            console.error('Invalid zone data - missing packageSequence:', zoneData);
            continue;
          }

          // Only process each user once
          if (!processedUsers.has(zoneData.user)) {
            try {
              const user = await getUserByUsername(zoneData.user);
              newUserData.set(zoneData.user, user);
              processedUsers.add(zoneData.user);
            } catch (error) {
              console.error(`Error fetching user data for ${zoneData.user}:`, error);
              continue;
            }
          }
        }

        setUserData(newUserData);
      } catch (error) {
        console.error('Error initializing route data:', error);
      }
    };

    initializeRouteData();
  }, [params.routes]);

  const handleRoutePress = (routeData: RouteData) => {
    if (!routeData || !routeData.mapRoute || !routeData.packageSequence) {
      console.error('Invalid route data:', routeData);
      return;
    }

    // Convert route points to coordinates
    const routePoints = routeData.mapRoute.map((point: [number, number]) => ({
      latitude: point[1],
      longitude: point[0],
    }));

    // Calculate bounds for the route
    const bounds = calculateRouteBounds(routePoints);

    // Animate the map to show the entire route
    if (mapRef.current) {
      mapRef.current.animateCamera({
        center: bounds.center,
        zoom: 12, // Adjust this value to control the zoom level
      }, { duration: 1000 }); // 1 second animation
    }

    drawerRef.current?.closeDrawer();
  };

  const handleDrawerOpen = () => {
    if (drawerRef.current) {
      drawerRef.current.openDrawer();
    }
  };

  return (
    <RouteDrawer
      drawerRef={drawerRef}
      routeData={routeData}
      userData={userData}
      generateColorFromValue={generateColorFromValue}
      onRoutePress={handleRoutePress}
    >
      <View style={styles.container}>
        <RouteMap
          zones={routeData}
          onMapPress={handleRoutePress}
          generateColorFromValue={generateColorFromValue}
          mapRef={mapRef}
        />
        <TouchableOpacity
          style={styles.menuButton}
          onPress={handleDrawerOpen}
        >
          <LinearGradient
            colors={[theme.color.mediumPrimary, theme.color.darkPrimary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.menuButtonGradient}
          >
            <MaterialIcons name="menu" size={24} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </RouteDrawer>
  );
} 