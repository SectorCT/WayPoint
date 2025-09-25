import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "@context/ThemeContext";
import { FormField } from "../components/basic/FormField";
import { GradientButton } from "@components/basic/gradientButton/gradientButton";
import { makeAuthenticatedRequest } from "../utils/api";
import { router } from "expo-router";
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

  const handleBack = () => {
    router.back();
  };

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
         router.back();
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
        <View style={styles.headerContent}>
          <View style={styles.headerText}>
            <Text style={[styles.headerTitle, { color: theme.color.black }]}>
              Add New Truck
            </Text>
            <Text style={[styles.headerSubtitle, { color: "rgba(0, 0, 0, 0.6)" }]}>
              Enter truck details
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBack}
          >
            <MaterialIcons name="arrow-back" size={24} color={theme.color.darkPrimary} />
          </TouchableOpacity>
        </View>
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
    marginTop: 60,
    marginBottom: 32,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerText: {
    flex: 1,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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

  formContainer: {
    flex: 1,
  },
});

