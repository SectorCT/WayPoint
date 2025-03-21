import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@context/ThemeContext';
import { testDriverData } from '../testDriverData';

interface DriverItemProps {
  driver: User;
  isSelected: boolean;
  onSelect: () => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const DriverItem: React.FC<DriverItemProps> = ({
  driver,
  isSelected,
  onSelect,
  isExpanded,
  onToggleExpand,
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
        }
      ]}
    >
      <TouchableOpacity 
        style={styles.driverHeader} 
        onPress={onToggleExpand}
      >
        <View style={styles.driverInfo}>
          <MaterialIcons 
            name="person" 
            size={24} 
            color={theme.color.darkPrimary} 
          />
          <Text style={[styles.driverName, { color: theme.color.black }]}>
            {driver.username}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={[
              styles.selectButton,
              { backgroundColor: isSelected ? theme.color.darkPrimary : 'transparent' }
            ]}
            onPress={onSelect}
          >
            <MaterialIcons 
              name={isSelected ? "check" : "add"} 
              size={20} 
              color={isSelected ? "#FFF" : theme.color.darkPrimary} 
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

  const filteredDrivers = testDriverData.filter(driver =>
    driver.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleDriverSelection = (username: string) => {
    const newSelected = new Set(selectedDrivers);
    if (newSelected.has(username)) {
      newSelected.delete(username);
    } else {
      newSelected.add(username);
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

  const handleStartJourney = () => {
    console.log('Starting journey with drivers:', Array.from(selectedDrivers));
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.color.white }]}>
      <View style={[styles.header, { backgroundColor: theme.color.white }]}>
        <Text style={[styles.title, { color: theme.color.black }]}>Start New Journey</Text>
        <Text style={[styles.subtitle, { color: theme.color.lightGrey }]}>
          Select drivers to begin their routes
        </Text>
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
}); 