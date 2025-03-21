import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { useTheme } from "@context/ThemeContext";
import { makeAuthenticatedRequest } from "../../utils/api";
import useStyles from "./styles/homeStyles";
import { router } from "expo-router";
import AddButton from "@/components/basic/addButton/addButton";
import PackageModule from "@components/listModule/packageModule/packageModule";
import moment from "moment";
import CurrentJourney from "@/components/listModule/currentJourney/currentJourney";
import PastEntry from "@/components/listModule/pastEntry/pastEntry";

export default function HomeScreen() {
  const { theme } = useTheme();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(false);
  const styles = useStyles();

  // useEffect(() => {
  //   fetchPackages();
  // }, []);

  // const fetchPackages = async () => {
  //   try {
  //     const response = await makeAuthenticatedRequest("/delivery/packages/", {
  //       method: "GET",
  //     });
  //     const data = await response.json();
  //     setPackages(data);
  //   } catch (error) {
  //     console.error("Error fetching packages:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const [journeyStarted, setJourneyStarted] = useState(false);

  return (
    <View style={styles.outer}>
      <View style={styles.topFill} />
      <SafeAreaView style={styles.container}>
        <View style={styles.inner}>
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Journeys</Text>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={theme.color.mediumPrimary} />
          ) : (
            <FlatList
              data={[{ id: "1" }]}
              renderItem={() => (
                <View>
                  {journeyStarted ? (
                    <CurrentJourney packagesDelivered={13} totalPackages={20} />
                  ) : (
                    <TouchableOpacity style={styles.startNewButton}>
                      <Text style={styles.startNewButtonText}>
                        Start new journey
                      </Text>
                    </TouchableOpacity>
                  )}
                  <View style={styles.pastHistory}>
                    <Text style={styles.titlepasthistory}>Past History</Text>
                    <PastEntry
                      duration="3:45"
                      date="20th March"
                      deliveredPackages={23}
                      totalTrucks={5}
                      kilosDelivered={100}
                    />
                  </View>
                </View>
              )}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{
                paddingBottom: 100,
                gap: 12,
                paddingTop: 16,
              }}
              style={{ paddingHorizontal: 20, height: "100%" }}
            />
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}
