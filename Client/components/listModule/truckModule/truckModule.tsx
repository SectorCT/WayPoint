import { View, Text } from "react-native";
import useStyles from "./styles";
import { useTheme } from "@context/ThemeContext";
import Trash from "@assets/icons/trash.svg";
import Truck from "@assets/icons/truck.svg";

export default function TruckModule({
  capacity,
  licensePlate,
  color,
}: {
  licensePlate: string;
  color: string;
  capacity: number;
}) {
  const styles = useStyles();
  const { theme } = useTheme();
  const ICON_SIZE = 27;

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
          <View style={styles.trashOuter}>
            <View style={styles.trashIcon}>
              <Trash height={15} width={15} fill={theme.color.lightGrey} />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
