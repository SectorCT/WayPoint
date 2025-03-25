import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, TextInput, FlatList } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@context/ThemeContext';
import { getAvailableTrucks, getPackages, getEmployees, startJourney } from '../utils/journeyApi';
import moment from 'moment';
import { router } from 'expo-router';
import useStyles from "./startJourney.styles";
import { LinearGradient } from 'expo-linear-gradient';

interface DriverItemProps {
  driver: User;
  isSelected: boolean;
  onSelect: () => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  isDisabled: boolean;
}

const DriverItem: React.FC<DriverItemProps> = ({
  driver,
  isSelected,
  onSelect,
  isExpanded,
  onToggleExpand,
  isDisabled,
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

  return (
    <Animated.View 
      style={[
        styles.driverItem, 
        { 
          maxHeight,
          backgroundColor: theme.color.white,
          borderColor: isSelected ? theme.color.darkPrimary : theme.color.lightGrey,
          opacity: isDisabled ? 0.5 : 1,
        }
      ]}
    >
      <TouchableOpacity 
        style={styles.driverHeader} 
        onPress={onToggleExpand}
        disabled={isDisabled}
      >
        <View style={styles.driverInfo}>
          <MaterialIcons 
            name="person" 
            size={24} 
            color={isDisabled ? theme.color.lightGrey : theme.color.darkPrimary} 
          />
          <Text style={[
            styles.driverName, 
            { color: isDisabled ? theme.color.lightGrey : theme.color.black }
          ]}>
            {driver.username}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={[
              styles.selectButton,
              { 
                backgroundColor: isSelected ? theme.color.darkPrimary : 'transparent',
                opacity: isDisabled ? 0.5 : 1,
              }
            ]}
            onPress={onSelect}
            disabled={isDisabled}
          >
            <MaterialIcons 
              name={isSelected ? "check" : "add"} 
              size={20} 
              color={isSelected ? "#FFF" : (isDisabled ? theme.color.lightGrey : theme.color.darkPrimary)} 
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

  const styles = useStyles();

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
          return deliveryDate.isSame(moment(), 'day') || deliveryDate.isBefore(moment(), 'day');
        });
        setAvailableTrucks(trucks);
        setTodaysPackages(filteredPackages);
        setEmployees(employeesData);
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
    try {
      const data = await startJourney(Array.from(selectedDrivers));
      router.push({
        pathname: '/(tabs)/adminTruckTracker',
        params: { routes: JSON.stringify(data) }
      });
    } catch (error) {
      console.error('Error starting journey:', error);
    }
  };

  const renderDriverItem = ({ item }: { item: User }) => (
    <View style={styles.driverItem}>
      <View style={styles.driverHeader}>
        <View style={styles.driverInfo}>
          <MaterialIcons name="person" size={24} color="#666" />
          <Text style={styles.driverName}>{item.username}</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={[
              styles.selectButton,
              { borderColor: selectedDrivers.has(item.username) ? theme.color.mediumPrimary : '#ddd' }
            ]}
            onPress={() => toggleDriverSelection(item.username)}
          >
            {selectedDrivers.has(item.username) && (
              <MaterialIcons name="check" size={20} color={theme.color.mediumPrimary} />
            )}
          </TouchableOpacity>
        </View>
      </View>
      {expandedDrivers.has(item.username) && (
        <View style={styles.expandedContent}>
          <View style={styles.detailRow}>
            <MaterialIcons name="phone" size={20} color="#666" />
            <Text style={styles.detailText}>{item.phoneNumber}</Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialIcons name="email" size={20} color="#666" />
            <Text style={styles.detailText}>{item.email}</Text>
          </View>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Start New Journey</Text>
        <Text style={styles.subtitle}>Select a driver to start the journey</Text>
      </View>
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={24} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search drivers..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      <FlatList
        data={filteredDrivers}
        renderItem={renderDriverItem}
        keyExtractor={(item) => item.username}
        contentContainerStyle={styles.driverListContent}
        style={styles.driverList}
      />
      <View style={styles.footer}>
        <LinearGradient
          colors={[theme.color.mediumPrimary, theme.color.darkPrimary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.startButton}
        >
          <TouchableOpacity onPress={handleStartJourney}>
            <Text style={styles.startButtonText}>Start Journey</Text>
          </TouchableOpacity>
        </LinearGradient>
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
}); 