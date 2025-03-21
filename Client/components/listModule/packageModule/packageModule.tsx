import { View, Text, TouchableOpacity, Linking } from "react-native";
import useStyles from "./styles";
import { useTheme } from "@context/ThemeContext";
import Trash from "@assets/icons/trash.svg";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

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

  const handlePhonePress = () => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.firstRow}>
        <Text style={styles.title}>{id}</Text>
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
        <View style={styles.trashOuter}>
          <View style={styles.trashIcon}>
            <Trash height={15} width={15} fill={theme.color.lightGrey} />
          </View>
        </View>
      </View>
    </View>
  );
}
