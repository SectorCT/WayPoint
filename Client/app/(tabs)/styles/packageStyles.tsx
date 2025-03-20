import { StyleSheet } from "react-native";
import { useTheme } from "@context/ThemeContext";

export default function useStyles() {
  const { theme } = useTheme();

  return StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      paddingTop: 60,
      backgroundColor: "#FFFFFF",
    },
    headerContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      width: "100%",
      gap: 10,
    },
    title: {
      fontSize: theme.fontSize.extraExtraLarge,
      fontFamily: theme.font.medium,
      color: theme.color.black,
      lineHeight: 44,
      marginTop: 0,
      flexWrap: "wrap",
    },
    titleContainer: {},
  });
}
