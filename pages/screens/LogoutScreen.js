import React from 'react';
import { View, Text, Button } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';

export default function LogoutScreen() {
  const handleLogout = () => {
    signOut(auth).catch((error) => {
      console.log('Gagal logout:', error);
    });
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Yakin ingin logout?</Text>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
}
