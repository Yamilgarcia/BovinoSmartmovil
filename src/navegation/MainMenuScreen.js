import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import * as Font from 'expo-font';

const MainMenuScreen = ({ navigation }) => {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    const loadFonts = async () => {
      await Font.loadAsync({
        'Arapey': require('../../assets/fonts/Arapey-Italic.ttf'),
      });
      setFontsLoaded(true); // Indica que la fuente ha cargado
    };
    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return null; // Muestra una pantalla vacía hasta que las fuentes se carguen
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Menú</Text>

      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => navigation.navigate('GestionAnimales')}
        >
          <View style={styles.optionTextContainer}>
            <Text style={styles.optionText}>Gestión del Animal</Text>
          </View>
          <View style={styles.iconContainer}>
            <Image
              source={require('../../assets/iconos/VacaMenu.png')}
              style={styles.icon}
            />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => navigation.navigate('GestionEnfermedades')}
        >
          <View style={styles.optionTextContainer}>
            <Text style={styles.optionText}>Gestión de Enfermedades</Text>
          </View>
          <View style={styles.iconContainer}>
            <Image
              source={require('../../assets/iconos/EnfermedadesMenu.png')}
              style={styles.icon}
            />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => navigation.navigate('QRScreen')}
        >
          <View style={styles.optionTextContainer}>
            <Text style={styles.optionText}>Escáner QR</Text>
          </View>
          <View style={styles.iconContainer}>
            <Image
              source={require('../../assets/iconos/QRVaca.png')}
              style={styles.icon}
            />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => navigation.navigate('GestionProductosScreen')}
        >
          <View style={styles.optionTextContainer}>
            <Text style={styles.optionText}>Gestión de Productos</Text>
          </View>
          <View style={styles.iconContainer}>
            <Image
              source={require('../../assets/iconos/Producto.png')}
              style={styles.icon}
            />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => navigation.navigate('GraficoAnimales')}
        >
          <View style={styles.optionTextContainer}>
            <Text style={styles.optionText}>Gráfico de Animales</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => navigation.navigate('IAScreen')}
        >
          <View style={styles.optionTextContainer}>
            <Text style={styles.optionText}>IA BovinoSmart</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => navigation.navigate('RegistroProductoScreen')}
        >
          <View style={styles.optionTextContainer}>
            <Text style={styles.optionText}>Registro de Producto</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eaf4e1',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    fontFamily: 'Arapey',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionButton: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    margin: 10,
    borderRadius: 10,
    alignItems: 'center',
    width: 150,
    height: 150,
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#71AF61',
    position: 'relative',
  },
  optionTextContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
  },
  optionText: {
    color: '#000000',
    fontSize: 16,
    textAlign: 'left',
    fontFamily: 'Arapey', // Aplicar fuente Arapey
  },
  iconContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40, // Bajar un poco el icono
  },
  icon: {
    width: 120, // Ajusta el tamaño del icono según tu preferencias
    height: 120,
  },
});

export default MainMenuScreen;
