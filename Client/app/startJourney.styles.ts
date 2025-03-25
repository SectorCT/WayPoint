import { StyleSheet } from "react-native";
import { useTheme } from "@context/ThemeContext";

export default function useStyles() {
  const { theme } = useTheme();

  return StyleSheet.create({
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
} 