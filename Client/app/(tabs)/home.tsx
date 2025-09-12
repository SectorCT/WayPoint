import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useTheme } from "@context/ThemeContext";
import { makeAuthenticatedRequest, getDeliveryHistory } from "../../utils/api";
import useStyles from "./styles/homeStyles";
import { router } from "expo-router";
import AddButton from "@/components/basic/addButton/addButton";
import PackageModule from "@components/listModule/packageModule/packageModule";
import moment from "moment";
import CurrentJourney from "@/components/listModule/currentJourney/currentJourney";
import PastEntry from "@/components/listModule/pastEntry/pastEntry";
import { useAuth } from "@/context/AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

interface PastEntryType {
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
  hours: string;
}

export default function HomeScreen() {
  const { theme } = useTheme();
  const { logout, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [pastEntries, setPastEntries] = useState<PastEntryType[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const styles = useStyles();

  const [journeyStarted, setJourneyStarted] = useState(false);

  // Fetch delivery history on component mount
  useEffect(() => {
    fetchDeliveryHistory();
  }, []);

  const fetchDeliveryHistory = async () => {
    try {
      setHistoryLoading(true);
      const historyData = await getDeliveryHistory(7); // Get last 7 days
      setPastEntries(historyData);
    } catch (error) {
      console.error('Error fetching delivery history:', error);
      setPastEntries([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDeliveryHistory();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/(auth)/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleVerifyTruckers = () => {
    router.push('/(tabs)/verifyTruckers');
  };

  const renderPastEntry = ({ item }: { item: PastEntryType }) => (
    <PastEntry
      date={item.date}
      delivered={item.delivered}
      undelivered={item.undelivered}
      numTrucks={item.numTrucks}
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
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              {user?.isManager && (
                <TouchableOpacity onPress={handleVerifyTruckers} style={{ marginRight: 8 }}>
                  <LinearGradient
                    colors={[theme.color.mediumPrimary, theme.color.darkPrimary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.logoutButton}
                  >
                    <MaterialIcons name="verified-user" size={24} color="#FFFFFF" />
                  </LinearGradient>
                </TouchableOpacity>
              )}
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
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={theme.color.mediumPrimary} />
          ) : (
            <FlatList
              data={[{ id: "main" }]}
              renderItem={() => (
                <View>
                  {journeyStarted ? (
                    <CurrentJourney packagesDelivered={13} totalPackages={20} />
                  ) : (
                    <TouchableOpacity style={styles.startNewButton} onPress={() => router.push("/startJourney")}>
                      <Text style={styles.startNewButtonText}>
                        Start new journey
                      </Text>
                    </TouchableOpacity>
                  )}
                  <View style={styles.pastHistory}>
                    <Text style={styles.titlepasthistory}>Past History</Text>
                    {historyLoading ? (
                      <ActivityIndicator size="small" color={theme.color.mediumPrimary} style={{ marginTop: 10 }} />
                    ) : pastEntries.length > 0 ? (
                      <View>
                        {pastEntries.map((item, index) => (
                          <View key={item.date}>
                            <PastEntry
                              date={item.date}
                              delivered={item.delivered}
                              undelivered={item.undelivered}
                              numTrucks={item.numTrucks}
                              duration={item.hours}
                            />
                            {index < pastEntries.length - 1 && (
                              <View style={{ height: 12 }} />
                            )}
                          </View>
                        ))}
                      </View>
                    ) : (
                      <View style={{ 
                        padding: 20, 
                        alignItems: 'center', 
                        backgroundColor: theme.color.white,
                        borderRadius: 16,
                        marginTop: 10,
                        ...theme.shadow
                      }}>
                        <Text style={{ 
                          color: theme.color.lightGrey, 
                          fontSize: theme.fontSize.medium,
                          fontFamily: theme.font.regular
                        }}>
                          No delivery history available
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              )}
              keyExtractor={(item) => item.id}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={[theme.color.mediumPrimary]}
                  tintColor={theme.color.mediumPrimary}
                />
              }
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
