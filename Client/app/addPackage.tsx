import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Alert,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { useTheme } from "@context/ThemeContext";
import { FormField } from "../components/basic/FormField";
import { GradientButton } from "@components/basic/gradientButton/gradientButton";
import { makeAuthenticatedRequest } from "../utils/api";
import { router, useLocalSearchParams } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import useStyles from "./addPackage.styles";
import { MaterialIcons } from "@expo/vector-icons";

const GEOAPIFY_API_KEY = process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY;

interface PackageState {
  address: string;
  recipient: string;
  recipientPhoneNumber: string;
  deliveryDate: string;
  weight: string;
  latitude?: string;
  longitude?: string;
  packageId: string;
  recipientName: string;
}

export default function AddPackageScreen() {
  const { theme } = useTheme();
  const params = useLocalSearchParams();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const styles = useStyles();

  // Initialize state from params or default values
  const [formState, setFormState] = useState<PackageState>({
    address: (params.address as string) || "",
    recipient: (params.recipient as string) || "",
    recipientPhoneNumber: (params.recipientPhoneNumber as string) || "",
    deliveryDate: (params.deliveryDate as string) || "",
    weight: (params.weight as string) || "",
    latitude: params.latitude as string,
    longitude: params.longitude as string,
    packageId: (params.packageId as string) || "",
    recipientName: (params.recipientName as string) || "",
  });

  useEffect(() => {
    const fetchAddressFromCoordinates = async () => {
      if (formState.latitude && formState.longitude) {
        try {
          const response = await fetch(
            `https://api.geoapify.com/v1/geocode/reverse?lat=${formState.latitude}&lon=${formState.longitude}&lang=bg&format=json&apiKey=${GEOAPIFY_API_KEY}`,
          );
          const data = await response.json();
          if (data.results[0].formatted) {
            setFormState((prev) => ({
              ...prev,
              address: data.results[0].formatted,
            }));
          } else {
            console.log("No address found for these coordinates");
          }
        } catch (error) {
          console.error("Error fetching address:", error);
        }
      }
    };

    fetchAddressFromCoordinates();
  }, [formState.latitude, formState.longitude]);

  const handlePickLocation = () => {
    // Pass current state to map screen
    router.replace({
      pathname: "/pickLocationFromMap",
      params: {
        ...formState,
        returnScreen: "addPackage",
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const dateParts = formState.deliveryDate.split("/");
      const formattedDate = `${dateParts[2]}-${dateParts[0]}-${dateParts[1]}`;

      // Format numeric values to 6 decimal places
      const formattedLatitude = parseFloat(formState.latitude || "0").toFixed(
        6,
      );
      const formattedLongitude = parseFloat(formState.longitude || "0").toFixed(
        6,
      );
      const formattedWeight = parseFloat(formState.weight || "0").toFixed(6);

      const response = await makeAuthenticatedRequest(
        "/delivery/packages/create/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            address: formState.address,
            latitude: parseFloat(formattedLatitude),
            longitude: parseFloat(formattedLongitude),
            recipient: formState.recipient,
            recipientPhoneNumber: formState.recipientPhoneNumber,
            deliveryDate: formattedDate,
            weight: parseFloat(formattedWeight),
          }),
        },
      );

      console.log(response);

      if (response.ok) {
        router.replace("/(tabs)/packages");
      } else {
        const errorData = await response.json();
        Alert.alert("Error", errorData.detail);
      }
    } catch (error) {
      console.error("Error adding package:", error);
      Alert.alert("Error", "Failed to add package");
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      });
      setFormState((prev) => ({ ...prev, deliveryDate: formattedDate }));
    }
  };

  const showDatePickerModal = () => {
    setShowDatePicker(true);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerContainer}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Add New Package</Text>
            <Text style={styles.headerSubtitle}>Enter the details of the new package</Text>
          </View>
          <View style={styles.iconContainer}>
            <MaterialIcons name="inventory" size={48} color={theme.color.mediumPrimary} />
          </View>
        </View>
        <View style={styles.formContainer}>
          <FormField
            label="Package ID"
            value={formState.packageId}
            onChangeText={(text) =>
              setFormState({ ...formState, packageId: text.toUpperCase() })
            }
            placeholder="Enter package ID"
            icon="inventory"
            autoCapitalize="characters"
          />
          <FormField
            label="Recipient Name"
            value={formState.recipientName}
            onChangeText={(text) =>
              setFormState({ ...formState, recipientName: text })
            }
            placeholder="Enter recipient name"
            icon="person"
          />
          <FormField
            label="Phone Number"
            value={formState.recipientPhoneNumber}
            onChangeText={(text) =>
              setFormState({ ...formState, recipientPhoneNumber: text })
            }
            placeholder="Enter phone number"
            icon="phone"
            keyboardType="phone-pad"
          />
          <View style={styles.addressContainer}>
            <FormField
              label="Address"
              value={formState.address}
              onChangeText={(text) =>
                setFormState({ ...formState, address: text })
              }
              placeholder="Enter address"
              icon="location-on"
              actionIcon="map"
              onActionPress={handlePickLocation}
            />
          </View>
          <TouchableOpacity onPress={showDatePickerModal}>
            <FormField
              label="Delivery Date"
              value={formState.deliveryDate}
              onChangeText={(text) =>
                setFormState({ ...formState, deliveryDate: text })
              }
              placeholder="Select delivery date"
              icon="event"
              editable={false}
            />
          </TouchableOpacity>
          <FormField
            label="Weight (kg)"
            value={formState.weight}
            onChangeText={(text) => {
              // Only allow numbers and one decimal point
              if (/^\d*\.?\d*$/.test(text)) {
                setFormState({ ...formState, weight: text });
              }
            }}
            placeholder="Enter package weight"
            icon="fitness-center"
            keyboardType="numeric"
          />
          {showDatePicker && (
            <DateTimePicker
              testID="datePicker"
              value={(() => {
                if (!formState.deliveryDate) return new Date();
                try {
                  const [month, day, year] = formState.deliveryDate.split('/');
                  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                } catch (e) {
                  return new Date();
                }
              })()}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={onDateChange}
              minimumDate={new Date()}
            />
          )}
        </View>
      </ScrollView>
      <View style={styles.buttonContainer}>
        <GradientButton title="Add Package" onPress={handleSubmit} />
      </View>
    </KeyboardAvoidingView>
  );
}
