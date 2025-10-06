import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then(userCredential => {
        const user = userCredential.user;
        Alert.alert('Login sukses', `Selamat datang ${user.email}`);
        // navigation.replace('Beranda'); // ganti ke halaman utama
      })
      .catch(error => {
        Alert.alert('Login gagal', error.message);
      });
  };

  return (
     <View style={styles.container}>
      <Text style={styles.title}>HydroSmart</Text>

      <Text style={styles.label}>Email</Text>
      <TextInput
        placeholder="Masukkan email"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <Text style={styles.label}>Password</Text>
      <TextInput
        placeholder="Masukkan password"
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <View style={{ marginTop: 20 }}>
        <Button style={styles.button} title="Masuk" onPress={handleLogin} color="#0E7490" />
      </View>
    </View>

    // <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    //   <Text style={{ fontSize: 24, marginBottom: 20 }}>Login HydroSmart</Text>
    //   <Text>Email</Text>
    //   <TextInput
    //     style={{ borderWidth: 1, padding: 10, marginBottom: 10, width:  }}
    //     value={email}
    //     onChangeText={setEmail}
    //     autoCapitalize="none"
    //   />
    //   <Text>Password</Text>
    //   <TextInput
    //     style={{ borderWidth: 1, padding: 10, marginBottom: 20 }}
    //     value={password}
    //     onChangeText={setPassword}
    //     secureTextEntry
    //   />
    //   <Button title="Login" onPress={handleLogin} />
    // </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center', // Tengah secara vertikal
    alignItems: 'center',     // Tengah secara horizontal
    paddingHorizontal: 50,
    backgroundColor: '#f8fafc',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#0E7490', // warna biru toska
  },
  label: {
    alignSelf: 'flex-start',
    marginBottom: 5,
    marginTop: 10,
    color: '#1e293b',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },

  button: {
    width: '100%',
  },
});
