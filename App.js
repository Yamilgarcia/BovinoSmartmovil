import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import * as Font from 'expo-font'; // Importa para cargar la fuente

import MainMenuScreen from './src/screens/MainMenuScreen';
import GestionAnimalesScreen from './src/screens/GestionAnimalesScreen';
import RegistroAnimalScreen from './src/screens/RegistroAnimalScreen'; // Importa la pantalla de Registro
import PerfilAnimalScreen from './src/screens/PerfilAnimalScreen'; // Importa la pantalla Perfil

const Stack = createStackNavigator();

export default function App() {
  useEffect(() => {
    const cargarFuentes = async () => {
      await Font.loadAsync({
        'Junge': require('./assets/fonts/Junge-Regular.ttf'), // Asegúrate de que la ruta sea correcta
      });
    };

    cargarFuentes();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="MainMenu">
        <Stack.Screen
          name="MainMenu"
          component={MainMenuScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="GestionAnimales"
          component={GestionAnimalesScreen}
          options={{ title: 'Gestión de Animales' }}
        />
        <Stack.Screen
          name="RegistroAnimal"
          component={RegistroAnimalScreen}
          options={{
            header: (props) => <CustomHeader {...props} />, // Pasa props al header
          }}
        />
        <Stack.Screen
          name="PerfilAnimal"
          component={PerfilAnimalScreen}
          options={{ title: 'Información General del Animal' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Componente de encabezado personalizado
const CustomHeader = ({ navigation }) => {
  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Image source={require('./assets/FlechaRetro.png')} style={styles.backIcon} />
      </TouchableOpacity>
      <View style={styles.oval} />
      <Text style={styles.headerTitle}>Registro de Animal:</Text>
    </View>
  );
};

// Estilos para el encabezado personalizado
const styles = StyleSheet.create({
  headerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  oval: {
    width: 450, // Aumentar el ancho del óvalo
    height: 450, // Aumentar la altura del óvalo
    backgroundColor: '#587A83',
    borderRadius: 200, // Ajustar el radio para que sea un óvalo
    position: 'absolute',
    top: -310, // Ajustar la posición para que no cubra el formulario
    left: -30, // Ajustar según sea necesario
    zIndex: 1, // Asegúrate de que el óvalo esté detrás del texto
    opacity: 1, // Asegúrate de que sea visible
  },
  headerTitle: {
    fontSize: 24,
 
    color: '#fff',
    marginTop: 50, // Ajusta el margen superior para que el texto esté centrado dentro del óvalo
    zIndex: 2, // Asegúrate de que el texto esté encima del óvalo
    fontFamily: 'Junge', // Aplica la fuente Junge

  },
  backButton: {
    position: 'absolute', // Posicionar la flecha en el encabezado
    left: 40, // Ajustar según sea necesario
    top: 55, // Ajustar según sea necesario
    zIndex: 2, // Asegúrate de que el texto esté encima del óvalo
  },
  backIcon: {
    width: 30, // Ajusta el tamaño de la flecha
    height: 24,
  },
});
