import React, { useState, useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import MapView, { Marker, MapPressEvent, Region } from "react-native-maps";
import { useLocalSearchParams, router } from "expo-router";
import * as Location from "expo-location";
import { GradientButton } from "@components/basic/gradientButton/gradientButton";

interface LocationState {
  latitude?: string;
  longitude?: string;
  returnScreen: string;
  [key: string]: any;
}

export default function PickLocationScreen() {
  const params = useLocalSearchParams<LocationState>();
  const [selectedLocation, setSelectedLocation] = useState<Region>({
    latitude: params.latitude ? Number(params.latitude) : 42.6977,
    longitude: params.longitude ? Number(params.longitude) : 23.3219,
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

  const handleDone = () => {
    // Return to the previous screen with all the original state plus the new location
    const pathname = params.returnScreen === "addPackage" ? "/addPackage" : "/";
    router.replace({
      pathname,
      params: {
        ...params,
        latitude: selectedLocation.latitude.toString(),
        longitude: selectedLocation.longitude.toString(),
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
          pinColor="#F39358"
        />
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
});

