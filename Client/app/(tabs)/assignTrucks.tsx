import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Alert, Animated, Easing, Platform } from 'react-native';
import { useTheme } from '@context/ThemeContext';
import { assignTruckAndStartJourney, startJourney } from '../../utils/journeyApi';
import { router, useLocalSearchParams } from 'expo-router';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Truck, User } from '../../types/objects';

interface Assignment {
  driver: User;
  truck?: Truck;
}

function TruckLoadingAnimation() {
  // Simple animated truck moving left to right
  const translateX = React.useRef(new Animated.Value(-60)).current;
  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(translateX, {
          toValue: 260,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: -60,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [translateX]);
  return (
    <View style={{ height: 60, justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
      <Animated.View style={{ transform: [{ translateX }] }}>
        <MaterialIcons name="local-shipping" size={48} color="#2196F3" />
      </Animated.View>
    </View>
  );
}

export default function AssignTrucksScreen() {
  const { theme } = useTheme();
  // Get params from navigation
  const params = useLocalSearchParams();
  function parseParam<T>(param: any): T {
    if (typeof param === 'string') {
      try {
        return JSON.parse(param);
      } catch {
        return [] as any;
      }
    }
    if (Array.isArray(param)) return param as T;
    return [] as any;
  }
  const selectedDrivers: User[] = parseParam<User[]>(params.selectedDrivers);
  const availableTrucks: Truck[] = parseParam<Truck[]>(params.availableTrucks);

  const [assignments, setAssignments] = useState<Assignment[]>(
    selectedDrivers.map((driver: User) => ({ driver }))
  );
  const [remainingTrucks, setRemainingTrucks] = useState<Truck[]>(availableTrucks);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');

  const handleAssignTruck = (driverIndex: number, truck: Truck) => {
    // Remove truck from remainingTrucks
    const newAssignments = [...assignments];
    // If previously assigned, return that truck to available
    const prevTruck = newAssignments[driverIndex].truck;
    if (prevTruck) {
      setRemainingTrucks((prev) => [...prev, prevTruck]);
    }
    newAssignments[driverIndex].truck = truck;
    setAssignments(newAssignments);
    setRemainingTrucks((prev) => prev.filter((t) => t.licensePlate !== truck.licensePlate));
  };

  const handleConfirm = async () => {
    // Check all drivers have a truck
    if (assignments.some((a) => !a.truck)) {
      Alert.alert('Error', 'Please assign a truck to each driver.');
      return;
    }
    setLoading(true);
    setLoadingMsg('Planning routes for your drivers...');
    try {
      // 1. Plan routes for selected drivers
      const driverUsernames = assignments.map(a => a.driver.username);
      const plannedRoutes = await startJourney(driverUsernames);
      // 2. Assign trucks for each driver with a planned route
      setLoadingMsg('Assigning trucks and packages...');
      const driversWithRoutes = assignments.filter(a => plannedRoutes.some((r: any) => r.driverUsername === a.driver.username));
      for (const assignment of driversWithRoutes) {
        const route = plannedRoutes.find((r: any) => r.driverUsername === assignment.driver.username);
        if (!route) continue;
        await assignTruckAndStartJourney(
          assignment.driver.username,
          assignment.truck!.licensePlate,
          route.route.map((wp: any) => wp.package_info),
          route.route.flatMap((wp: any) => wp.route)
        );
      }
      setLoading(false);
      router.replace({ pathname: '/(tabs)/adminTruckTracker' });
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', error instanceof Error ? error.message : 'An error occurred.');
    }
  };

  const renderTruckPicker = (driverIndex: number) => (
    <FlatList
      data={remainingTrucks.concat(assignments[driverIndex].truck ? [assignments[driverIndex].truck] : [])}
      keyExtractor={(item) => item.licensePlate}
      horizontal
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[
            styles.truckOption,
            assignments[driverIndex].truck?.licensePlate === item.licensePlate && styles.truckOptionSelected,
            { borderColor: theme.color.lightGrey },
          ]}
          onPress={() => handleAssignTruck(driverIndex, item)}
        >
          <Text style={{ color: theme.color.black }}>{item.licensePlate}</Text>
          <Text style={{ color: theme.color.darkPrimary }}>{item.kilogramCapacity} kg</Text>
        </TouchableOpacity>
      )}
      showsHorizontalScrollIndicator={false}
      style={{ marginVertical: 8 }}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.color.white }]}> 
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerText}>
            <Text style={[styles.title, { color: theme.color.black }]}>Assign Trucks</Text>
            <Text style={[styles.subtitle, { color: theme.color.lightGrey }]}>
              {loading ? loadingMsg : `Assign trucks to ${selectedDrivers.length} drivers`}
            </Text>
          </View>
          {!loading && (
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <MaterialIcons name="arrow-back" size={24} color={theme.color.darkPrimary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      {loading ? (
        <View style={styles.loadingContainer}>
          <TruckLoadingAnimation />
          <Text style={{ color: theme.color.darkPrimary, fontSize: 18, marginTop: 8, textAlign: 'center' }}>{loadingMsg}</Text>
        </View>
      ) : (
        <FlatList
          data={assignments}
          keyExtractor={(item) => item.driver.username}
          renderItem={({ item, index }) => (
            <View style={styles.driverCard}>
              <Text style={[styles.driverName, { color: theme.color.black }]}>{item.driver.username}</Text>
              {renderTruckPicker(index)}
            </View>
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
      <View style={styles.footer}>
        {!loading && (
          <TouchableOpacity
            style={[
              styles.confirmButton,
              { backgroundColor: assignments.length > 0 && assignments.every((a) => a.truck) ? theme.color.darkPrimary : theme.color.lightGrey },
            ]}
            onPress={handleConfirm}
            disabled={assignments.length === 0 || !assignments.every((a) => a.truck) || loading}
          >
            <MaterialIcons name="check" size={24} color="#FFF" />
            <Text style={styles.confirmButtonText}>Confirm Assignments</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    padding: 20, 
    paddingTop: Platform.OS === 'android' ? 90 : 60, // Add extra padding for Android
    borderBottomWidth: 1, 
    borderBottomColor: '#eee' 
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerText: {
    flex: 1,
  },
  backButton: { 
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  title: { 
    fontSize: 32, 
    fontWeight: '700', 
    marginBottom: 8 
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  driverCard: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  driverName: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  truckOption: { padding: 12, borderWidth: 1, borderRadius: 8, marginRight: 12, backgroundColor: '#f5f5f5' },
  truckOptionSelected: { backgroundColor: '#e0f7fa', borderWidth: 2 },
  listContent: { padding: 16 },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#eee' },
  confirmButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 12, gap: 8 },
  confirmButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600', marginLeft: 8 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
}); 