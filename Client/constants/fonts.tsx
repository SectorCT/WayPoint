export const FONTS = {
  regular: "SF-Pro-Text-Regular",
  medium: "SF-Pro-Text-Medium",
  semibold: "SF-Pro-Text-Semibold",
  bold: "SF-Pro-Text-Bold",
} as const;

export type FontVariants = keyof typeof FONTS;
