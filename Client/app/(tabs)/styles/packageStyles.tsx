import { StyleSheet } from "react-native";
import { useTheme } from "@context/ThemeContext";

export default function useStyles() {
  const { theme } = useTheme();

  return StyleSheet.create({
    container: {
      flex: 1,
      overflow: "visible",
      backgroundColor: theme.color.white,
      marginTop: 0,
    },
    headerContainer: {
      paddingHorizontal: 20,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      width: "100%",
      gap: 10,
      zIndex: 2,
      backgroundColor: theme.color.white,
      paddingBottom: 20,
      opacity: 1,
      borderBottomWidth: 0.5,
      borderBottomColor: theme.color.lightGrey,
    },
    headerContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
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
    buttonContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    title: {
      fontSize: theme.fontSize.extraExtraLarge,
      fontFamily: theme.font.medium,
      color: theme.color.black,
      lineHeight: 44,
      marginTop: 0,
      flexWrap: "wrap",
      flex: 1,
    },
    titleContainer: {},
    inner: {
      marginTop: 20,
    },
    topFill: {
      top: 0,
      left: 0,
      right: 0,
      position: "absolute",
      flex: 1,
      backgroundColor: theme.color.white,
      height: 70,
      zIndex: 1,
    },
    outer: {
      flex: 1,
    },
    sectionHeader: {
      fontSize: theme.fontSize.mediumLarge,
      fontFamily: theme.font.medium,
      marginBottom: 7,
    },
    overdueHeader: {
      color: "red", // Red color for overdue packages
    },
    emptyStateContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 20,
    },
    emptyStateText: {
      fontSize: theme.fontSize.large,
      fontFamily: theme.font.medium,
      color: theme.color.black,
      marginBottom: 8,
    },
    emptyStateSubtext: {
      fontSize: theme.fontSize.medium,
      fontFamily: theme.font.regular,
      color: theme.color.lightGrey,
    },
  });
}
