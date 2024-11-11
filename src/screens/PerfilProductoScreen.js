import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, TouchableOpacity, Image, Switch } from 'react-native';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../src/conection/firebase';
import * as ImagePicker from 'expo-image-picker';

const PerfilProductoScreen = ({ route, navigation }) => {
  const { productoId } = route.params;
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducto();
  }, []);

  const fetchProducto = async () => {
    try {
      const productoRef = doc(db, 'productos', productoId);
      const productoSnap = await getDoc(productoRef);
      if (productoSnap.exists()) {
        setProducto(productoSnap.data());
      } else {
        Alert.alert('Error', 'Producto no encontrado');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error al obtener el producto:', error);
      Alert.alert('Error', 'No se pudo cargar el producto');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProducto = async () => {
    try {
      const productoRef = doc(db, 'productos', productoId);
      await updateDoc(productoRef, producto);
      Alert.alert('Éxito', 'Producto actualizado correctamente');
      navigation.goBack();
    } catch (error) {
      console.error('Error al actualizar el producto:', error);
      Alert.alert('Error', 'No se pudo actualizar el producto');
    }
  };

  const handleDeleteProducto = async () => {
    try {
      const productoRef = doc(db, 'productos', productoId);
      await deleteDoc(productoRef);
      Alert.alert('Producto eliminado', 'El producto ha sido eliminado correctamente');
      navigation.goBack();
    } catch (error) {
      console.error('Error al eliminar el producto:', error);
      Alert.alert('Error', 'No se pudo eliminar el producto');
    }
  };

  const seleccionarImagen = async () => {
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!resultado.canceled && resultado.assets.length > 0) {
      setProducto({ ...producto, imagen: resultado.assets[0].uri });
    }
  };

  if (loading || !producto) {
    return <Text>Cargando...</Text>;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={seleccionarImagen} style={styles.imageContainer}>
        {producto.imagen ? (
          <Image source={{ uri: producto.imagen }} style={styles.imagePreview} />
        ) : (
          <Text>Seleccionar Imagen</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.label}>Nombre del Producto:</Text>
      <TextInput
        style={styles.input}
        value={producto.nombre}
        onChangeText={(text) => setProducto({ ...producto, nombre: text })}
      />

      <Text style={styles.label}>Tipo:</Text>
      <TextInput
        style={styles.input}
        value={producto.tipo}
        onChangeText={(text) => setProducto({ ...producto, tipo: text })}
      />

      <Text style={styles.label}>Dosis Recomendada:</Text>
      <TextInput
        style={styles.input}
        value={producto.dosis_recomendada}
        onChangeText={(text) => setProducto({ ...producto, dosis_recomendada: text })}
      />

      <Text style={styles.label}>Frecuencia de Aplicación:</Text>
      <TextInput
        style={styles.input}
        value={producto.frecuencia_aplicacion}
        onChangeText={(text) => setProducto({ ...producto, frecuencia_aplicacion: text })}
      />

      <Text style={styles.label}>Notas:</Text>
      <TextInput
        style={styles.input}
        value={producto.notas}
        onChangeText={(text) => setProducto({ ...producto, notas: text })}
      />

      <View style={styles.switchContainer}>
        <Text style={styles.label}>Es Tratamiento:</Text>
        <Switch
          value={producto.es_tratamiento}
          onValueChange={(value) => setProducto({ ...producto, es_tratamiento: value })}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleUpdateProducto}>
        <Text style={styles.buttonText}>Guardar Cambios</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={handleDeleteProducto}>
        <Text style={styles.buttonText}>Eliminar Producto</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#344e41',
  },
  input: {
    borderWidth: 1,
    borderColor: '#344e41',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  imageContainer: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: 20,
    backgroundColor: '#d1e7dd',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    borderColor: '#344e41',
    borderWidth: 1,
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#587A83',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#FF6B6B',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PerfilProductoScreen;
