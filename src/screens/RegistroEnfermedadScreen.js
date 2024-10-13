import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Image, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker'; // Importa ImagePicker para seleccionar imágenes
import { db } from '../../firebase'; // Asegúrate de que la ruta es correcta
import { collection, addDoc } from 'firebase/firestore';

const RegistroEnfermedadScreen = ({ navigation }) => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [sintomas, setSintomas] = useState('');
  const [modoTransmision, setModoTransmision] = useState('');
  const [imagen, setImagen] = useState(null); // Estado para la imagen

  const registrarEnfermedad = async () => {
    try {
      await addDoc(collection(db, 'enfermedades'), {
        nombre,
        descripcion,
        sintomas,
        modoTransmision,
        imagen, // Guarda la URL de la imagen en Firestore
      });
      Alert.alert('Éxito', 'Enfermedad registrada correctamente');
      navigation.navigate('GestionEnfermedades');
    } catch (error) {
      console.error("Error al registrar la enfermedad: ", error);
      Alert.alert('Error', 'No se pudo registrar la enfermedad');
    }
  };

  // Función para seleccionar una imagen desde la galería
  const seleccionarImagen = async () => {
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!resultado.canceled) {
      setImagen(resultado.assets[0].uri); // Guarda la URI de la imagen seleccionada
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registrar Enfermedad</Text>
      <TouchableOpacity onPress={seleccionarImagen} style={styles.imageContainer}>
        {imagen ? (
          <Image source={{ uri: imagen }} style={styles.imagePreview} />
        ) : (
          <Text style={styles.imagePlaceholder}>Seleccionar Imagen</Text>
        )}
      </TouchableOpacity>
      <TextInput
        placeholder="Nombre de la Enfermedad"
        value={nombre}
        onChangeText={setNombre}
        style={styles.input}
      />
      <TextInput
        placeholder="Descripción"
        value={descripcion}
        onChangeText={setDescripcion}
        style={styles.input}
      />
      <TextInput
        placeholder="Síntomas"
        value={sintomas}
        onChangeText={setSintomas}
        style={styles.input}
      />
      <TextInput
        placeholder="Modo de Transmisión"
        value={modoTransmision}
        onChangeText={setModoTransmision}
        style={styles.input}
      />
      <Button title="Registrar Enfermedad" onPress={registrarEnfermedad} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#344e41',
    textAlign: 'center', // Centrar el texto
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
  },
  imageContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 5,
  },
  imagePlaceholder: {
    color: '#888',
  },
});

export default RegistroEnfermedadScreen;
