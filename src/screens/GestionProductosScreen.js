import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, Alert, RefreshControl } from 'react-native';
import { db } from '../../src/conection/firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { MaterialIcons } from '@expo/vector-icons';

const GestionProductosScreen = ({ navigation }) => {
  const [productos, setProductos] = useState([]);
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

  useEffect(() => {
    fetchProductos();
  }, []);

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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestión de Productos</Text>

      <ScrollView
        contentContainerStyle={styles.cardsContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />} // Integrar RefreshControl
      >
        {productos.length > 0 ? (
          productos.map((producto) => (
            <View key={producto.id} style={styles.card}>
              <TouchableOpacity
                onPress={() => navigation.navigate('PerfilProducto', { productoId: producto.id })}
              >
                <Image
                  source={{ uri: producto.imagen || 'https://via.placeholder.com/100' }}
                  style={styles.cardImage}
                />
                <Text style={styles.cardTitle}>
                  {producto.nombre || 'Producto sin nombre'}
                </Text>
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
    backgroundColor: '#f4f9f4',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginVertical: 20,
    color: '#344e41',
    textAlign: 'center',
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#81c784',
    borderRadius: 15,
    width: 160,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
  },
  cardImage: {
    width: 120,
    height: 120,
    marginBottom: 10,
    borderRadius: 10,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
    padding: 8,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#388e3c',
    width: 65,
    height: 65,
    borderRadius: 32.5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 6,
  },
  floatingButtonText: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
  },
});

export default GestionProductosScreen;
