import React from 'react';
import { View, Text, TouchableOpacity, FlatList, Linking } from 'react-native';
import { MaterialIcons } from "@expo/vector-icons";
import { DrawerLayout } from 'react-native-gesture-handler';
import moment from "moment";
import useStyles from './styles';

interface RouteData {
  user: string;
  dateOfCreation: string;
  packageSequence: any[];
  mapRoute: [number, number][];
}

interface RouteDrawerProps {
  drawerRef: React.RefObject<DrawerLayout>;
  routeData: RouteData[];
  userData: Map<string, any>;
  generateColorFromValue: (value: string) => string;
  onRoutePress: (route: RouteData) => void;
  children: React.ReactNode;
}

export default function RouteDrawer({ drawerRef, routeData, userData, generateColorFromValue, onRoutePress, children }: RouteDrawerProps) {
  const styles = useStyles();

  const renderRouteItem = ({ item }: { item: RouteData }) => (
    <TouchableOpacity 
      style={styles.routeItem}
      onPress={() => onRoutePress(item)}
    >
      <View style={styles.routeHeader}>
        <View style={styles.driverInfo}>
          <View style={[styles.driverBadge, { backgroundColor: generateColorFromValue(item.user) }]}>
            <Text style={styles.driverText}>{item.user[0].toUpperCase()}</Text>
          </View>
          <Text style={styles.driverText}>{item.user}</Text>
        </View>
        <TouchableOpacity 
          style={[styles.callButton, { backgroundColor: generateColorFromValue(item.user) }]}
          onPress={() => Linking.openURL(`tel:${userData.get(item.user)?.phoneNumber}`)}
        >
          <MaterialIcons name="phone" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      <View style={styles.progressContainer}>
        <View style={styles.progressBarBackground}>
          <View 
            style={[
              styles.progressBarFill, 
              { 
                width: `${(item.packageSequence.filter(pkg => pkg.status === 'delivered').length / item.packageSequence.length) * 100}%`,
                backgroundColor: generateColorFromValue(item.user)
              }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {item.packageSequence.filter(pkg => pkg.status === 'delivered').length} / {item.packageSequence.length} packages delivered
        </Text>
      </View>
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <MaterialIcons name="local-shipping" size={16} color="#666" />
          <Text style={styles.statText}>{item.packageSequence.length} packages</Text>
        </View>
        <View style={styles.statItem}>
          <MaterialIcons name="schedule" size={16} color="#666" />
          <Text style={styles.statText}>{moment(item.dateOfCreation).format('h:mm A')}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <DrawerLayout
      ref={drawerRef}
      drawerWidth={300}
      drawerPosition="right"
      drawerType="front"
      drawerBackgroundColor="#FFFFFF"
      renderNavigationView={() => (
        <View style={styles.drawerContainer}>
          <View style={styles.drawerHeader}>
            <Text style={styles.drawerTitle}>Active Routes</Text>
            <TouchableOpacity style={styles.closeButton} onPress={() => drawerRef.current?.closeDrawer()}>
              <MaterialIcons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={routeData}
            renderItem={renderRouteItem}
            keyExtractor={(item) => item.user}
            contentContainerStyle={styles.routeListContent}
            style={styles.routeList}
          />
        </View>
      )}
    >
      {children}
    </DrawerLayout>
  );
} 