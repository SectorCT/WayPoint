import { View, Text, TouchableOpacity } from "react-native";
import useStyles from "./styles";
import { useTheme } from "@context/ThemeContext";
import { MaterialIcons } from "@expo/vector-icons";
import Plus from "@assets/icons/plus.svg";

export default function AddButton({
  onPress,
  style,
}: {
  onPress: () => void;
  style?: object;
}) {
  const styles = useStyles();
  const { theme } = useTheme();

  return (
    <TouchableOpacity style={[styles.container, style]} onPress={onPress}>
      <Plus height={26} width={26} fill={theme.color.darkPrimary} />
    </TouchableOpacity>
  );
}
