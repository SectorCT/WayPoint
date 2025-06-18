import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { useTheme } from "@context/ThemeContext";
import { getPackages } from "../../utils/journeyApi";
import useStyles from "./styles/packageStyles";
import { router } from "expo-router";
import PackageModule from "@components/listModule/packageModule/packageModule";
import moment from "moment";
import { Package } from "../../types/objects";

export default function PackagesHistoryScreen() {
  const { theme } = useTheme();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const styles = useStyles();

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const data = await getPackages();
      setPackages(data);
    } catch (error) {
      console.error("Error fetching packages:", error);
    } finally {
      setLoading(false);
    }
  };

  const getOverduePackages = (packages: Package[]): Package[] => {
    const today = moment().format("YYYY-MM-DD");
    
    if (!packages?.length) {
      return [];
    }

    return packages.filter(pkg => 
      moment(pkg.deliveryDate).isBefore(today)
    );
  };

  const overduePackages = getOverduePackages(packages);

  return (
    <View style={styles.outer}>
      <View style={styles.topFill} />
      <SafeAreaView style={styles.container}>
        <View style={styles.inner}>
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Packages History</Text>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={theme.color.mediumPrimary} />
          ) : overduePackages.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateText}>No overdue packages</Text>
              <Text style={styles.emptyStateSubtext}>
                All packages are up to date
              </Text>
            </View>
          ) : (
            <FlatList
              data={overduePackages}
              keyExtractor={(pkg) => pkg.packageID}
              renderItem={({ item }) => (
                <PackageModule
                  id={item.packageID}
                  location={item.address}
                  phoneNumber={item.recipientPhoneNumber}
                  recipient={item.recipient}
                  onDelete={() => {
                    // Refresh the packages list after deletion
                    fetchPackages();
                  }}
                />
              )}
              contentContainerStyle={{
                paddingBottom: 100,
                gap: 12,
                paddingTop: 16,
                paddingHorizontal: 20,
              }}
              style={{ height: "100%" }}
            />
          )}
        </View>
      </SafeAreaView>
    </View>
  );
} 