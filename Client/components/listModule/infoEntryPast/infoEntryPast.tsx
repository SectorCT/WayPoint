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
  iconSize?: number;
  marginTop?: number;
}

export default function InfoEntryPast({
  Icon,
  value,
  label,
  gradientColors,
  iconSize = 24,
  marginTop = 0,
}: InfoEntryPastProps) {
  const styles = useStyles();
  const { theme } = useTheme();

  return (
    <LinearGradient colors={gradientColors} style={styles.container}>
      <View style={styles.containerInner}>
        <View style={[styles.firstColumn, { marginTop }]}>
          <Icon width={iconSize} height={iconSize} fill="black" />
        </View>
        <View style={styles.secondColumn}>
          <Text style={[styles.value]}>
            {value} {label}
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}

