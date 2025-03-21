import { View, Text } from "react-native";
import useStyles from "./styles";
import { useTheme } from "@context/ThemeContext";
import Trash from "@assets/icons/trash.svg";
import Truck from "@assets/icons/truck.svg";

export default function PastEntry({
  date,
  duration,
  deliveredPackages,
  totalTrucks,
  kilosDelivered,
}: {
  date: string;
  duration: string;
  deliveredPackages: number;
  totalTrucks: number;
  kilosDelivered: number;
}) {
  const styles = useStyles();
  const { theme } = useTheme();
  const ICON_SIZE = 27;

  return (
    <View style={styles.container}>
      <View style={styles.secondColumn}>
        <View style={styles.firstRow}>
          <Text style={styles.title}>{date}</Text>
          <Text style={styles.status}>{duration}</Text>
        </View>
      </View>
    </View>
  );
}
