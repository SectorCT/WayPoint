import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import MapView, { Polyline, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useTheme } from '@context/ThemeContext';
import { usePosition } from '@context/PositionContext';
import CustomMarker from './CustomMarker';
import useStyles from './styles';

interface Coordinate {
  latitude: number;
  longitude: number;
}

interface Package {
  latitude: number;
  longitude: number;
  status: string;
  packageID: string;
}

interface ZoneData {
  user: string;
  dateOfCreation: string;
  packageSequence: Package[];
  mapRoute: [number, number][];
}

interface RouteMapProps {
  zones: ZoneData[];
  onMapPress?: (zone: ZoneData) => void;
  generateColorFromValue: (value: string) => string;
  mapRef?: React.RefObject<MapView>;
}

const PADDING_MULTIPLIER = 1.5;

export const calculateRouteBounds = (routePoints: Coordinate[]) => {
  if (!routePoints || routePoints.length === 0) {
    return {
      center: { latitude: 0, longitude: 0 },
      span: { latitudeDelta: 0.0922, longitudeDelta: 0.0421 }
    };
  }

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

export default function RouteMap({ zones, onMapPress, generateColorFromValue, mapRef: externalMapRef }: RouteMapProps) {
  const { theme } = useTheme();
  const { position } = usePosition();
  const internalMapRef = useRef<MapView>(null);
  const mapRef = externalMapRef || internalMapRef;
  const styles = useStyles();

  useEffect(() => {
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
  const allLocations = zones.flatMap(zone => 
    zone.packageSequence.map(pkg => ({
      latitude: pkg.latitude,
      longitude: pkg.longitude,
    }))
  );

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

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
      >
        {zones.map((zoneData, index) => {
          const routePoints: Coordinate[] = zoneData.mapRoute.map((point: [number, number]) => ({
            latitude: point[1],
            longitude: point[0],
          }));
          const routeColor = generateColorFromValue(zoneData.user);

          return (
            <React.Fragment key={`route-${zoneData.user}-${zoneData.dateOfCreation}-${index}`}>
              <Polyline
                coordinates={routePoints}
                strokeColor={routeColor}
                strokeWidth={3}
              />
              {zoneData.packageSequence.map((packageInfo, waypointIndex) => (
                <Marker
                  key={`marker-${zoneData.user}-${waypointIndex}`}
                  coordinate={{
                    latitude: packageInfo.latitude,
                    longitude: packageInfo.longitude
                  }}
                  onPress={() => onMapPress?.(zoneData)}
                >
                  <CustomMarker 
                    number={waypointIndex} 
                    isDelivered={packageInfo.status === 'delivered'}
                  />
                </Marker>
              ))}
            </React.Fragment>
          );
        })}
      </MapView>
    </View>
  );
} 