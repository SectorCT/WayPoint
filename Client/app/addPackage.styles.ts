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
      padding: 20,
      paddingBottom: 40,
    },
    headerContainer: {
      marginTop: 20,
      marginBottom: 24,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    headerTextContainer: {
      flex: 1,
      marginRight: 16,
    },
    headerTitle: {
      fontSize: 28,
      fontFamily: theme.font.semibold,
      marginBottom: 12,
      color: theme.color.black,
      lineHeight: 34,
    },
    headerSubtitle: {
      fontSize: 15,
      lineHeight: 22,
      color: theme.color.lightGrey,
      fontFamily: theme.font.regular,
    },
    addressContainer: {
      flexDirection: "row",
      alignItems: "flex-end",
    },
    mapButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
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
      marginTop: -12,
      marginBottom: 16,
      marginLeft: 8,
    },
    buttonContainer: {
      padding: 16,
      paddingBottom: Platform.OS === 'ios' ? 16 : 24,
      backgroundColor: theme.color.white,
      borderTopWidth: 1,
      borderTopColor: theme.color.lightGrey,
    },
    iconContainer: {
      width: 64,
      height: 64,
      justifyContent: "center",
      alignItems: "center",
      opacity: 0.8,
    },
    formContainer: {
      flex: 1,
    },
  });
} 