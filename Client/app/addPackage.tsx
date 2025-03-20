import { View, Text } from "react-native";
// import useStyles from "./styles";
import { useTheme } from "@context/ThemeContext";

export default function AddPackage() {
  // const styles = useStyles();
  const { theme } = useTheme();

  return (
    <View>
      <Text>AddPackage</Text>
    </View>
  );
}
