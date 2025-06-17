import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import useStyles from "./styles";
import { useTheme } from "@/context/ThemeContext";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import InfoEntryPast from "../infoEntryPast/infoEntryPast";
import Cubes from "@assets/icons/cubes.svg";
import Truck from "@assets/icons/truck.svg";
import Weight from "@assets/icons/weight.svg";

interface PastEntryProps {
  date: string;
  delivered: {
    numPackages: number;
    kilos: number;
  };
  undelivered: {
    numPackages: number;
    kilos: number;
  };
  numTrucks: number;
  duration: string;
}

export default function PastEntry({
  date,
  delivered,
  undelivered,
  numTrucks,
  duration,
}: PastEntryProps) {
  const styles = useStyles();
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.secondColumn}>
        <View style={styles.firstRow}>
          <Text style={styles.title}>{date}</Text>
          <Text style={styles.status}>{duration}</Text>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.rowStat}>
            <View style={styles.iconContainer}>
              <Cubes width={20} height={20} fill="#F5D8FC" />
            </View>
            <Text style={styles.deliveredText}>{delivered.numPackages} Delivered packages</Text>
            <View style={styles.kgBadgeDelivered}>
              <Text style={styles.kgBadgeText}>{delivered.kilos} kg</Text>
            </View>
          </View>
          
          <View style={styles.rowStat}>
            <View style={styles.iconContainer}>
              <Cubes width={20} height={20} fill="#FFE6E6" />
            </View>
            <Text style={styles.undeliveredText}>{undelivered.numPackages} Undelivered packages</Text>
            <View style={styles.kgBadgeUndelivered}>
              <Text style={styles.kgBadgeText}>{undelivered.kilos} kg</Text>
            </View>
          </View>
          
          <View style={styles.rowStat}>
            <View style={styles.iconContainer}>
              <Truck width={20} height={20} fill="#D9E2FC" />
            </View>
            <Text style={styles.truckText}>{numTrucks} Trucks</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
