import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@context/ThemeContext";
import { router, Tabs } from "expo-router";
import { GradientButton } from "@components/basic/gradientButton/gradientButton";
import { MaterialIcons } from "@expo/vector-icons";

export default function HomeScreen() {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={[styles.headerTitle, { color: theme.color.black }]}>
          Home
        </Text>
        <Text style={[styles.headerSubtitle, { color: "rgba(0, 0, 0, 0.6)" }]}>
          Manage your deliveries
        </Text>
      </View>

      <View style={styles.actionContainer}>
        <GradientButton 
          title="Add New Package" 
          onPress={() => router.push("/addPackage")}
        />
        <View style={styles.buttonSpacing} />
        <GradientButton 
          title="Add New Truck" 
          onPress={() => router.push("/addTruck")}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#FFFFFF",
  },
  headerContainer: {
    marginTop: 20,
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  actionContainer: {
    marginTop: 16,
  },
  buttonSpacing: {
    height: 16,
  },
});
