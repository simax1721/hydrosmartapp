import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import MonitoringScreen from '../screens/MonitoringScreen';
import KontrolScreen from '../screens/KontrolScreen';
import GrafikScreen from '../screens/GrafikScreen';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName = 'home';

          if (route.name === 'Monitoring') iconName = 'speedometer-outline';
          else if (route.name === 'Kontrol') iconName = 'toggle-outline';
          else if (route.name === 'Grafik') iconName = 'bar-chart-outline';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'teal',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Monitoring" component={MonitoringScreen} />
      <Tab.Screen name="Kontrol" component={KontrolScreen} />
      <Tab.Screen name="Grafik" component={GrafikScreen} />
    </Tab.Navigator>
  );
}
