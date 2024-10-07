// firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Tu configuración de Firebase (encontrada en Firebase Console)
const firebaseConfig = {
    apiKey: "AIzaSyCKIwabfMp6Z-fBNO-Y8EvrPXLYXgXRgVg",
    authDomain: "bdbovinomovil.firebaseapp.com",
    projectId: "bdbovinomovil",
    storageBucket: "bdbovinomovil.appspot.com",
    messagingSenderId: "660939671774",
    appId: "1:660939671774:web:7b818a804910175a361a4f",
    measurementId: "G-2M576R15RT"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Inicializa Firestore y la autenticación
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
