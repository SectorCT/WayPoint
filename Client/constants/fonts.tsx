export const FONTS = {
  regular: "Regular",
  medium: "Medium",
  semibold: "SemiBold",
  bold: "Bold",
} as const;

export type FontVariants = keyof typeof FONTS;
