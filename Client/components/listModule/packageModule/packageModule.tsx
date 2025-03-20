import { View, Text } from "react-native";
import useStyles from "./styles";
import { useTheme } from "@context/ThemeContext";
import Trash from "@assets/icons/trash.svg";

export default function PackageModule({
  id,
  phoneNumber,
  location,
}: {
  id: string;
  phoneNumber: string;
  location: string;
}) {
  const styles = useStyles();
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.firstRow}>
        <Text style={styles.title}>{id}</Text>
        <Text style={styles.phoneNumber}>{phoneNumber}</Text>
      </View>
      <View style={styles.secondRow}>
        <Text>{location}</Text>
        <View style={styles.trashIcon}>
          <Trash height={15} width={15} fill={theme.color.lightGrey} />
        </View>
      </View>
    </View>
  );
}
