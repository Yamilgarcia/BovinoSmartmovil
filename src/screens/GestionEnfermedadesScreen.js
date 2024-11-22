import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, TextInput } from 'react-native';
import { db } from '../../src/conection/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

const GestionEnfermedadesScreen = ({ navigation }) => {
  const [enfermedades, setEnfermedades] = useState([]);
  const [searchQuery, setSearchQuery] = useState(''); // Estado para el texto del buscador
  const [filteredEnfermedades, setFilteredEnfermedades] = useState([]); // Estado para las enfermedades filtradas

  useEffect(() => {
    // Suscribirse a cambios en la colección "enfermedades" en Firestore
    const unsubscribe = onSnapshot(collection(db, 'enfermedades'), (snapshot) => {
      const enfermedadesList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEnfermedades(enfermedadesList);
      setFilteredEnfermedades(enfermedadesList); // Inicializar las enfermedades filtradas
    });

    return () => unsubscribe(); // Cleanup de la suscripción
  }, []);

  // Función para manejar el filtro de búsqueda
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredEnfermedades(enfermedades);
    } else {
      const filtered = enfermedades.filter((enfermedad) =>
        enfermedad.nombre.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredEnfermedades(filtered);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestión de Enfermedades:</Text>
      
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar enfermedad..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('RegistroEnfermedad')}>
          <Text style={styles.addText}>+</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.cardsContainer}>
        {filteredEnfermedades.length > 0 ? (
          filteredEnfermedades.map((enfermedad) => (
            <TouchableOpacity 
              key={enfermedad.id} 
              style={styles.card}
              onPress={() => navigation.navigate('PerfilEnfermedad', { enfermedadId: enfermedad.id })}
            >
              <Image
                source={{ uri: enfermedad.imagen || 'https://via.placeholder.com/100' }}
                style={styles.cardImage}
              />
              <Text style={styles.cardTitle}>{enfermedad.nombre}</Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text>No hay enfermedades registradas.</Text>
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
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 8,
    marginRight: 10,
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
});

export default GestionEnfermedadesScreen;
