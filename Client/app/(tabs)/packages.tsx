import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { useTheme } from "@context/ThemeContext";
import { makeAuthenticatedRequest } from "../../utils/api";
import useStyles from "./styles/packageStyles";
import { router } from "expo-router";
import AddButton from "@/components/basic/addButton/addButton";
import PackageModule from "@components/listModule/packageModule/packageModule";
import moment from "moment";

export default function PackagesScreen() {
  const { theme } = useTheme();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const styles = useStyles();

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const response = await makeAuthenticatedRequest("/delivery/packages/", {
        method: "GET",
      });
      const data = await response.json();
      setPackages(data);
    } catch (error) {
      console.error("Error fetching packages:", error);
    } finally {
      setLoading(false);
    }
  };

  const groupPackagesByDate = (
    packages: Package[],
  ): Record<string, Package[]> => {
    const today = moment().format("YYYY-MM-DD");
    const tomorrow = moment().add(1, "days").format("YYYY-MM-DD");

    if (!packages?.length) {
      return {};
    }

    const initialGroups: Record<string, Package[]> = {
      Today: [],
      Tomorrow: [],
      Overdue: [],
    };

    const groupedPackages = packages.reduce((acc, pkg) => {
      if (pkg.deliveryDate === today) {
        acc.Today.push(pkg);
      } else if (pkg.deliveryDate === tomorrow) {
        acc.Tomorrow.push(pkg);
      } else if (moment(pkg.deliveryDate).isBefore(today)) {
        acc.Overdue.push(pkg);
      } else {
        const formattedDate = moment(pkg.deliveryDate).format("MMM D, YYYY");
        if (!acc[formattedDate]) acc[formattedDate] = [];
        acc[formattedDate].push(pkg);
      }
      return acc;
    }, initialGroups);

    // Remove empty categories
    return Object.fromEntries(
      Object.entries(groupedPackages).filter(([_, value]) => value.length > 0),
    ) as Record<string, Package[]>;
  };

  const sortSections = (
    sections: [string, Package[]][],
  ): [string, Package[]][] => {
    const priorityOrder = {
      Overdue: 0,
      Today: 1,
      Tomorrow: 2,
    };

    return sections.sort((a, b) => {
      const [sectionA] = a;
      const [sectionB] = b;

      // Handle priority sections first
      if (sectionA in priorityOrder && sectionB in priorityOrder) {
        return (
          priorityOrder[sectionA as keyof typeof priorityOrder] -
          priorityOrder[sectionB as keyof typeof priorityOrder]
        );
      }
      if (sectionA in priorityOrder) return -1;
      if (sectionB in priorityOrder) return 1;

      // For other dates, sort chronologically
      const dateA = moment(sectionA, "MMM D, YYYY");
      const dateB = moment(sectionB, "MMM D, YYYY");
      return dateA.valueOf() - dateB.valueOf();
    });
  };

  const groupedPackages = groupPackagesByDate(packages);
  const sections = sortSections(Object.entries(groupedPackages));

  return (
    <View style={styles.outer}>
      <View style={styles.topFill} />
      <SafeAreaView style={styles.container}>
        <View style={styles.inner}>
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Add your packages</Text>
            <AddButton
              onPress={() => router.navigate("/addPackage")}
              style={{ marginRight: 0 }}
            />
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={theme.color.mediumPrimary} />
          ) : sections.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateText}>No packages to display</Text>
              <Text style={styles.emptyStateSubtext}>
                Add a package to get started
              </Text>
            </View>
          ) : (
            <FlatList
              data={sections}
              keyExtractor={([section]) => section}
              renderItem={({ item: [section, sectionPackages] }) => (
                <>
                  <Text
                    style={[
                      styles.sectionHeader,
                      section === "Overdue" ? styles.overdueHeader : {},
                    ]}
                  >
                    {section}
                  </Text>
                  <FlatList
                    data={sectionPackages}
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
                    contentContainerStyle={{ paddingBottom: 10 }}
                  />
                </>
              )}
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
