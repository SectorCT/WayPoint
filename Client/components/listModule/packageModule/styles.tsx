import { StyleSheet } from "react-native";
import { useTheme } from "@context/ThemeContext";

export default function useStyles() {
  const { theme } = useTheme();

  return StyleSheet.create({
    container: {
      width: "100%",
      minHeight: 90,
      borderRadius: 10,
      backgroundColor: theme.color.white,
      ...theme.shadow,
      elevation: 5,
      padding: 16,
      justifyContent: "space-between",
      borderColor: "#D3D3D3",
      borderWidth: 0.2,
      gap: 4,
      marginBottom: 15,
    },
    firstRow: {
      flexDirection: "row",
      width: "100%",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: 12,
    },
    idContainer: {
      flex: 1,
    },
    title: {
      fontSize: theme.fontSize.large,
      fontFamily: theme.font.semibold,
      marginBottom: 0,
      lineHeight: theme.fontSize.large + 2,
    },
    recipient: {
      fontSize: theme.fontSize.medium,
      fontFamily: theme.font.regular,
      color: theme.color.lightGrey,
      lineHeight: theme.fontSize.medium + 2,
    },
    phoneNumber: {
      fontSize: theme.fontSize.medium,
      fontFamily: theme.font.regular,
      marginLeft: 5,
    },
    secondRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 20,
      marginTop: 2,
    },
    trashIcon: {
      bottom: -5,
    },
    location: {
      flex: 1,
      fontSize: theme.fontSize.medium,
      fontFamily: theme.font.regular,
    },
    trashOuter: {
      justifyContent: "flex-end",
    },
    phoneButton: {
      width: 44,
      height: 44,
      borderRadius: 8,
      justifyContent: "center",
      alignItems: "center",
    },
    phoneIcon: {
      margin: 0,
    },
    statusRow: {
      marginBottom: 2,
      marginLeft: 4,
    },
    statusText: {
      fontSize: 13,
      fontWeight: '600',
      color: '#4A90E2', // blue for visibility, adjust as needed
    },
  });
}
