import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ScrollView,
} from 'react-native';
import { db } from '../../src/conection/firebase';
import { collection, addDoc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';

const RegistroProductoScreen = () => {
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState('');
  const [dosisRecomendada, setDosisRecomendada] = useState('');
  const [frecuenciaAplicacion, setFrecuenciaAplicacion] = useState('');
  const [notas, setNotas] = useState('');
  const [esTratamiento, setEsTratamiento] = useState(false);
  const [imagen, setImagen] = useState(null);

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
      setImagen(base64Imagen); // Guarda la imagen como Base64
    }
  };

  const registrarProducto = async () => {
    if (!nombre || !tipo || !dosisRecomendada || !frecuenciaAplicacion) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return;
    }

    try {
      await addDoc(collection(db, 'productos'), {
        nombre,
        tipo,
        dosis_recomendada: dosisRecomendada,
        frecuencia_aplicacion: frecuenciaAplicacion,
        notas,
        es_tratamiento: esTratamiento,
        imagen, // Guarda la imagen en formato Base64
      });

      Alert.alert('Éxito', 'Producto registrado exitosamente');
      setNombre('');
      setTipo('');
      setDosisRecomendada('');
      setFrecuenciaAplicacion('');
      setNotas('');
      setEsTratamiento(false);
      setImagen(null);
    } catch (error) {
      console.error('Error registrando el producto: ', error);
      Alert.alert('Error', 'Error al registrar el producto');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        <TouchableOpacity onPress={seleccionarImagen} style={styles.imageContainer}>
          {imagen ? (
            <Image source={{ uri: imagen }} style={styles.imagePreview} />
          ) : (
            <Image source={require('../../assets/iconos/flecha.png')} style={styles.imageIcon} />
          )}
        </TouchableOpacity>

        <Text style={styles.label}>Nombre del Producto:</Text>
        <TextInput
          placeholder="Nombre del Producto"
          value={nombre}
          onChangeText={setNombre}
          style={styles.input}
        />

        <Text style={styles.label}>Tipo:</Text>
        <TextInput
          placeholder="Tipo de Producto"
          value={tipo}
          onChangeText={setTipo}
          style={styles.input}
        />

        <Text style={styles.label}>Dosis Recomendada:</Text>
        <TextInput
          placeholder="Dosis Recomendada"
          value={dosisRecomendada}
          onChangeText={(text) => {
            const numericValue = text.replace(/[^0-9.]/g, '');
            setDosisRecomendada(numericValue);
          }}
          style={styles.input}
          keyboardType="numeric" // Habilita solo teclado numérico
        />


        <Text style={styles.label}>Frecuencia de Aplicación:</Text>
        <TextInput
          placeholder="Frecuencia de Aplicación"
          value={frecuenciaAplicacion}
          onChangeText={setFrecuenciaAplicacion}
          style={styles.input}
        />

        <Text style={styles.label}>Notas:</Text>
        <TextInput
          placeholder="Notas adicionales"
          value={notas}
          onChangeText={setNotas}
          style={styles.input}
        />

        <TouchableOpacity onPress={registrarProducto} style={styles.button} testID="registerProductoButton">
          <Text style={styles.buttonText}>Registrar Producto</Text>
        </TouchableOpacity>
      </View>
      {/* Espacio adicional para evitar que el contenido esté muy pegado al borde inferior */}
      <View style={styles.extraSpace} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  formContainer: {
    backgroundColor: '#8AC879',
    padding: 20,
    borderRadius: 15,
    borderColor: '#3E7B31',
    borderWidth: 4,
    marginTop: 60,
    marginHorizontal: 10,
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
  imageIcon: {
    width: 50,
    height: 50,
    tintColor: '#344e41',
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  button: {
    backgroundColor: '#587A83',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  buttonText: {
    color: '#000000',
    textAlign: 'center',
  },
  extraSpace: {
    height: 50, // Espacio adicional debajo del formulario
  },
});

export default RegistroProductoScreen;
