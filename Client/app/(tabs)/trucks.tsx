import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { useTheme } from "@context/ThemeContext";
import { makeAuthenticatedRequest } from "../../utils/api";
import useStyles from "./styles/trucksStyles";
import { router } from "expo-router";
import AddButton from "@/components/basic/addButton/addButton";
import { SafeAreaProvider } from "react-native-safe-area-context";

interface Truck {
  capacity: number;
  licensePlate: string;
}

const exampleData: Truck[] = [
  {
    capacity: 100,
    licensePlate: "ABC123",
  },
  {
    capacity: 200,
    licensePlate: "DEF456",
  },
  {
    capacity: 300,
    licensePlate: "GHI789",
  },
];
import moment from "moment";
import TruckModule from "@/components/listModule/truckModule/truckModule";

export default function TrucksScreen() {
  const { theme } = useTheme();
  const [packages, setPackages] = useState<Truck[]>([]);
  const [loading, setLoading] = useState(false);
  const styles = useStyles();

  // useEffect(() => {
  //   fetchPackages();
  // }, []);

  // const fetchPackages = async () => {
  //   try {
  //     const response = await makeAuthenticatedRequest("/delivery/trucks/", {
  //       method: "GET",
  //     });
  //     const data = await response.json();
  //     setPackages(data.packages); // Accessing "packages" array
  //   } catch (error) {
  //     console.error("Error fetching packages:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  //
  const colorArray = ["#F39358", "#F35872"];
  const licensePlateToColor = new Map<string, string>();

  exampleData.forEach((truck, index) => {
    licensePlateToColor.set(
      truck.licensePlate,
      colorArray[index % colorArray.length],
    );
  });

  return (
    <View style={styles.outer}>
      <View style={styles.topFill} />
      <SafeAreaView style={styles.container}>
        <View style={styles.inner}>
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Add your trucks</Text>
            <AddButton
              onPress={() => router.navigate("/addPackage")}
              style={{ marginRight: 0 }}
            />
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={theme.color.mediumPrimary} />
          ) : (
            <FlatList
              data={exampleData}
              keyExtractor={(pkg) => pkg.licensePlate}
              renderItem={({ item }) => (
                <TruckModule
                  licensePlate={item.licensePlate}
                  color={
                    licensePlateToColor.get(item.licensePlate) ??
                    theme.color.black
                  }
                  capacity={item.capacity}
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
