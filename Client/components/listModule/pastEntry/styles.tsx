import { StyleSheet } from "react-native";
import { useTheme } from "@context/ThemeContext";

export default function useStyles() {
  const { theme } = useTheme();

  return StyleSheet.create({
    container: {
      width: "100%",
      borderRadius: 16,
      backgroundColor: theme.color.white,
      padding: 16,
      ...theme.shadow,
      elevation: 2,
      gap: 16,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    dateText: {
      fontSize: theme.fontSize.large,
      fontFamily: theme.font.semibold,
      color: theme.color.black,
    },
    statusContainer: {
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 16,
      backgroundColor: theme.color.lightGrey,
    },
    statusText: {
      fontSize: theme.fontSize.medium,
      fontFamily: theme.font.medium,
      color: theme.color.black,
    },
    statsContainer: {
      marginTop: 8,
      gap: 4,
    },
    deleteButton: {
      position: "absolute",
      bottom: 16,
      right: 16,
      padding: 8,
    },
    status: {
      fontFamily: theme.font.regular,
      fontSize: theme.fontSize.medium,
    },
    title: {
      fontSize: theme.fontSize.large,
      fontFamily: theme.font.semibold,
      flex: 1,
    },
    secondColumn: {
      flex: 1,
      justifyContent: "space-between",
    },
    firstRow: {
      flexDirection: "row",
      width: "100%",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 20,
      alignSelf: "flex-start",
    },
    rowStat: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 6,
      marginBottom: 2,
    },
    iconContainer: {
      width: 24,
      height: 24,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 8,
    },
    deliveredText: {
      fontSize: theme.fontSize.medium,
      fontFamily: theme.font.semibold,
      color: theme.color.black,
      flex: 1,
    },
    undeliveredText: {
      fontSize: theme.fontSize.medium,
      fontFamily: theme.font.semibold,
      color: "#FF6B6B",
      flex: 1,
    },
    kgBadgeDelivered: {
      backgroundColor: "#F5D8FC",
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 2,
      marginLeft: 8,
      minWidth: 48,
      alignItems: "center",
    },
    kgBadgeUndelivered: {
      backgroundColor: "#FFE6E6",
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 2,
      marginLeft: 8,
      minWidth: 48,
      alignItems: "center",
    },
    kgBadgeText: {
      fontSize: theme.fontSize.medium,
      fontFamily: theme.font.medium,
      color: theme.color.black,
    },
    truckText: {
      fontSize: theme.fontSize.medium,
      fontFamily: theme.font.medium,
      color: theme.color.lightGrey,
      marginTop: 2,
    },
    undeliveredContainer: {
      borderLeftWidth: 4,
      borderLeftColor: "#FF6B6B",
      backgroundColor: "#FFF5F5",
    },
    undeliveredTitle: {
      color: "#FF6B6B",
    },
    typeText: {
      fontSize: theme.fontSize.medium,
      fontFamily: theme.font.medium,
      color: theme.color.lightGrey,
      marginTop: 4,
    },
  });
}
