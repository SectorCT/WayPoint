import React from "react";
import { TouchableOpacity } from "react-native";
import useStyles from "./styles";
import { useTheme } from "@context/ThemeContext";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

export default function HistoryButton({
  onPress,
  style,
}: {
  onPress: () => void;
  style?: object;
}) {
  const styles = useStyles();
  const { theme } = useTheme();
  const ICON_SIZE = 21;

  return (
    <TouchableOpacity style={[styles.container, style]} onPress={onPress}>
      <MaterialIcons
        name="history"
        size={ICON_SIZE}
        color={theme.color.darkPrimary}
      />
    </TouchableOpacity>
  );
} 