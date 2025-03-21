import { View, Text, TouchableOpacity, Alert } from "react-native";
import useStyles from "./styles";
import { useTheme } from "@context/ThemeContext";
import Trash from "@assets/icons/trash.svg";
import Truck from "@assets/icons/truck.svg";
import { deleteTruck } from "@/utils/journeyApi";

export default function TruckModule({
  capacity,
  licensePlate,
  color,
  onDelete,
}: {
  licensePlate: string;
  color: string;
  capacity: number;
  onDelete?: () => void;
}) {
  const styles = useStyles();
  const { theme } = useTheme();
  const ICON_SIZE = 27;

  const handleDelete = async () => {
    Alert.alert(
      "Delete Truck",
      "Are you sure you want to delete this truck?",
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
              const response = await deleteTruck(licensePlate);
              if (response.ok) {
                onDelete?.();
              } else {
                Alert.alert("Error", "Failed to delete truck");
              }
            } catch (error) {
              console.error("Error deleting truck:", error);
              Alert.alert("Error", "Failed to delete truck");
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.firstColumn}>
        <Truck height={ICON_SIZE} width={ICON_SIZE} fill={color} />
      </View>
      <View style={styles.secondColumn}>
        <View style={styles.firstRow}>
          <Text style={styles.title}>{licensePlate}</Text>
        </View>
        <View style={styles.secondRow}>
          <Text style={styles.location}>{capacity} kilos of capacity</Text>
          <TouchableOpacity onPress={handleDelete} style={styles.trashOuter}>
            <View style={styles.trashIcon}>
              <Trash height={15} width={15} fill={theme.color.lightGrey} />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
