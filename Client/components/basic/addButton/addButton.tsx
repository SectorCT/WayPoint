import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import useStyles from "./styles";
import { useTheme } from "@context/ThemeContext";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
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
  const ICON_SIZE = 21;

  return (
    <TouchableOpacity style={[styles.container, style]} onPress={onPress}>
      <Plus
        height={ICON_SIZE}
        width={ICON_SIZE}
        fill={theme.color.darkPrimary}
      />
    </TouchableOpacity>
  );
}
