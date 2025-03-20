// timemanager/constants/theme.tsx
import { FONTS } from "@/constants/fonts";

export const THEME = {
  light: {
    font: FONTS,
    fontSize: {},
    color: {},
    shadow: {
      shadowColor: "#000", // Black shadow
      shadowOpacity: 0.1, // 25% opacity
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowRadius: 13,
    },
    borderRadius: {
      small: 5,
      mediumSmall: 7,
      medium: 8,
      large: 10,
    },
  },
  dark: {
    font: FONTS,
    fontSize: {
      large: 25,
      medium: 18,
      mediumSmall: 20,
      small: 14,
    },
    color: {
      searchBar: {
        background: "#EFEFF0",
        text: "#848488",
      },
      lightGrey: "#FBFBFB",
      mediumGrey: "#EEEEEE",
      black: "#373737",
      red: "#FF0000",
    },
  },
};
