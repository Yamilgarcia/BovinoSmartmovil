import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView, Alert, RefreshControl } from 'react-native';
import { db } from '../../src/conection/firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

const GestionProductosScreen = ({ navigation }) => {
  const [productos, setProductos] = useState([]);
  const [searchText, setSearchText] = useState(''); // Texto para el buscador
  const [refreshing, setRefreshing] = useState(false); // Estado para el refresh

  // Función para obtener la lista de productos desde Firestore
  const fetchProductos = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'productos'));
      const productosList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProductos(productosList);
    } catch (error) {
      console.error('Error al obtener los productos: ', error);
    }
  };

  // Actualiza la lista de productos cuando la pantalla es enfocada
  useFocusEffect(
    useCallback(() => {
      fetchProductos();
    }, [])
  );

  // Función para eliminar un producto
  const handleDeleteProducto = async (productoId) => {
    try {
      await deleteDoc(doc(db, 'productos', productoId));
      Alert.alert('Éxito', 'Producto eliminado correctamente');
      fetchProductos(); // Refrescar después de eliminar
    } catch (error) {
      console.error('Error al eliminar el producto:', error);
      Alert.alert('Error', 'No se pudo eliminar el producto');
    }
  };

  // Función para manejar el refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProductos();
    setRefreshing(false);
  }, []);

  // Filtra los productos según el texto ingresado en el buscador
  const filteredProductos = productos.filter((producto) =>
    producto.nombre.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestión de Productos</Text>

      {/* Campo de búsqueda */}
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar productos por nombre"
        value={searchText}
        onChangeText={setSearchText}
      />

      <ScrollView
        contentContainerStyle={styles.cardsContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {filteredProductos.length > 0 ? (
          filteredProductos.map((producto) => (
            <View key={producto.id} style={styles.card}>
              <TouchableOpacity
                onPress={() => navigation.navigate('PerfilProducto', { productoId: producto.id })}
              >
                <Image
                  source={{ uri: producto.imagen || 'https://via.placeholder.com/100' }}
                  style={styles.cardImage}
                />
                <Text style={styles.cardTitle}>{producto.nombre || 'Producto sin nombre'}</Text>
              </TouchableOpacity>
              <View style={styles.buttonGroup}>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() =>
                    Alert.alert(
                      'Confirmar eliminación',
                      '¿Estás seguro de que deseas eliminar este producto?',
                      [
                        { text: 'Cancelar', style: 'cancel' },
                        { text: 'Eliminar', onPress: () => handleDeleteProducto(producto.id) },
                      ]
                    )
                  }
                >
                  <MaterialIcons name="delete" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <Text>No hay productos registrados.</Text>
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => navigation.navigate('RegistroProductoScreen')}
      >
        <Text style={styles.floatingButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eaf4e1', // Fondo claro verde
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 20,
    color: '#2c5f2d', // Título verde oscuro
    textAlign: 'center',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    backgroundColor: '#ffffff',
    fontSize: 16,
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#6dbf47', // Verde claro para las tarjetas
    borderRadius: 10,
    width: '48%',
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 4,
  },
  cardImage: {
    width: 100,
    height: 100,
    marginBottom: 10,
    borderRadius: 10,
  },
  cardTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
    padding: 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#6dbf47', // Verde similar al resto
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 5,
  },
  floatingButtonText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
});


export default GestionProductosScreen;
