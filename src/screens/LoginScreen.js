import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import LottieView from 'lottie-react-native';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../conection/firebase';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [showHappyCow, setShowHappyCow] = useState(false);
  const [showSadCow, setShowSadCow] = useState(false);

  const handleLoginOrRegister = () => {
    if (isRegister) {
      if (password !== confirmPassword) {
        setShowSadCow(true);
        setTimeout(() => setShowSadCow(false), 2000);
        Alert.alert("Error", "Las contraseñas no coinciden.");
        return;
      }
  
      createUserWithEmailAndPassword(auth, email, password)
        .then(() => {
          setShowHappyCow(true);
          setTimeout(() => {
            setShowHappyCow(false);
            Alert.alert("Cuenta creada", "Cuenta creada con éxito, por favor inicie sesión.");
            setIsRegister(false);
          }, 2000);
        })
        .catch((error) => {
          setShowSadCow(true);
          setTimeout(() => setShowSadCow(false), 2000);
  
          let errorMessage;
          switch (error.code) {
            case 'auth/email-already-in-use':
              errorMessage = 'Este correo ya está registrado.';
              break;
            case 'auth/invalid-email':
              errorMessage = 'El correo ingresado no es válido.';
              break;
            case 'auth/weak-password':
              errorMessage = 'La contraseña es demasiado débil. Debe tener al menos 6 caracteres.';
              break;
            default:
              errorMessage = 'Hubo un problema al crear la cuenta. Inténtalo de nuevo.';
          }
  
          Alert.alert('Error', errorMessage);
        });
    } else {
      signInWithEmailAndPassword(auth, email, password)
        .then(() => {
          setShowHappyCow(true);
          setTimeout(() => {
            setShowHappyCow(false);
            navigation.navigate('MainMenu'); // Cambiado a 'MainMenu'
          }, 2000);
        })
        .catch(() => {
          setShowSadCow(true);
          setTimeout(() => setShowSadCow(false), 2000);
          Alert.alert("Error", "Correo o contraseña incorrectos.");
        });
    }
  };
  
  return (
    <View style={styles.container}>
      {showHappyCow && (
        <LottieView
          source={{ uri: 'https://assets4.lottiefiles.com/packages/lf20_sudxt0xt.json' }}
          autoPlay
          loop={false}
          style={styles.animation}
        />
      )}
      {showSadCow && (
        <LottieView
          source={{ uri: 'https://assets9.lottiefiles.com/packages/lf20_q5pk6p1k.json' }}
          autoPlay
          loop={false}
          style={styles.animation}
        />
      )}

      {!showHappyCow && !showSadCow && (
        <View style={styles.formContainer}>
          <Text style={styles.title}>{isRegister ? "Crear Cuenta" : "Iniciar Sesión"}</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Correo electrónico"
              placeholderTextColor="#A9A9A9"
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              secureTextEntry
              placeholderTextColor="#A9A9A9"
              value={password}
              onChangeText={setPassword}
            />
            {isRegister && (
              <TextInput
                style={styles.input}
                placeholder="Confirmar Contraseña"
                secureTextEntry
                placeholderTextColor="#A9A9A9"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            )}
          </View>
          <TouchableOpacity style={styles.button} onPress={handleLoginOrRegister}>
            <Text style={styles.buttonText}>{isRegister ? 'Crear Cuenta' : 'Iniciar Sesión'}</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.linkText}>
        {isRegister ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}{' '}
        <Text style={styles.link} onPress={() => setIsRegister(!isRegister)}>
          {isRegister ? 'Iniciar Sesión' : 'Crear cuenta'}
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F5E3',
    padding: 20,
  },
  formContainer: {
    width: '90%',
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderRadius: 10,
    padding: 15,
    backgroundColor: '#FFF',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 20,
  },
  inputContainer: {
    width: '100%',
    marginVertical: 15,
  },
  input: {
    width: '100%',
    padding: 15,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 5,
    backgroundColor: '#F8F8F8',
  },
  button: {
    width: '100%',
    padding: 15,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkText: {
    marginTop: 20,
    color: '#4CAF50',
  },
  link: {
    fontWeight: 'bold',
    color: '#388E3C',
  },
  animation: {
    width: 200,
    height: 200,
  },
});
