import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import * as Font from 'expo-font';

// Importar las pantallas
import LoginScreen from './src/screens/LoginScreen';
import MainMenuScreen from './src/navegation/MainMenuScreen';
import GestionAnimalesScreen from './src/screens/GestionAnimalesScreen';
import RegistroAnimalScreen from './src/screens/RegistroAnimalScreen';
import PerfilAnimalScreen from './src/screens/PerfilAnimalScreen';
import GraficoAnimalesScreen from './src/screens/GraficoAnimalesScreen';
import GestionEnfermedadesScreen from './src/screens/GestionEnfermedadesScreen';
import RegistroEnfermedadScreen from './src/screens/RegistroEnfermedadScreen';
import PerfilEnfermedadScreen from './src/screens/PerfilEnfermedadScreen';
import IAScreen from './src/screens/IAScreen';
import EscanerQR from './src/screens/EscanerQR';
import RegistroProductoScreen from './src/screens/RegistroProductoScreen';
import GestionProductosScreen from './src/screens/GestionProductosScreen';
import PerfilProductoScreen from './src/screens/PerfilProductoScreen'; // Asegúrate de que está bien importado
import GraficoEnfermedadesScreen from './src/screens/GraficoEnfermedadesScreen';
import InformeMedicoScreen from './src/screens/InformeMedicoScreen';
import ResultadoInforme from './src/screens/ResultadoInforme';

const Stack = createStackNavigator();

export default function App() {
  useEffect(() => {
    const cargarFuentes = async () => {
      await Font.loadAsync({
        Junge: require('./assets/fonts/Junge-Regular.ttf'),
      });
    };
    cargarFuentes();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
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
          name="GraficoEnfermedades"
          component={GraficoEnfermedadesScreen}
          options={{ title: 'Gráfico de Enfermedades' }}
        />
        <Stack.Screen
          name="RegistroAnimal"
          component={RegistroAnimalScreen}
          options={({ navigation }) => ({
            header: () => <CustomHeader navigation={navigation} title="Registro de Animal" />,
          })}
        />
        <Stack.Screen
          name="PerfilAnimal"
          component={PerfilAnimalScreen}
          options={{ title: 'Información General del Animal' }}
        />
        <Stack.Screen
          name="GraficoAnimales"
          component={GraficoAnimalesScreen}
          options={{ title: 'Gráficos de Animales' }}
        />
        <Stack.Screen
          name="GestionEnfermedades"
          component={GestionEnfermedadesScreen}
          options={{ title: 'Gestión de Enfermedades' }}
        />
        <Stack.Screen
          name="RegistroEnfermedad"
          component={RegistroEnfermedadScreen}
          options={{ title: 'Registrar Enfermedad' }}
        />
        <Stack.Screen
          name="PerfilEnfermedad"
          component={PerfilEnfermedadScreen}
          options={{ title: 'Detalles de la Enfermedad' }}
        />
        <Stack.Screen
          name="IAScreen"
          component={IAScreen}
          options={{ title: 'IA BovinoSmart' }}
        />
        <Stack.Screen
          name="QRScreen"
          component={EscanerQR}
          options={{ title: 'Escáner QR' }}
        />
        <Stack.Screen
          name="RegistroProductoScreen"
          component={RegistroProductoScreen}
          options={{ title: 'Registro de Producto' }}
        />
        <Stack.Screen
          name="GestionProductosScreen"
          component={GestionProductosScreen}
          options={{ title: 'Gestión de Productos' }}
        />
        <Stack.Screen
          name="PerfilProducto"
          component={PerfilProductoScreen} // Agregamos PerfilProductoScreen al Stack
          options={{ title: 'Perfil del Producto' }}
        />
        <Stack.Screen
          name="InformeMedicoScreen"
          component={InformeMedicoScreen}
          options={{ title: 'Informe Médico' }}
        />
        <Stack.Screen
          name="ResultadoInforme"
          component={ResultadoInforme}
          options={{ title: 'Resultado del Informe' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Componente de encabezado personalizado
const CustomHeader = ({ navigation, title }) => {
  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Image source={require('./assets/iconos/FlechaRetro.png')} style={styles.backIcon} />
      </TouchableOpacity>
      <View style={styles.oval} />
      <Text style={styles.headerTitle}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  oval: {
    width: 450,
    height: 450,
    backgroundColor: '#587A83',
    borderRadius: 200,
    position: 'absolute',
    top: -310,
    left: -30,
    zIndex: 1,
    opacity: 1,
  },
  headerTitle: {
    fontSize: 24,
    color: '#fff',
    marginTop: 50,
    zIndex: 2,
    fontFamily: 'Junge',
  },
  backButton: {
    position: 'absolute',
    left: 40,
    top: 55,
    zIndex: 2,
  },
  backIcon: {
    width: 30,
    height: 24,
  },
});
