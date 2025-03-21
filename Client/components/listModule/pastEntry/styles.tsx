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
      gap: 15,
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
  });
}
