import React from "react";
import { View, Text, TouchableOpacity, Linking, Alert } from "react-native";
import useStyles from "./styles";
import { useTheme } from "@/context/ThemeContext";
import Trash from "@assets/icons/trash.svg";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { makeAuthenticatedRequest } from "../../../utils/api";

export default function PackageModule({
  id,
  phoneNumber,
  location,
  recipient,
  status,
  onDelete,
}: {
  id: string;
  phoneNumber: string;
  location: string;
  recipient: string;
  status: 'pending' | 'in_transit' | 'delivered' | 'undelivered';
  onDelete?: () => void;
}) {
  const styles = useStyles();
  const { theme } = useTheme();

  const handlePhonePress = () => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleDelete = async () => {
    Alert.alert(
      "Delete Package",
      "Are you sure you want to delete this package?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await makeAuthenticatedRequest(`/delivery/packages/${id}/`, {
                method: "DELETE",
              });
              console.log(response);
              if (response.ok) {
                onDelete?.();
              } else {
                Alert.alert("Error", "Failed to delete package");
              }
            } catch (error) {
              console.error("Error deleting package:", error);
              Alert.alert("Error", "Failed to delete package");
            }
          }
        }
      ]
    );
  };

  // Determine status label and color
  let statusLabel = '';
  let statusColor = '';
  if (status === 'delivered') {
    statusLabel = 'Delivered';
    statusColor = '#27ae60'; // green
  } else if (status === 'in_transit') {
    statusLabel = 'In Transit';
    statusColor = '#4A90E2'; // blue
  } else if (status === 'undelivered') {
    statusLabel = 'Not Delivered';
    statusColor = '#e74c3c'; // red
  } else if (status === 'pending') {
    statusLabel = 'Pending';
    statusColor = '#888'; // gray
  } else {
    statusLabel = 'Not Assigned';
    statusColor = '#888'; // gray
  }

  return (
    <View style={styles.container}>
      <View style={styles.firstRow}>
        <View style={styles.idContainer}>
          <Text style={styles.title}>{id}</Text>
          <Text style={styles.recipient}>To: {recipient}</Text>
        </View>
        <TouchableOpacity onPress={handlePhonePress}>
          <LinearGradient
            colors={[theme.color.mediumPrimary, theme.color.darkPrimary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.phoneButton}
          >
            <MaterialIcons name="phone" size={20} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
      <View style={styles.statusRow}>
        <Text style={[styles.statusText, { color: statusColor }]}> 
          {statusLabel}
        </Text>
      </View>
      <View style={styles.secondRow}>
        <Text style={styles.location}>{location}</Text>
        <TouchableOpacity onPress={handleDelete} style={styles.trashOuter}>
          <View style={styles.trashIcon}>
            <Trash height={15} width={15} fill={theme.color.lightGrey} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}
