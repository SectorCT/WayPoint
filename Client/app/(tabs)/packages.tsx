import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { useTheme } from "@context/ThemeContext";
import { makeAuthenticatedRequest } from "../../utils/api";
import useStyles from "./styles/packageStyles";
import { router } from "expo-router";
import AddButton from "@/components/basic/addButton/addButton";

interface Package {
  id: string;
  recipientName: string;
  status: "pending" | "in_transit" | "delivered";
  createdAt: string;
}

import PackageModule from "@components/listModule/packageModule/packageModule";

export default function PackagesScreen() {
  const { theme } = useTheme();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const response = await makeAuthenticatedRequest("/delivery/packages/", {
        method: "GET",
      });
      const data = await response.json();
      setPackages(data);
    } catch (error) {
      console.error("Error fetching packages:", error);
    } finally {
      setLoading(false);
    }
  };
  const styles = useStyles();

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Add your packages</Text>
        </View>
        <AddButton
          onPress={() => router.navigate("/addPackage")}
          style={{
            marginRight: 0,
          }}
        />
      </View>
      <PackageModule />
    </View>
  );
}

const styles = StyleSheet.create({});
