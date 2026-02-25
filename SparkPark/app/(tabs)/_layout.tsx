import { Tabs } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { MapPin, Ticket, Menu } from "lucide-react-native";

export default function TabLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { backgroundColor: "#fff", borderTopColor: "#e5e7eb" },
          tabBarActiveTintColor: "#166534",
          tabBarInactiveTintColor: "#6b7280",
          tabBarLabelStyle: { fontSize: 12, fontWeight: "500" },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Hitta",
            tabBarIcon: ({ color, size }) => <MapPin size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="parking"
          options={{
            title: "Biljetter",
            tabBarIcon: ({ color, size }) => <Ticket size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="menu"
          options={{
            title: "Mer",
            tabBarIcon: ({ color, size }) => <Menu size={size} color={color} />,
          }}
        />
      </Tabs>
    </GestureHandlerRootView>
  );
}
