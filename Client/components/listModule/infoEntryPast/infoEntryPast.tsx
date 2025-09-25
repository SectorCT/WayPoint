import React from "react";
import { View, Text } from "react-native";
import useStyles from "./styles";
import { LinearGradient } from "expo-linear-gradient";
import { SvgProps } from "react-native-svg";

interface InfoEntryPastProps {
  Icon: React.FC<SvgProps>;
  value: number;
  label: string;
  gradientColor: string;
  iconSize?: number;
  marginTop?: number;
}

export default function InfoEntryPast({
  Icon,
  value,
  label,
  gradientColor,
  iconSize = 24,
  marginTop = 0,
}: InfoEntryPastProps) {
  const styles = useStyles();

  return (
    <LinearGradient
      colors={[gradientColor, "#FFFFFF"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.container}
    >
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
