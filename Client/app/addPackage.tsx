import React, { useState, useEffect } from "react";
import { View, Text, Alert, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { useTheme } from "@context/ThemeContext";
import { FormField } from "../components/basic/FormField";
import { GradientButton } from "../components/basic/gradientButton";
import { makeAuthenticatedRequest } from "../utils/api";
import { router, useLocalSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';

const GEOAPIFY_API_KEY = process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY;

interface PackageState {
  address: string;
  recipient: string;
  recipientPhoneNumber: string;
  deliveryDate: string;
  weight: string;
  latitude?: string;
  longitude?: string;
}

export default function AddPackageScreen() {
  const { theme } = useTheme();
  const params = useLocalSearchParams();
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Initialize state from params or default values
  const [formState, setFormState] = useState<PackageState>({
    address: params.address as string || "",
    recipient: params.recipient as string || "",
    recipientPhoneNumber: params.recipientPhoneNumber as string || "",
    deliveryDate: params.deliveryDate as string || "",
    weight: params.weight as string || "",
    latitude: params.latitude as string,
    longitude: params.longitude as string,
  });

  useEffect(() => {
    const fetchAddressFromCoordinates = async () => {
      if (formState.latitude && formState.longitude) {
        try {
          const response = await fetch(
            `https://api.geoapify.com/v1/geocode/reverse?lat=${formState.latitude}&lon=${formState.longitude}&lang=bg&format=json&apiKey=${GEOAPIFY_API_KEY}`
          );
          const data = await response.json();
          if (data.results[0].formatted) {
            setFormState(prev => ({ ...prev, address: data.results[0].formatted }));
          } else {
            console.log('No address found for these coordinates');
          }
        } catch (error) {
          console.error('Error fetching address:', error);
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
        returnScreen: "addPackage"
      }
    });
  };

  const handleSubmit = async () => {
    try {
      const dateParts = formState.deliveryDate.split('/');
      const formattedDate = `${dateParts[2]}-${dateParts[0]}-${dateParts[1]}`;
      console.log(formattedDate);

      // Format numeric values to 6 decimal places
      const formattedLatitude = parseFloat(formState.latitude || "0").toFixed(6);
      const formattedLongitude = parseFloat(formState.longitude || "0").toFixed(6);
      const formattedWeight = parseFloat(formState.weight || "0").toFixed(6);

      const response = await makeAuthenticatedRequest('/delivery/packages/create/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
      });

      if (response.ok) {
        Alert.alert("Success", "Package added successfully");
        router.replace("/(tabs)/packages");
      } else {
        const errorData = await response.json();
        Alert.alert("Error", errorData.detail);
      }
    } catch (error) {
      console.error('Error adding package:', error);
      Alert.alert("Error", "Failed to add package");
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      const formattedDate = selectedDate.toLocaleDateString();
      setFormState(prev => ({ ...prev, deliveryDate: formattedDate }));
    }
  };

  const showDatePickerModal = () => {
    setShowDatePicker(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={[styles.iconContainer, { backgroundColor: theme.color.lightPrimary }]}>
          <MaterialIcons name="local-shipping" size={32} color={theme.color.darkPrimary} />
        </View>
        <Text style={[styles.headerTitle, { color: theme.color.black }]}>Add New Package</Text>
        <Text style={[styles.headerSubtitle, { color: 'rgba(0, 0, 0, 0.6)' }]}>
          Enter package details
        </Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.addressContainer}>
          <FormField
            label="Delivery Address"
            value={formState.address}
            onChangeText={(text) => setFormState({ ...formState, address: text })}
            placeholder="Enter delivery address"
            icon="location-on"
            actionIcon="map"
            onActionPress={handlePickLocation}
          />
        </View>

        <FormField
          label="Recipient Name"
          value={formState.recipient}
          onChangeText={(text) => setFormState({ ...formState, recipient: text })}
          placeholder="Enter recipient name"
          icon="person"
        />

        <FormField
          label="Recipient Phone Number"
          value={formState.recipientPhoneNumber}
          onChangeText={(text) => setFormState({ ...formState, recipientPhoneNumber: text })}
          placeholder="Enter recipient phone number"
          icon="phone"
          keyboardType="phone-pad"
        />

        <TouchableOpacity onPress={showDatePickerModal}>
          <FormField
            label="Delivery Date"
            value={formState.deliveryDate}
            onChangeText={(text) => setFormState({ ...formState, deliveryDate: text })}
            placeholder="Select delivery date"
            icon="event"
            editable={false}
          />
        </TouchableOpacity>

        <FormField
          label="Weight (kg)"
          value={formState.weight}
          onChangeText={(text) => setFormState({ ...formState, weight: text })}
          placeholder="Enter package weight"
          icon="fitness-center"
          keyboardType="numeric"
        />

        {showDatePicker && (
          <DateTimePicker
            testID="datePicker"
            value={formState.deliveryDate ? new Date(formState.deliveryDate) : new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onDateChange}
            minimumDate={new Date()}
          />
        )}

        <View style={styles.buttonContainer}>
          <GradientButton 
            title="Add Package" 
            onPress={handleSubmit}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    marginTop: 20,
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  mapButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  locationText: {
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.6)',
    marginTop: -12,
    marginBottom: 16,
    marginLeft: 8,
  },
  buttonContainer: {
    marginTop: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  formContainer: {
    flex: 1,
  },
}); 