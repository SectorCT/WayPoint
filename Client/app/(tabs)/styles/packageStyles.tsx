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
  });
}
