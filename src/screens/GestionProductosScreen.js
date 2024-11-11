// src/screens/GestionProductosScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import { db } from '../../src/conection/firebase';
import { collection, getDocs } from 'firebase/firestore';

const GestionProductosScreen = ({ navigation }) => {
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    // Función para obtener la lista de productos desde Firestore
    const fetchProductos = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'productos'));
        const productosList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProductos(productosList);
      } catch (error) {
        console.error("Error al obtener los productos: ", error);
      }
    };

    fetchProductos();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestión de Productos:</Text>
      
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.searchTitle}>Buscar</Text>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => navigation.navigate('RegistroProductoScreen')} // Asegúrate de que el nombre coincide con el definido en App.js
        >
          <Text style={styles.addText}>+</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.cardsContainer}>
        {productos.length > 0 ? (
          productos.map((producto) => (
            <TouchableOpacity 
              key={producto.id} 
              style={styles.card}
              onPress={() => navigation.navigate('PerfilProducto', { productoId: producto.id })} // Navega a PerfilProducto
            >
              <Image
                source={{ uri: producto.imagen || 'https://via.placeholder.com/100' }}
                style={styles.cardImage}
              />
              <Text style={styles.cardTitle}>{producto.nombre}</Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text>No hay productos registrados.</Text>
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

export default GestionProductosScreen;
