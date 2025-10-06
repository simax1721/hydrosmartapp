// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
// import messaging from '@react-native-firebase/messaging';
import { getDatabase, ref, set, onValue, push } from 'firebase/database';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDAxT3D-8hc1rLohWx0FKhfQwYqVPQkCz0",
  authDomain: "hydrosmart-6aab6.firebaseapp.com",
  databaseURL: "https://hydrosmart-6aab6-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "hydrosmart-6aab6",
  storageBucket: "hydrosmart-6aab6.firebasestorage.app",
  messagingSenderId: "484083072505",
  appId: "1:484083072505:web:0469bd785053eca0fd1128",
  measurementId: "G-2RNJ9RNERH"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);


const auth = getAuth(app);
const db = getDatabase(app);

export { auth, db, ref, set, onValue, push };
// export { auth, db, ref, set, onValue, push, messaging };

