import { StyleSheet, Dimensions } from "react-native";
import { useTheme } from "@context/ThemeContext";

export default function useStyles() {
  const { theme } = useTheme();

  return StyleSheet.create({
    container: {
      flex: 1,
    },
    map: {
      width: Dimensions.get('window').width,
      height: Dimensions.get('window').height,
    },
    markerContainer: {
      backgroundColor: 'white',
      borderRadius: 15,
      width: 30,
      height: 30,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: '#000',
    },
    markerContainerDelivered: {
      borderColor: '#4CAF50',
      backgroundColor: '#E8F5E9',
    },
    markerText: {
      color: '#000',
      fontSize: 16,
      fontWeight: 'bold',
    },
    menuButton: {
      position: 'absolute',
      top: 40,
      right: 20,
      width: 50,
      height: 50,
      borderRadius: 25,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    drawerContainer: {
      flex: 1,
    },
    drawerHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
      elevation: 2,
    },
    drawerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
    },
    closeButton: {
      padding: 8,
    },
    routeList: {
      flex: 1,
    },
    routeListContent: {
      padding: 20,
    },
    routeItem: {
      padding: 15,
      borderRadius: 10,
      backgroundColor: '#f5f5f5',
      marginBottom: 10,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 1.41,
    },
    routeHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
      justifyContent: 'space-between',
    },
    driverInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    driverBadge: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10,
    },
    driverText: {
      fontSize: 18,
      fontWeight: 'bold',
      flex: 1,
    },
    progressContainer: {
      marginBottom: 12,
    },
    progressBarBackground: {
      height: 8,
      backgroundColor: '#E0E0E0',
      borderRadius: 4,
      overflow: 'hidden',
      marginBottom: 4,
    },
    progressBarFill: {
      height: '100%',
      borderRadius: 4,
    },
    progressText: {
      fontSize: 14,
      color: '#666',
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    statItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    statText: {
      fontSize: 14,
      color: '#666',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    emptyTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      marginTop: 20,
      marginBottom: 10,
    },
    emptyText: {
      fontSize: 16,
      textAlign: 'center',
      opacity: 0.8,
    },
    userSection: {
      marginBottom: 20,
    },
    callButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 12,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 1.41,
    },
  });
} 