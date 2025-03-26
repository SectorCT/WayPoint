import { StyleSheet, Platform } from "react-native";
import { useTheme } from "@context/ThemeContext";

export default function useStyles() {
  const { theme } = useTheme();

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.color.white,
    },
    scrollContent: {
      padding: 16,
      flexGrow: 0,
    },
    headerContainer: {
      marginTop: 12,
      marginBottom: 16,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    headerTextContainer: {
      flex: 1,
      marginRight: 12,
    },
    headerTitle: {
      fontSize: 24,
      fontFamily: theme.font.semibold,
      marginBottom: 8,
      color: theme.color.black,
      lineHeight: 30,
    },
    headerSubtitle: {
      fontSize: 14,
      lineHeight: 20,
      color: theme.color.lightGrey,
      fontFamily: theme.font.regular,
    },
    addressContainer: {
      flexDirection: "row",
      alignItems: "flex-end",
    },
    mapButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
      marginLeft: 8,
      marginBottom: 8,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    locationText: {
      fontSize: 12,
      color: theme.color.lightGrey,
      marginTop: -8,
      marginBottom: 12,
      marginLeft: 8,
    },
    buttonContainer: {
      padding: 12,
      paddingBottom: Platform.OS === 'ios' ? 12 : 16,
      backgroundColor: theme.color.white,
      borderTopWidth: 1,
      borderTopColor: theme.color.lightGrey,
    },
    iconContainer: {
      width: 48,
      height: 48,
      justifyContent: "center",
      alignItems: "center",
      opacity: 0.8,
    },
    formContainer: {
      marginBottom: 4,
    },
  });
} 