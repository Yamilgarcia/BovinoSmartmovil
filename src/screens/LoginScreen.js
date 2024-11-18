import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, Modal } from 'react-native';
import LottieView from 'lottie-react-native';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../conection/firebase';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [animationType, setAnimationType] = useState(null); // 'happy' o 'angry'
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false); // Controla si se muestra la animación grande

  const handleLoginOrRegister = () => {
    setAnimationType(null); // Reinicia la animación para que pueda cargarse de nuevo
    setErrorMessage(''); // Limpia cualquier mensaje de error previo

    if (isRegister) {
      if (password !== confirmPassword) {
        setAnimationType('angry');
        setErrorMessage('Las contraseñas no coinciden.');
        return;
      }

      createUserWithEmailAndPassword(auth, email, password)
        .then(() => {
          setAnimationType('happy');
          setLoading(true); // Activa la animación grande solo si es exitoso
          setTimeout(() => {
            Alert.alert("Cuenta creada", "Cuenta creada con éxito, por favor inicie sesión.");
            setIsRegister(false);
            setLoading(false);
          }, 2000);
        })
        .catch((error) => {
          setAnimationType('angry');
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
          setErrorMessage(errorMessage);
        });
    } else {
      signInWithEmailAndPassword(auth, email, password)
        .then(() => {
          setAnimationType('happy');
          setLoading(true); // Activa la animación grande solo si es exitoso
          setTimeout(() => {
            navigation.navigate('MainMenu');
            setLoading(false);
          }, 2000);
        })
        .catch(() => {
          setAnimationType('angry');
          setErrorMessage('Correo o contraseña incorrectos.');
        });
    }
  };

  return (
    <View style={styles.container}>
      {/* Animación grande en el centro mientras carga */}
      <Modal visible={loading} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <LottieView
            source={require('../../assets/animaciones/vacafeliz.json')}
            autoPlay
            loop={false}
            style={styles.modalAnimation}
          />
        </View>
      </Modal>

      <Image
        source={require('../../assets/iconos/logologin.png')}
        style={styles.logo}
      />

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

        {animationType && !loading && ( // Solo mostrar si no está cargando la animación grande
          <View style={styles.feedbackContainer}>
            <LottieView
              source={
                animationType === 'happy'
                  ? require('../../assets/animaciones/vacafeliz.json')
                  : require('../../assets/animaciones/vacaenojada.json')
              }
              autoPlay
              loop={false}
              style={styles.animation}
              onAnimationFinish={() => {
                // Restablece la animación y el mensaje al terminar
                setAnimationType(null);
                setErrorMessage('');
              }}
            />
            {errorMessage ? (
              <Text style={styles.feedbackText}>{errorMessage}</Text>
            ) : null}
          </View>
        )}

        <TouchableOpacity style={styles.button} onPress={handleLoginOrRegister}>
          <Text style={styles.buttonText}>{isRegister ? 'Crear Cuenta' : 'Iniciar Sesión'}</Text>
        </TouchableOpacity>
      </View>

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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalAnimation: {
    width: 200,
    height: 200,
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
    position: 'relative',
  },
  logo: {
    width: 120,
    height: 120,
    position: 'absolute',
    top: 40,
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
  feedbackContainer: {
    alignItems: 'center',
    marginVertical: 15,
  },
  animation: {
    width: 80,
    height: 80,
  },
  feedbackText: {
    marginTop: 10,
    fontSize: 14,
    color: '#FF0000',
    textAlign: 'center',
  },
});
