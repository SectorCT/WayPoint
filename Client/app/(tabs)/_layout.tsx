import { Tabs } from "expo-router";
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@context/ThemeContext';

export default function TabLayout() {
  const { theme } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.color.darkPrimary,
        tabBarInactiveTintColor: 'rgba(0, 0, 0, 0.6)',
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="packages"
        options={{
          title: "Packages",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="add-box" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="styles/homeStyles" options={{ href: null }} />
    </Tabs>
  );
} 