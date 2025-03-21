import { View, Text } from "react-native";
import useStyles from "./styles";
import { useTheme } from "@context/ThemeContext";

export default function CurrentJourney() {
  const styles = useStyles();
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Text>CurrentJourney</Text>
    </View>
  );
}
