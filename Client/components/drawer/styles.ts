import { StyleSheet } from 'react-native';

export default function useStyles() {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    drawerContainer: {
      flex: 1,
    },
    drawerHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 40,
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
      
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