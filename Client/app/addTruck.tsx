import React, { useState } from "react";
import { View, Text, Alert, StyleSheet, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { useTheme } from "@context/ThemeContext";
import { FormField } from "../components/basic/FormField";
import { GradientButton } from "@components/basic/gradientButton/gradientButton";
import { makeAuthenticatedRequest } from "../utils/api";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

interface TruckState {
  licensePlate: string;
  maxCapacity: string;
}

export default function AddTruckScreen() {
  const { theme } = useTheme();

  const [formState, setFormState] = useState<TruckState>({
    licensePlate: "",
    maxCapacity: "",
  });

  const handleSubmit = async () => {
    try {
      // Format numeric values to 6 decimal places
      const formattedMaxCapacity = parseFloat(
        formState.maxCapacity || "0",
      ).toFixed(6);

      const response = await makeAuthenticatedRequest(
        "/delivery/trucks/create/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            licensePlate: formState.licensePlate,
            kilogramCapacity: parseFloat(formattedMaxCapacity),
          }),
        },
      );

      if (response.ok) {
        router.replace("/(tabs)/home");
      } else {
        throw new Error("Failed to add truck");
      }
    } catch (error) {
      console.error("Error adding truck:", error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: theme.color.lightPrimary },
          ]}
        >
          <MaterialIcons
            name="local-shipping"
            size={32}
            color={theme.color.darkPrimary}
          />
        </View>
        <Text style={[styles.headerTitle, { color: theme.color.black }]}>
          Add New Truck
        </Text>
        <Text style={[styles.headerSubtitle, { color: "rgba(0, 0, 0, 0.6)" }]}>
          Enter truck details
        </Text>
      </View>

      <View style={styles.formContainer}>
        <FormField
          label="License Plate"
          value={formState.licensePlate}
          onChangeText={(text) =>
            setFormState({ ...formState, licensePlate: text.toUpperCase() })
          }
          placeholder="Enter license plate"
          icon="directions-car"
          autoCapitalize="characters"
        />

        <FormField
          label="Max Capacity (kg)"
          value={formState.maxCapacity}
          onChangeText={(text) =>
            setFormState({ ...formState, maxCapacity: text })
          }
          placeholder="Enter maximum capacity"
          icon="fitness-center"
          keyboardType="numeric"
        />

        <View style={styles.buttonContainer}>
          <GradientButton title="Add Truck" onPress={handleSubmit} />
        </View>
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
    fontWeight: "700",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  buttonContainer: {
    marginTop: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  formContainer: {
    flex: 1,
  },
});

