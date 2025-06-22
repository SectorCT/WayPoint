import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { useTheme } from "@context/ThemeContext";
import { getAvailableTrucks } from "../../utils/journeyApi";
import useStyles from "./styles/trucksStyles";
import { router } from "expo-router";
import AddButton from "@/components/basic/addButton/addButton";
import { generateColorFromString } from "@/utils/colors";

import TruckModule from "@/components/listModule/truckModule/truckModule";

export default function TrucksScreen() {
  const { theme } = useTheme();
  const [packages, setPackages] = useState<Truck[]>([]);
  const [loading, setLoading] = useState(true);
  const styles = useStyles();

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const data = await getAvailableTrucks();
      setPackages(data);
    } catch (error) {
      console.error("Error fetching packages:", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <View style={styles.outer}>
      <View style={styles.topFill} />
      <SafeAreaView style={styles.container}>
        <View style={styles.inner}>
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Add your trucks</Text>
            <AddButton
              onPress={() => router.navigate("/addTruck")}
              style={{ marginRight: 0 }}
            />
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={theme.color.mediumPrimary} />
          ) : (
            <FlatList
              data={packages}
              keyExtractor={(pkg) => pkg.licensePlate}
              renderItem={({ item }) => (
                <TruckModule
                  licensePlate={item.licensePlate}
                  color={generateColorFromString(item.licensePlate)}
                  capacity={item.kilogramCapacity}
                  isUsed={item.isUsed}
                  onDelete={() => {
                    // Refresh the trucks list after deletion
                    fetchPackages();
                  }}
                />
              )}
              contentContainerStyle={{
                paddingBottom: 20,
                gap: 12,
                paddingTop: 14,
              }}
              style={{ paddingHorizontal: 20, height: "100%" }}
            />
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}
