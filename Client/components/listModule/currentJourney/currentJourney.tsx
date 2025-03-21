import { View, Text } from "react-native";
import useStyles from "./styles";
import { useTheme } from "@context/ThemeContext";
import Trash from "@assets/icons/trash.svg";
import Truck from "@assets/icons/truck.svg";

export default function CurrentJourney({
  packagesDelivered,
  totalPackages,
}: {
  packagesDelivered: number;
  totalPackages: number;
}) {
  const styles = useStyles();
  const { theme } = useTheme();
  const ICON_SIZE = 27;

  return (
    <View style={styles.container}>
      <View style={styles.firstColumn}>
        <Truck
          height={ICON_SIZE}
          width={ICON_SIZE}
          fill={theme.color.mediumPrimary}
        />
      </View>
      <View style={styles.secondColumn}>
        <View style={styles.firstRow}>
          <Text style={styles.title}>Current Journey</Text>
        </View>
        <View style={styles.secondRow}>
          <Text style={styles.location}>
            {packagesDelivered}/{totalPackages} packages
          </Text>
        </View>
      </View>
      <View style={styles.thirdColumn}>
        <Text style={styles.trackText}>Track</Text>
      </View>
    </View>
  );
}
