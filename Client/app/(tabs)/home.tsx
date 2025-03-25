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
import useStyles from "./home.styles";
import { router } from "expo-router";
import CurrentJourney from "@/components/listModule/currentJourney/currentJourney";
import PastEntry from "@/components/listModule/pastEntry/pastEntry";
import { useAuth } from "@/context/AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import { getAllRoutes } from "@/utils/journeyApi";

interface PastEntryType {
  date: string;
  numPackages: number;
  numTrucks: number;
  kilos: number;
  hours: string;
}

const pastEntries: PastEntryType[] = [
  {
    date: "20th March",
    numPackages: 23,
    numTrucks: 5,
    kilos: 100,
    hours: "3:50",
  },
  {
    date: "19th March",
    numPackages: 18,
    numTrucks: 4,
    kilos: 80,
    hours: "4:12",
  },
  {
    date: "18th March",
    numPackages: 25,
    numTrucks: 6,
    kilos: 120,
    hours: "3:15",
  },
  {
    date: "17th March",
    numPackages: 15,
    numTrucks: 3,
    kilos: 60,
    hours: "5:15",
  },
];

export default function HomeScreen() {
  const { theme } = useTheme();
  const { logout, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const styles = useStyles();
  const [activeJourney, setActiveJourney] = useState<RouteData | null>(null);

  useEffect(() => {
    checkActiveJourney();
  }, []);

  const checkActiveJourney = async () => {
    try {
      setLoading(true);
      const routes = await getAllRoutes();
      // If there are any routes, consider it an active journey
      setActiveJourney(routes.length > 0 ? routes[0] : null);
    } catch (error) {
      console.error("Error checking active journey:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const renderPastEntry = ({ item }: { item: PastEntryType }) => (
    <PastEntry
      date={item.date}
      numPackages={item.numPackages}
      numTrucks={item.numTrucks}
      kilos={item.kilos}
      duration={item.hours}
    />
  );

  return (
    <View style={styles.outer}>
      <View style={styles.topFill} />
      <SafeAreaView style={styles.container}>
        <View style={styles.inner}>
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Journeys</Text>
            <TouchableOpacity onPress={handleLogout}>
              <LinearGradient
                colors={[theme.color.mediumPrimary, theme.color.darkPrimary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.logoutButton}
              >
                <MaterialIcons name="logout" size={24} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={theme.color.mediumPrimary} />
          ) : (
            <FlatList
              data={[{ id: "main" }]}
              renderItem={() => (
                <View>
                  {activeJourney ? (
                    <CurrentJourney 
                      packagesDelivered={activeJourney.packageSequence.filter(pkg => pkg.status === 'delivered').length} 
                      totalPackages={activeJourney.packageSequence.length} 
                    />
                  ) : (
                    <TouchableOpacity 
                      style={[
                        styles.startNewButton,
                        { backgroundColor: theme.color.mediumPrimary }
                      ]} 
                      onPress={() => router.push("/startJourney")}
                    >
                      <Text style={styles.startNewButtonText}>
                        Start new journey
                      </Text>
                    </TouchableOpacity>
                  )}
                  <View style={styles.pastHistory}>
                    <Text style={styles.titlepasthistory}>Past History</Text>
                    <FlatList
                      data={pastEntries}
                      renderItem={renderPastEntry}
                      keyExtractor={(item) => item.date}
                      scrollEnabled={false}
                      ItemSeparatorComponent={() => (
                        <View style={{ height: 12 }} />
                      )}
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
