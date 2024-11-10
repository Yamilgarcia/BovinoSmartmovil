import { initializeApp } from 'firebase/app';
import { getFirestore as realGetFirestore } from 'firebase/firestore';
import { initializeAuth as realInitializeAuth, getReactNativePersistence } from 'firebase/auth';
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

// Si Jest está ejecutando el archivo, usará mocks en lugar de la implementación real
const getFirestore = typeof jest === 'undefined' ? realGetFirestore : jest.fn(() => ({}));
const initializeAuth = typeof jest === 'undefined' ? realInitializeAuth : jest.fn(() => ({}));

// Inicializa Firestore
const db = getFirestore(app);

// Inicializa Auth con persistencia de AsyncStorage
const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
});

export { db, auth };
