// timemanager/context/ThemeContext.tsx
import { THEME } from "@constants/theme";
import { createContext, useContext, useState, type ReactNode } from "react";

// Define the shape of the ThemeContext
type ThemeContextType = {
  theme: typeof THEME.light; // Specifies that 'theme' follows the structure of THEME.light
  toggleTheme: () => void; // Function to toggle between themes
};

// Create the ThemeContext with an undefined default value
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Custom hook to use the ThemeContext
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

// Define props for the ThemeProvider
interface ThemeProviderProps {
  children: ReactNode;
}

// ThemeProvider component that wraps the application and provides theme context
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<typeof THEME.light>(THEME.light); // Initialize with light theme

  // Function to toggle between light and dark themes
  const toggleTheme = () => {
    setTheme((prevTheme) =>
      prevTheme === THEME.light ? THEME.dark : THEME.light,
    );
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
