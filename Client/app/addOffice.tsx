import React, { useState, useEffect } from "react";
import { View, Text, Alert, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "@context/ThemeContext";
import { useAuth } from "@context/AuthContext";
import { FormField } from "../components/basic/FormField";
import { GradientButton } from "@components/basic/gradientButton/gradientButton";
import { makeAuthenticatedRequest } from "../utils/api";
import { router, useLocalSearchParams } from "expo-router";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

interface OfficeState {
  name: string;
  address: string;
  latitude?: string;
  longitude?: string;
}

export default function AddOfficeScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const [formState, setFormState] = useState<OfficeState>({
    name: (params.name as string) || "",
    address: (params.address as string) || "",
    latitude: params.latitude as string,
    longitude: params.longitude as string,
  });
  const [adding, setAdding] = useState(false);

  // Always initialize form state from params, and update if params change
  useEffect(() => {
    if (params.returnScreen === "addOffice" && (params.latitude || params.longitude || params.address)) {
      setFormState((prev) => ({
        ...prev,
        latitude: params.latitude as string || prev.latitude,
        longitude: params.longitude as string || prev.longitude,
        address: params.address as string || prev.address,
      }));
    }
  }, [params.address, params.latitude, params.longitude]);

  const handlePickLocation = () => {
    router.replace({
      pathname: "/pickLocationFromMap",
      params: {
        ...formState,
        returnScreen: "addOffice",
      },
    });
  };

  const handleSubmit = async () => {
    try {
      setAdding(true);
      const companyId = user?.company?.id;
      if (!companyId) {
        Alert.alert("Error", "No company ID found for this user. Please log in as a manager with a company.");
        setAdding(false);
        return;
      }
      const requestBody = {
        name: formState.name,
        address: formState.address,
        latitude: parseFloat((formState.latitude || "0")).toFixed(6),
        longitude: parseFloat((formState.longitude || "0")).toFixed(6),
        company: companyId,
      };
      console.log("Add Office Request Body:", JSON.stringify(requestBody, null, 2));
      const response = await makeAuthenticatedRequest(
        "/delivery/offices/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        },
      );
      console.log("Add Office Response Status:", response.status);
      const responseData = await response.json().catch(() => ({}));
      console.log("Add Office Response Data:", responseData);
      if (response.ok) {
        router.replace("/(tabs)/offices");
      } else {
        Alert.alert("Error", responseData.detail || JSON.stringify(responseData) || "Failed to add office");
      }
    } catch (error) {
      console.error("Error adding office:", error);
      Alert.alert("Error", "Failed to add office");
    } finally {
      setAdding(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.replace('/(tabs)/offices')} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={28} color={theme.color.darkPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.color.black, flex: 1, textAlign: 'center' }]}>Add New Office</Text>
        <View style={{ width: 36 }} />
      </View>
      <Text style={[styles.headerSubtitle, { color: "rgba(0, 0, 0, 0.6)", alignSelf: 'center' }]}>Enter office details</Text>
      <FormField
        label="Office Name"
        value={formState.name}
        onChangeText={(text) => setFormState({ ...formState, name: text })}
        placeholder="Enter office name"
        icon="business"
      />
      <FormField
        label="Office Address"
        value={formState.address}
        onChangeText={(text) => setFormState({ ...formState, address: text })}
        placeholder="Enter office address"
        icon="location-on"
        actionIcon="map"
        onActionPress={handlePickLocation}
      />
      <View style={styles.buttonContainer}>
        <GradientButton title={adding ? "Adding..." : "Add Office"} onPress={handleSubmit} />
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
  headerTitle: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  pickLocationButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 6,
    backgroundColor: "#eee",
    marginBottom: 10,
    marginTop: 4,
  },
  buttonContainer: {
    marginTop: 16,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    padding: 8,
    zIndex: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 60,
    marginBottom: 8,
    height: 48,
    paddingHorizontal: 8,
  },
}); 