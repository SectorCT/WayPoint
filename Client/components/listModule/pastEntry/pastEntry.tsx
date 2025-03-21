import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import useStyles from "./styles";
import { useTheme } from "@context/ThemeContext";
import { MaterialIcons } from "@expo/vector-icons";
import InfoEntryPast from "../infoEntryPast/infoEntryPast";
import Cubes from "@assets/icons/cubes.svg";
import Truck from "@assets/icons/truck.svg";
import Weight from "@assets/icons/weight.svg";

interface PastEntryProps {
  date: string;
  numPackages: number;
  numTrucks: number;
  kilos: number;
  onDelete?: () => void;
  duration: string;
}

export default function PastEntry({
  date,
  numPackages,
  numTrucks,
  kilos,
  duration,
  onDelete,
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
      </View>

      <View style={styles.statsContainer}>
        <InfoEntryPast
          Icon={Cubes}
          value={numPackages}
          label="packages"
          gradientColors={["#FBE8FF", "#F5D6FF"]}
        />

        <InfoEntryPast
          Icon={Truck}
          value={numTrucks}
          label="trucks"
          gradientColors={["#E8F1FF", "#D6E4FF"]}
        />

        <InfoEntryPast
          Icon={Weight}
          value={kilos}
          label="kilos of packages"
          gradientColors={["#FFE8E8", "#FFD6D6"]}
          iconSize={20}
          marginTop={-3}
        />
      </View>

      {onDelete && (
        <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
          <MaterialIcons name="delete-outline" size={24} color="#999" />
        </TouchableOpacity>
      )}
    </View>
  );
}
