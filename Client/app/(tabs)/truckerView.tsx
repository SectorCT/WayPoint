import React, { useEffect } from "react";
import { View, StyleSheet, Dimensions, Text } from "react-native";
import MapView, { Polyline, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { testRouteData } from "../../testRouteData";
import { usePosition } from "@context/PositionContext";
import { MaterialIcons } from "@expo/vector-icons";

interface Coordinate {
  latitude: number;
  longitude: number;
}

interface RouteData {
  zone: number;
  routes: {
    waypoint_index: number;
    route: [number, number][];
    location: [number, number];
    duration: number;
  }[];
}

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

const CustomMarker = ({ number }: { number: number }) => (
  <View style={styles.markerContainer}>
    <Text style={styles.markerText}>{number}</Text>
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
  const currentZone = testRouteData[0] as RouteData;
  const routeColor = generateColorFromValue(currentZone.zone);
  const { position } = usePosition();
  
  // Extract locations from route data (using the location property from each route)
  const locations: Coordinate[] = currentZone.routes.map((route) => ({
    latitude: route.location[1],
    longitude: route.location[0]
  }));

  // Extract route points from all routes
  const routePoints: Coordinate[] = currentZone.routes.flatMap(route => 
    route.route.map((point: [number, number]) => ({
      latitude: point[1],
      longitude: point[0]
    }))
  );

  // Calculate initial region from first location
  const initialRegion = {
    latitude: locations[0].latitude,
    longitude: locations[0].longitude,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
      >
        {/* Draw the route line */}
        <Polyline
          coordinates={routePoints}
          strokeColor={routeColor}
          strokeWidth={3}
        />

        {/* Mark each location */}
        {currentZone.routes.map((route) => (
          <Marker
            key={route.waypoint_index}
            coordinate={{
              latitude: route.location[1],
              longitude: route.location[0]
            }}
          >
            <CustomMarker number={route.waypoint_index} />
          </Marker>
        ))}

        {/* Show current position */}
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
    </View>
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
}); 