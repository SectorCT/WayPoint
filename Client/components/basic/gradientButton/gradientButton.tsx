import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/context/ThemeContext";
import useStyles from "./styles";

interface GradientButtonProps {
  onPress: () => void;
  title: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const GradientButton: React.FC<GradientButtonProps> = ({
  onPress,
  title,
  style,
  textStyle,
}) => {
  const { theme } = useTheme();
  const styles = useStyles();
  return (
    <TouchableOpacity onPress={onPress} style={[styles.buttonContainer, style]}>
      <LinearGradient
        colors={[theme.color.mediumPrimary, theme.color.darkPrimary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <Text style={[styles.text, textStyle]}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};
