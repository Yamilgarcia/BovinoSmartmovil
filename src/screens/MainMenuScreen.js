// src/screens/MainMenuScreen.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

const MainMenuScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Menú</Text>

      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => navigation.navigate('GestionAnimales')}
        >
          <Image
            source={require('../../assets/descargavaca.png')}
            style={styles.icon}
          />
          <Text style={styles.optionText}>Gestión del Animal</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => navigation.navigate('GestionEnfermedades')}
        >
          <Image
            source={require('../../assets/Enfermedad.png')}
            style={styles.icon}
          />
          <Text style={styles.optionText}>Gestión de Enfermedades</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionButton}>
          <Image
            source={require('../../assets/Producto.png')}
            style={styles.icon}
          />
          <Text style={styles.optionText}>Gestión de Productos</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionButton}>
          <Image
            source={require('../../assets/QR.png')}
            style={styles.icon}
          />
          <Text style={styles.optionText}>Escáner QR</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => navigation.navigate('GraficoAnimales')}
        >
          <Text style={styles.optionText}>Gráfico de Animales</Text>
        </TouchableOpacity>

        {/* Nueva opción para ir a la pantalla de IA */}
        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => navigation.navigate('IAScreen')}
        >
         
          <Text style={styles.optionText}>IA BovinoSmart</Text>
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
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionButton: {
    backgroundColor: '#6dbf47',
    padding: 20,
    margin: 10,
    borderRadius: 10,
    alignItems: 'center',
    width: 150,
    height: 150,
    justifyContent: 'center',
  },
  optionText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
  icon: {
    width: 50,
    height: 50,
    tintColor: '#fff',
  },
});

export default MainMenuScreen;
