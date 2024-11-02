// src/screens/GestionEnfermedadesScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import { db } from '../../firebase'; // Asegúrate de que la ruta es correcta
import { collection, getDocs } from 'firebase/firestore';

const GestionEnfermedadesScreen = ({ navigation }) => {
  const [enfermedades, setEnfermedades] = useState([]);

  useEffect(() => {
    // Función para obtener la lista de enfermedades desde Firestore
    const fetchEnfermedades = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'enfermedades'));
        const enfermedadesList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setEnfermedades(enfermedadesList);
      } catch (error) {
        console.error("Error al obtener las enfermedades: ", error);
      }
    };

    fetchEnfermedades();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestión de Enfermedades:</Text>
      
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.searchTitle}>Buscar</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('RegistroEnfermedad')}>
          <Text style={styles.addText}>+</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.cardsContainer}>
        {enfermedades.length > 0 ? (
          enfermedades.map((enfermedad) => (
            <TouchableOpacity 
              key={enfermedad.id} 
              style={styles.card}
              onPress={() => navigation.navigate('PerfilEnfermedad', { enfermedadId: enfermedad.id })} // Navega a PerfilEnfermedad
            >
              <Image
                source={{ uri: enfermedad.imagen || 'https://via.placeholder.com/100' }}
                style={styles.cardImage}
              />
              <Text style={styles.cardTitle}>{enfermedad.nombre}:</Text>
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
    marginRight: 20,
  },
  searchTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
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