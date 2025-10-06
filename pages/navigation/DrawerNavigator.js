import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import TabNavigator from './TabNavigator';
import NotificationScreen from '../screens/NotificationScreen';
import JadwalScreen from '../screens/JadwalScreen';
import LaporanScreen from '../screens/LaporanScreen';
import LogoutScreen from '../screens/LogoutScreen';
import LoginScreen from '../screens/LoginScreen';


const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={{
        drawerPosition: 'right',
        headerTitle: 'HydroSmart',
        headerTitleAlign: 'center',
      }}
    >
      {/* <Drawer.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} /> */}
      <Drawer.Screen name="Beranda" component={TabNavigator} />
      <Drawer.Screen name="Notifikasi" component={NotificationScreen} />
      <Drawer.Screen name="Jadwal Penyiraman" component={JadwalScreen} />
      <Drawer.Screen name="Laporan" component={LaporanScreen} />
      <Drawer.Screen name="Logout" component={LogoutScreen} />
    </Drawer.Navigator>
  );
}
