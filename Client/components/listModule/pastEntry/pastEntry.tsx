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
  numPackages: number;
  numTrucks: number;
  kilos: number;
  duration: string;
}

export default function PastEntry({
  date,
  numPackages,
  numTrucks,
  kilos,
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
      </View>

      <View style={styles.statsContainer}>
        <InfoEntryPast
          Icon={Cubes}
          value={numPackages}
          label="packages"
          gradientColor={"#F5D8FC"}
        />

        <InfoEntryPast
          Icon={Truck}
          value={numTrucks}
          label="trucks"
          gradientColor={"#D9E2FC"}
        />

        <InfoEntryPast
          Icon={Weight}
          value={kilos}
          label="kilos of packages"
          gradientColor={"#FCD9D9"}
          iconSize={20}
          marginTop={-3}
        />
      </View>
    </View>
  );
}
