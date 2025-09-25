import React, { useState, useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import MapView, { Marker, MapPressEvent, Region } from "react-native-maps";
import { useLocalSearchParams, router } from "expo-router";
import * as Location from "expo-location";
import { GradientButton } from "@components/basic/gradientButton/gradientButton";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

interface LocationState {
  latitude?: string;
  longitude?: string;
  returnScreen: string;
  [key: string]: string | undefined;
}

export default function PickLocationScreen() {
  const params = useLocalSearchParams<LocationState>();
  const [selectedLocation, setSelectedLocation] = useState<Region>({
    latitude: params.latitude ? Number(params.latitude) : 37.4220,
    longitude: params.longitude ? Number(params.longitude) : -122.0841,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted" && !params.latitude && !params.longitude) {
        const location = await Location.getCurrentPositionAsync({});
        setSelectedLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      }
    })();
  }, []);

  const handleMapPress = (event: MapPressEvent) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedLocation((prev) => ({
      ...prev,
      latitude,
      longitude,
    }));
  };

  const GEOAPIFY_API_KEY = process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY;

  const handleDone = async () => {
    let address = params.address;
    // Fetch address if not present
    if ((!address || address === "") && selectedLocation.latitude && selectedLocation.longitude) {
      try {
        const response = await fetch(
          `https://api.geoapify.com/v1/geocode/reverse?lat=${selectedLocation.latitude}&lon=${selectedLocation.longitude}&lang=bg&format=json&apiKey=${GEOAPIFY_API_KEY}`,
        );
        const data = await response.json();
        if (data.results && data.results[0] && data.results[0].formatted) {
          address = data.results[0].formatted;
        }
      } catch {
        // fallback: leave address blank
      }
    }
    let pathname = "/";
    if (params.returnScreen === "addPackage") pathname = "/addPackage";
    else if (params.returnScreen === "addOffice") pathname = "/addOffice";
    else if (params.returnScreen === "offices") pathname = "/(tabs)/offices";
    router.replace({
      pathname,
      params: {
        ...params,
        latitude: selectedLocation.latitude.toString(),
        longitude: selectedLocation.longitude.toString(),
        address,
      },
    });
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={selectedLocation}
        onPress={handleMapPress}
      >
        <Marker
          coordinate={{
            latitude: selectedLocation.latitude,
            longitude: selectedLocation.longitude,
          }}
        >
          <View style={styles.markerContainer}>
            <View style={styles.markerCircle}>
              <MaterialIcons name="inventory" size={16} color="#FFFFFF" />
            </View>
          </View>
        </Marker>
      </MapView>
      <View style={styles.buttonContainer}>
        <GradientButton title="Confirm Location" onPress={handleDone} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    zIndex: 1, // Ensures button appears above the map
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerCircle: {
    backgroundColor: '#F39358',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

