import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, TextInput, Alert, Modal } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '@context/ThemeContext';
import { getAvailableTrucks, getPackages, getEmployees, startJourney, checkDriverStatus, assignTruckAndStartJourney } from '../utils/journeyApi';
import { User, Truck, Package } from '../types/objects';
import moment from 'moment';
import { router } from 'expo-router';

interface DriverItemProps {
  driver: User;
  isSelected: boolean;
  onSelect: () => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  isDisabled: boolean;
  driverStatus?: any;
}

const DriverItem: React.FC<DriverItemProps> = ({
  driver,
  isSelected,
  onSelect,
  isExpanded,
  onToggleExpand,
  isDisabled,
  driverStatus,
}) => {
  const { theme } = useTheme();
  const [animation] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(animation, {
      toValue: isExpanded ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isExpanded]);

  const maxHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [70, 200],
  });

  // Determine if driver should be disabled based on status
  const isStatusDisabled = driverStatus && (
    driverStatus.status === 'active' || 
    driverStatus.status === 'completed' || 
    driverStatus.status === 'completed_today'
  );

  const finalDisabled = isDisabled || isStatusDisabled;

  // Get status message and color
  const getStatusInfo = () => {
    if (!driverStatus) return { message: '', color: theme.color.lightGrey };
    
    switch (driverStatus.status) {
      case 'active':
        const pending = driverStatus.pending_packages || 0;
        const delivered = driverStatus.delivered_packages || 0;
        const undelivered = driverStatus.undelivered_packages || 0;
        return { 
          message: `Active route: ${delivered} delivered, ${undelivered} undelivered${pending > 0 ? `, ${pending} pending` : ''}`, 
          color: theme.color.mediumPrimary 
        };
      case 'completed':
        const completedDelivered = driverStatus.delivered_packages || 0;
        const completedUndelivered = driverStatus.undelivered_packages || 0;
        return { 
          message: `Completed: ${completedDelivered} delivered, ${completedUndelivered} undelivered`, 
          color: '#4CAF50' 
        };
      case 'completed_today':
        return { 
          message: `Completed today: ${driverStatus.delivered_packages} packages`, 
          color: '#4CAF50' 
        };
      case 'available':
        return { 
          message: 'Available for assignment', 
          color: '#4CAF50' 
        };
      default:
        return { message: '', color: theme.color.lightGrey };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <Animated.View 
      style={[
        styles.driverItem, 
        { 
          maxHeight,
          backgroundColor: theme.color.white,
          borderColor: isSelected ? theme.color.darkPrimary : theme.color.lightGrey,
          opacity: finalDisabled ? 0.5 : 1,
        }
      ]}
    >
      <TouchableOpacity 
        style={styles.driverHeader} 
        onPress={onToggleExpand}
        disabled={finalDisabled}
      >
        <View style={styles.driverInfo}>
          <MaterialIcons 
            name="person" 
            size={24} 
            color={finalDisabled ? theme.color.lightGrey : theme.color.darkPrimary} 
          />
          <View style={styles.driverTextContainer}>
            <Text style={[
              styles.driverName, 
              { color: finalDisabled ? theme.color.lightGrey : theme.color.black }
            ]}>
              {driver.username}
            </Text>
            {statusInfo.message && (
              <Text style={[styles.statusText, { color: statusInfo.color }]}>
                {statusInfo.message}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={[
              styles.selectButton,
              { 
                backgroundColor: isSelected ? theme.color.darkPrimary : 'transparent',
                opacity: finalDisabled ? 0.5 : 1,
              }
            ]}
            onPress={onSelect}
            disabled={finalDisabled}
          >
            <MaterialIcons 
              name={isSelected ? "check" : "add"} 
              size={20} 
              color={isSelected ? "#FFF" : (finalDisabled ? theme.color.lightGrey : theme.color.darkPrimary)} 
            />
          </TouchableOpacity>
          <MaterialIcons 
            name={isExpanded ? "expand-less" : "expand-more"} 
            size={24} 
            color={theme.color.lightGrey} 
          />
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.expandedContent}>
          <View style={styles.detailRow}>
            <MaterialIcons name="email" size={20} color={theme.color.lightGrey} />
            <Text style={[styles.detailText, { color: theme.color.black }]}>
              {driver.email}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialIcons name="phone" size={20} color={theme.color.lightGrey} />
            <Text style={[styles.detailText, { color: theme.color.black }]}>
              {driver.phoneNumber}
            </Text>
          </View>
        </View>
      )}
    </Animated.View>
  );
};

export default function StartJourneyScreen() {
  const { theme } = useTheme();
  const [selectedDrivers, setSelectedDrivers] = useState<Set<string>>(new Set());
  const [expandedDrivers, setExpandedDrivers] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [availableTrucks, setAvailableTrucks] = useState<Truck[]>([]);
  const [todaysPackages, setTodaysPackages] = useState<Package[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [driverStatuses, setDriverStatuses] = useState<{[key: string]: any}>({});
  const [plannedRoutes, setPlannedRoutes] = useState<any[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentDriverIndex, setCurrentDriverIndex] = useState(0);

  // Calculate recommended number of trucks and employees
  const recommendedCount = Math.ceil(todaysPackages.length / 30);

  const filteredDrivers = employees.filter(driver =>
    driver.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trucks, packages, employeesData] = await Promise.all([
          getAvailableTrucks(),
          getPackages(),
          getEmployees()
        ]);
        //filter packages for today and everything older than today
        const filteredPackages = packages.filter((pkg: Package) => {
          const deliveryDate = moment(pkg.deliveryDate);
          return deliveryDate.isSame(moment(), 'day');
        });
        setAvailableTrucks(trucks);
        setTodaysPackages(filteredPackages);
        setEmployees(employeesData);
        
        // Check status for all drivers
        const statusPromises = employeesData.map(async (driver) => {
          try {
            const status = await checkDriverStatus(driver.username);
            return { username: driver.username, status };
          } catch (error) {
            console.error(`Error checking status for ${driver.username}:`, error);
            return { username: driver.username, status: null };
          }
        });
        
        const statusResults = await Promise.all(statusPromises);
        const statusMap = statusResults.reduce((acc, result) => {
          acc[result.username] = result.status;
          return acc;
        }, {} as {[key: string]: any});
        
        setDriverStatuses(statusMap);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleDriverSelection = (username: string) => {
    const newSelected = new Set(selectedDrivers);
    if (newSelected.has(username)) {
      newSelected.delete(username);
    } else {
      // Only allow selection if we haven't reached the truck limit
      if (newSelected.size < availableTrucks.length) {
        newSelected.add(username);
      }
    }
    setSelectedDrivers(newSelected);
  };

  const toggleDriverExpansion = (username: string) => {
    const newExpanded = new Set(expandedDrivers);
    if (newExpanded.has(username)) {
      newExpanded.delete(username);
    } else {
      newExpanded.add(username);
    }
    setExpandedDrivers(newExpanded);
  };

  const handleStartJourney = async () => {
    // Check if there are any unassigned packages
    const unassignedPackages = todaysPackages.filter(pkg => pkg.status === 'pending');
    if (unassignedPackages.length === 0) {
      Alert.alert(
        'All Packages Assigned',
        'All packages are already assigned to drivers.',
        [{ text: 'OK' }]
      );
      return;
    }
    try {
      // Check driver status before starting journey
      const driverStatusChecks = await Promise.all(
        Array.from(selectedDrivers).map(async (driverUsername) => {
          try {
            const status = await checkDriverStatus(driverUsername);
            return { username: driverUsername, status };
          } catch (error) {
            console.error(`Error checking status for ${driverUsername}:`, error);
            return { username: driverUsername, status: null };
          }
        })
      );

      // Check for drivers with active routes or completed packages
      const problematicDrivers = driverStatusChecks.filter(
        check => check.status && (check.status.status === 'active' || check.status.status === 'completed' || check.status.status === 'completed_today')
      );

      if (problematicDrivers.length > 0) {
        const driverMessages = problematicDrivers.map(driver => {
          const status = driver.status;
          return `${driver.username}: ${status.message}`;
        });

        Alert.alert(
          'Driver Status Issue',
          `The following drivers cannot be assigned new routes:\n\n${driverMessages.join('\n')}`,
          [{ text: 'OK' }]
        );
        return;
      }

      // Instead of modal, navigate to AssignTrucksScreen
      router.push({
        pathname: '/(tabs)/assignTrucks',
        params: {
          selectedDrivers: JSON.stringify(employees.filter(e => selectedDrivers.has(e.username))),
          availableTrucks: JSON.stringify(availableTrucks),
        },
      });
    } catch (error) {
      console.error('Error starting journey:', error);
      
      // Show specific error message for driver already has active route
      if (error instanceof Error && error.message.includes('already has an active route')) {
        Alert.alert(
          'Route Assignment Error',
          'One or more selected drivers already have active routes. Please check driver status before assigning new routes.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Error',
          error instanceof Error ? error.message : 'An unexpected error occurred while starting the journey.',
          [{ text: 'OK' }]
        );
      }
    }
  };

  const handleAssignTruck = async (truckLicensePlate: string) => {
    const driverUsername = Array.from(selectedDrivers)[currentDriverIndex];
    const route = plannedRoutes.find(r => r.driverUsername === driverUsername);

    if (!route) {
        Alert.alert('Error', `Could not find a route for ${driverUsername}.`);
        setIsModalVisible(false);
        return;
    }

    try {
        await assignTruckAndStartJourney(
            driverUsername,
            truckLicensePlate,
            route.route.map((wp: any) => wp.package_info),
            route.route.flatMap((wp: any) => wp.route)
        );

        setAvailableTrucks(availableTrucks.filter(t => t.licensePlate !== truckLicensePlate));

        if (currentDriverIndex < selectedDrivers.size - 1) {
            setCurrentDriverIndex(currentDriverIndex + 1);
        } else {
            setIsModalVisible(false);
            router.push({
                pathname: '/(tabs)/adminTruckTracker',
            });
        }
    } catch (error) {
        console.error('Error assigning truck:', error);
        Alert.alert('Error', error instanceof Error ? error.message : 'An unexpected error occurred.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.color.white }]}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
            <View style={[styles.modalContent, { backgroundColor: theme.color.white }]}>
                <TouchableOpacity onPress={() => setIsModalVisible(false)} style={styles.backButton}>
                  <MaterialIcons name="arrow-back" size={24} color={theme.color.darkPrimary} />
                  <Text style={{color: theme.color.darkPrimary, marginLeft: 8}}>Back</Text>
                </TouchableOpacity>
                <Text style={[styles.modalTitle, { color: theme.color.black }]}>
                    Assign Truck to {Array.from(selectedDrivers)[currentDriverIndex]}
                </Text>
                <ScrollView>
                    {availableTrucks.map(truck => (
                        <TouchableOpacity
                            key={truck.licensePlate}
                            style={[styles.truckItem, { borderBottomColor: theme.color.lightGrey }]}
                            onPress={() => handleAssignTruck(truck.licensePlate)}
                        >
                            <Text style={{color: theme.color.black}}>{truck.licensePlate}</Text>
                            <Text style={{color: theme.color.darkPrimary}}>{truck.kilogramCapacity} kg</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        </View>
      </Modal>

      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.color.black }]}>Start Journey</Text>
        <Text style={[styles.subtitle, { color: theme.color.lightGrey }]}>
          Select up to {availableTrucks.length} drivers
        </Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.mainStats}>
          <View style={[styles.statCard, { backgroundColor: theme.color.white }]}>
            <MaterialIcons name="local-shipping" size={24} color={theme.color.mediumPrimary} />
            <Text style={[styles.statNumber, { color: theme.color.black }]}>{availableTrucks.length}</Text>
            <Text style={[styles.statLabel, { color: theme.color.black }]}>Available Trucks</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.color.white }]}>
            <MaterialIcons name="inventory" size={24} color={theme.color.mediumPrimary} />
            <Text style={[styles.statNumber, { color: theme.color.black }]}>{todaysPackages.length}</Text>
            <Text style={[styles.statLabel, { color: theme.color.black }]}>Today's Packages</Text>
          </View>
        </View>
        <View style={[styles.recommendedCard, { backgroundColor: theme.color.white }]}>
          <MaterialIcons name="recommend" size={20} color={theme.color.mediumPrimary} />
          <Text style={[styles.recommendedText, { color: theme.color.black }]}>
            Recommended number of trucks and employees: {recommendedCount}
          </Text>
        </View>
      </View>

      <View style={[styles.searchContainer, { backgroundColor: theme.color.white }]}>
        <MaterialIcons name="search" size={24} color={theme.color.lightGrey} />
        <TextInput
          style={[styles.searchInput, { color: theme.color.black }]}
          placeholder="Search drivers..."
          placeholderTextColor={theme.color.lightGrey}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <MaterialIcons name="close" size={24} color={theme.color.lightGrey} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView 
        style={styles.driverList}
        contentContainerStyle={styles.driverListContent}
      >
        {filteredDrivers.map((driver) => (
          <DriverItem
            key={driver.username}
            driver={driver}
            isSelected={selectedDrivers.has(driver.username)}
            onSelect={() => toggleDriverSelection(driver.username)}
            isExpanded={expandedDrivers.has(driver.username)}
            onToggleExpand={() => toggleDriverExpansion(driver.username)}
            isDisabled={!selectedDrivers.has(driver.username) && selectedDrivers.size >= availableTrucks.length}
            driverStatus={driverStatuses[driver.username]}
          />
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.startButton,
            { 
              backgroundColor: selectedDrivers.size > 0 
                ? theme.color.darkPrimary 
                : theme.color.lightGrey 
            }
          ]}
          onPress={handleStartJourney}
          disabled={selectedDrivers.size === 0}
        >
          <MaterialIcons name="play-arrow" size={24} color="#FFF" />
          <Text style={styles.startButtonText}>
            Start Journey ({selectedDrivers.size})
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  driverList: {
    flex: 1,
  },
  driverListContent: {
    padding: 20,
  },
  driverItem: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  driverHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  driverTextContainer: {
    flexDirection: 'column',
  },
  driverName: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  expandedContent: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  startButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 20,
    marginVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f5f5f5',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
    marginLeft: 8,
  },
  statsContainer: {
    padding: 16,
  },
  mainStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  recommendedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  recommendedText: {
    fontSize: 14,
    flex: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    borderRadius: 10,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  truckItem: {
    padding: 15,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
}); 