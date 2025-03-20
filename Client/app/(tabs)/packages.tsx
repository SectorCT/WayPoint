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
import useStyles from "./styles/packageStyles";
import { router } from "expo-router";
import AddButton from "@/components/basic/addButton/addButton";
import PackageModule from "@components/listModule/packageModule/packageModule";
import { SafeAreaProvider } from "react-native-safe-area-context";

interface Package {
  address: string;
  latitude: number;
  longitude: number;
  recipient: string;
  recipientPhoneNumber: string;
  deliveryDate: string;
  weight: number;
  status: "pending" | "in_transit" | "delivered";
}

const exampleData: Package[] = [
  {
    address: "221B Baker Street, London",
    latitude: 51.5237,
    longitude: -0.1585,
    recipient: "Sherlock Holmes",
    recipientPhoneNumber: "0777123456",
    deliveryDate: "2025-04-01",
    weight: 2.5,
    status: "pending",
  },
  {
    address: "1600 Pennsylvania Avenue NW, Washington, DC",
    latitude: 38.8977,
    longitude: -77.0365,
    recipient: "Joe Biden",
    recipientPhoneNumber: "2024561111",
    deliveryDate: "2025-04-02",
    weight: 3.2,
    status: "in_transit",
  },
  {
    address: "1 Infinite Loop, Cupertino, CA",
    latitude: 37.3318,
    longitude: -122.0312,
    recipient: "Tim Cook",
    recipientPhoneNumber: "4089961010",
    deliveryDate: "2025-04-03",
    weight: 1.8,
    status: "delivered",
  },
];

export default function PackagesScreen() {
  const { theme } = useTheme();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const styles = useStyles();

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const response = await makeAuthenticatedRequest("/delivery/packages/", {
        method: "GET",
      });
      const data = await response.json();
      setPackages(data.packages); // Accessing "packages" array
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
            <Text style={styles.title}>Add your packages</Text>
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
                keyExtractor={(item) => item.address} // Unique key per item
                renderItem={({ item }) => (
                  <PackageModule
                    id={item.address} // Using address as a unique identifier
                    location={item.address}
                    phoneNumber={item.recipientPhoneNumber}
                  />
                )}
                contentContainerStyle={{
                  paddingBottom: 20,
                  overflow: "visible",
                  gap: 15,
                }}
                style={{ overflow: "visible", padding: 20 }}
              />
            )}
        </View>
      </SafeAreaView>
    </View>
  );
}
