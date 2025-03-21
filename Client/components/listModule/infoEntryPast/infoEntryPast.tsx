import React from "react";
import { View, Text } from "react-native";
import useStyles from "./styles";
import { useTheme } from "@context/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";
import { SvgProps } from "react-native-svg";

interface InfoEntryPastProps {
  Icon: React.FC<SvgProps>;
  value: number;
  label: string;
  gradientColors: [string, string];
}

export default function InfoEntryPast({
  Icon,
  value,
  label,
  gradientColors,
}: InfoEntryPastProps) {
  const styles = useStyles();
  const { theme } = useTheme();

  return (
    <LinearGradient
      colors={gradientColors}
      style={styles.container}
    >
      <View style={styles.containerInner}>
        <View style={styles.firstColumn}>
          <Icon width={24} height={24} fill="black" />
        </View>
        <View style={styles.secondColumn}>
          <Text style={styles.value}>
            {value} {label}
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
} 