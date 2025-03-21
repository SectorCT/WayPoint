import { View, Text, TouchableOpacity, Linking, Alert } from "react-native";
import useStyles from "./styles";
import { useTheme } from "@context/ThemeContext";
import Trash from "@assets/icons/trash.svg";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { makeAuthenticatedRequest } from "../../../utils/api";

export default function PackageModule({
  id,
  phoneNumber,
  location,
  recipient,
  onDelete,
}: {
  id: string;
  phoneNumber: string;
  location: string;
  recipient: string;
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
