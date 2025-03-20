import { View, Text } from "react-native";
import useStyles from "./styles";
import { useTheme } from "@context/ThemeContext";

export default function PackageModule() {
  const styles = useStyles();
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>BHASH12111U</Text>
    </View>
  );
}
