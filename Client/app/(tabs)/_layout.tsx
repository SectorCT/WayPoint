import { Tabs } from "expo-router";
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@context/ThemeContext';

export default function TabLayout() {
  const { theme } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: theme.color.white,
          height: 60,
          borderTopWidth: 1,
          borderTopColor: theme.color.lightPrimary,
        },
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
        name="addPackage"
        options={{
          title: "Add Package",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="add-box" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="styles/homeStyles" options={{ href: null }} />
    </Tabs>
  );
} 
