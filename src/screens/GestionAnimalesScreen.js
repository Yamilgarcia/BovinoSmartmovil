import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, TextInput } from 'react-native';
import { db } from '../../src/conection/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';

const GestionAnimalesScreen = ({ navigation }) => {
  const [animales, setAnimales] = useState([]);
  const [busqueda, setBusqueda] = useState(''); // Estado para la búsqueda
  const [animalesFiltrados, setAnimalesFiltrados] = useState([]);

  const fetchAnimales = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'animales'));
      const animalesList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAnimales(animalesList);
      setAnimalesFiltrados(animalesList); // Inicialmente, mostrar todos
    } catch (error) {
      console.error('Error al obtener los animales: ', error);
    }
  };

  const handleBusqueda = (texto) => {
    setBusqueda(texto);
    const filtrados = animales.filter((animal) =>
      animal.nombre?.toLowerCase().includes(texto.toLowerCase()) ||
      animal.codigo_idVaca?.toLowerCase().includes(texto.toLowerCase())
    );
    setAnimalesFiltrados(filtrados);
  };

  useFocusEffect(
    useCallback(() => {
      fetchAnimales();
    }, [])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestión de Animales</Text>

      {/* Barra de búsqueda */}
      <TextInput
        style={styles.searchBar}
        placeholder="Buscar por nombre o ID"
        value={busqueda}
        onChangeText={handleBusqueda}
      />

      <ScrollView contentContainerStyle={styles.cardsContainer}>
        {animalesFiltrados.length > 0 ? (
          animalesFiltrados.map((animal) => (
            <TouchableOpacity
              key={animal.id}
              style={styles.card}
              onPress={() => navigation.navigate('PerfilAnimal', { animalId: animal.id })}
            >
              <Image
                source={{ uri: animal.imagen || 'https://via.placeholder.com/100' }}
                style={styles.cardImage}
              />
              <Text style={styles.cardTitle}>{animal.nombre || 'Sin nombre'}</Text>
              <Text style={styles.cardDetails}>ID: {animal.codigo_idVaca}</Text>
              <Text style={styles.cardDetails}>Raza: {animal.raza}</Text>
              <Text style={styles.cardDetails}>Estado: {animal.estado}</Text>
              <TouchableOpacity
                style={styles.reportButton}
                onPress={(e) => {
                  e.stopPropagation(); // Evita que se active el evento de navegación al perfil
                  navigation.navigate('InformeMedicoScreen', { animal });
                }}
              >
                <Text style={styles.reportButtonText}>Generar Informe</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        ) : (
          <Text>No hay animales que coincidan con la búsqueda.</Text>
        )}
      </ScrollView>

      {/* Botón flotante para registrar animales */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => navigation.navigate('RegistroAnimal')}
      >
        <Text style={styles.floatingButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eaf4e1',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 20,
  },
  searchBar: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#6dbf47',
    borderRadius: 10,
    width: 150,
    padding: 10,
    margin: 10,
    alignItems: 'center',
  },
  cardImage: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardDetails: {
    color: '#fff',
    fontSize: 12,
  },
  reportButton: {
    backgroundColor: '#fff',
    padding: 5,
    borderRadius: 5,
    marginTop: 10,
  },
  reportButtonText: {
    color: '#6dbf47',
    fontSize: 14,
    fontWeight: 'bold',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#6dbf47',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 5,
  },
  floatingButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default GestionAnimalesScreen;
