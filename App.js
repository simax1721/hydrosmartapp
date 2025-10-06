import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

import LoginScreen from './pages/screens/LoginScreen';
import DrawerNavigator from './pages/navigation/DrawerNavigator';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Dengarkan status login
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return null; // atau loading spinner

  return (
    <NavigationContainer>
      {user ? <DrawerNavigator /> : <LoginScreen />}
    </NavigationContainer>
  );
}
