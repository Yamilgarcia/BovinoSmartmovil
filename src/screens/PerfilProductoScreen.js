import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, TextInput, Alert, StyleSheet, TouchableOpacity, Image, Switch } from 'react-native';
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
    if (!producto.nombre || producto.nombre.trim() === '') {
      Alert.alert('Validación', 'El nombre del producto es obligatorio');
      return;
    }
    if (!producto.tipo || producto.tipo.trim() === '') {
      Alert.alert('Validación', 'El tipo de producto es obligatorio');
      return;
    }
    if (!producto.dosis_recomendada || producto.dosis_recomendada.trim() === '') {
      Alert.alert('Validación', 'La dosis recomendada es obligatoria');
      return;
    }
    if (!producto.frecuencia_aplicacion || producto.frecuencia_aplicacion.trim() === '') {
      Alert.alert('Validación', 'La frecuencia de aplicación es obligatoria');
      return;
    }

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

  const seleccionarImagen = async () => {
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      base64: true, // Activa el formato Base64
    });

    if (!resultado.canceled && resultado.assets.length > 0) {
      const base64Imagen = `data:image/jpeg;base64,${resultado.assets[0].base64}`;
      setProducto({ ...producto, imagen: base64Imagen });
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

  if (loading || !producto) {
    return <Text style={styles.loadingText}>Cargando...</Text>;
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <TouchableOpacity onPress={seleccionarImagen} style={styles.imageContainer}>
          {producto.imagen ? (
            <Image source={{ uri: producto.imagen }} style={styles.imagePreview} />
          ) : (
            <Text style={styles.imagePlaceholder}>Seleccionar Imagen</Text>
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#f4f4f8',
  },
  container: {
    padding: 20,
    margin: 15,
    backgroundColor: '#ffffff',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 4,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '600',
    color: '#344e41',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    marginBottom: 15,
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
    fontSize: 16,
  },
  imageContainer: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    marginBottom: 20,
    backgroundColor: '#eaf4e1',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
  },
  imagePreview: {
    width: 150,
    height: 150,
    borderRadius: 10,
  },
  imagePlaceholder: {
    color: '#6c757d',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#6dbf47',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#344e41',
    marginTop: 20,
  },
});


export default PerfilProductoScreen;
