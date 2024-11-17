import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, TextInput } from 'react-native';
import { db } from '../../src/conection/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';

const GestionAnimalesScreen = ({ navigation }) => {
  const [animales, setAnimales] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredAnimales, setFilteredAnimales] = useState([]);

  // Función para obtener la lista de animales desde Firestore
  const fetchAnimales = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'animales'));
      const animalesList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAnimales(animalesList);
      setFilteredAnimales(animalesList); // Inicialmente, todos los animales se muestran
    } catch (error) {
      console.error("Error al obtener los animales: ", error);
    }
  };

  // Actualiza la lista de animales cada vez que esta pantalla recibe el foco
  useFocusEffect(
    useCallback(() => {
      fetchAnimales();
    }, [])
  );

  // Función para filtrar los animales según la consulta de búsqueda
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredAnimales(animales);
    } else {
      const lowerCaseQuery = query.toLowerCase();
      const filtered = animales.filter(animal =>
        animal.codigo_idVaca?.toLowerCase().includes(lowerCaseQuery) ||
        animal.nombre?.toLowerCase().includes(lowerCaseQuery) ||
        animal.raza?.toLowerCase().includes(lowerCaseQuery) ||
        animal.pesos?.toString().includes(lowerCaseQuery) ||
        (animal.estado?.toLowerCase().includes(lowerCaseQuery)) ||
        animal.enfermedades?.some(enfermedad => enfermedad.toLowerCase().includes(lowerCaseQuery))
      );
      setFilteredAnimales(filtered);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestión de Animales</Text>

      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
    
        </TouchableOpacity>
        <Text style={styles.searchTitle}>Buscar</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por ID, nombre, raza, etc."
          value={searchQuery}
          onChangeText={handleSearch}
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('RegistroAnimal')}
        >
          <Text style={styles.addText}>+</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.cardsContainer}>
        {filteredAnimales.length > 0 ? (
          filteredAnimales.map((animal) => (
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
              <Text style={styles.cardDetails}>Activo: {animal.estado}</Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text>No hay animales registrados o no coinciden con la búsqueda.</Text>
        )}
      </ScrollView>
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    fontSize: 30,
    marginRight: 10,
  },
  searchTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  addButton: {
    backgroundColor: '#6dbf47',
    borderRadius: 50,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addText: {
    color: '#fff',
    fontSize: 24,
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
});

export default GestionAnimalesScreen;
