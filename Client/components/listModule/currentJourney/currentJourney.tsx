import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import useStyles from "./styles";
import { useTheme } from "@context/ThemeContext";
import Truck from "@assets/icons/truck.svg";
import { router } from "expo-router";

export default function CurrentJourney({
  packagesDelivered,
  totalPackages,
}: {
  packagesDelivered: number;
  totalPackages: number;
}) {
  const styles = useStyles();
  const { theme } = useTheme();
  const ICON_SIZE = 27;

  return (
    <>
      <View style={styles.container}>
        <View style={styles.containerInner}>
          <View style={styles.firstColumn}>
            <Truck
              height={ICON_SIZE}
              width={ICON_SIZE}
              fill={theme.color.mediumPrimary}
            />
          </View>
          <View style={styles.secondColumn}>
            <View style={styles.firstRow}>
              <Text style={styles.title}>Current Journey</Text>
            </View>
            <View style={styles.secondRow}>
              <Text style={styles.location}>
                {packagesDelivered}/{totalPackages} packages
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.thirdColumn} onPress={() => router.push("/(tabs)/adminTruckTracker")}>
            <Text style={styles.trackText}>Track</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.filledUpPartProgress,
              { width: `${(packagesDelivered / totalPackages) * 100}%` },
            ]}
          >
            <Text style={styles.percentageText}>
              {(packagesDelivered / totalPackages) * 100}%
            </Text>
          </View>
        </View>
      </View>
    </>
  );
}
