import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, Button, Alert, Image, TouchableOpacity, ScrollView } from 'react-native';
import { db } from '../../src/conection/firebase';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore'; // Importa deleteDoc
import * as ImagePicker from 'expo-image-picker'; // Importa ImagePicker

const PerfilEnfermedadScreen = ({ route, navigation }) => {
  const { enfermedadId } = route.params;
  const [enfermedad, setEnfermedad] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [sintomas, setSintomas] = useState('');
  const [modoTransmision, setModoTransmision] = useState('');
  const [imagen, setImagen] = useState('');

  // Estados separados para manejar la altura de cada TextInput
  const [descripcionHeight, setDescripcionHeight] = useState(80);
  const [sintomasHeight, setSintomasHeight] = useState(80);
  const [modoTransmisionHeight, setModoTransmisionHeight] = useState(80);

  useEffect(() => {
    const fetchEnfermedad = async () => {
      const docRef = doc(db, 'enfermedades', enfermedadId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setEnfermedad(docSnap.data());
        setNombre(docSnap.data().nombre);
        setDescripcion(docSnap.data().descripcion);
        setSintomas(docSnap.data().sintomas);
        setModoTransmision(docSnap.data().modo_transmision);
        setImagen(docSnap.data().imagen);
      } else {
        console.log('No such document!');
      }
    };

    fetchEnfermedad();
  }, [enfermedadId]);

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

  const handleUpdateEnfermedad = async () => {
    if (!nombre || !descripcion || !sintomas || !modoTransmision) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    try {
      const docRef = doc(db, 'enfermedades', enfermedadId);
      await updateDoc(docRef, {
        nombre,
        descripcion,
        sintomas,
        modo_transmision: modoTransmision,
        imagen, // Guarda la URL de la imagen en Firestore
      });
      Alert.alert('Éxito', 'Enfermedad actualizada correctamente');
      setIsEditing(false);
    } catch (error) {
      console.error("Error al actualizar la enfermedad: ", error);
      Alert.alert('Error', 'No se pudo actualizar la enfermedad');
    }
  };

  // Función para eliminar la enfermedad
  const handleDeleteEnfermedad = async () => {
    try {
      const docRef = doc(db, 'enfermedades', enfermedadId);
      await deleteDoc(docRef); // Elimina el documento
      Alert.alert('Éxito', 'Enfermedad eliminada correctamente');
      navigation.goBack(); // Regresa a la pantalla anterior
    } catch (error) {
      console.error("Error al eliminar la enfermedad: ", error);
      Alert.alert('Error', 'No se pudo eliminar la enfermedad');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {enfermedad ? (
        <>
          <Text style={styles.title}>{isEditing ? 'Editar Enfermedad' : 'Detalles de la Enfermedad'}</Text>
          
          <TouchableOpacity onPress={seleccionarImagen} style={styles.imageContainer}>
            {imagen ? (
              <Image source={{ uri: imagen }} style={styles.imagePreview} />
            ) : (
              <Image source={{ uri: enfermedad.imagen }} style={styles.imagePreview} />
            )}
          </TouchableOpacity>

          <Text style={styles.label}>Nombre:</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={nombre}
              onChangeText={setNombre}
              placeholder="Nombre"
              editable={isEditing}
            />
          </View>

          <Text style={styles.label}>Descripción:</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, { height: descripcionHeight }]} // Altura dinámica para Descripción
              value={descripcion}
              onChangeText={setDescripcion}
              placeholder="Descripción"
              editable={isEditing}
              multiline
              onContentSizeChange={(e) => setDescripcionHeight(e.nativeEvent.contentSize.height)} // Ajusta la altura dinámicamente
            />
          </View>

          <Text style={styles.label}>Síntomas:</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, { height: sintomasHeight }]} // Altura dinámica para Síntomas
              value={sintomas}
              onChangeText={setSintomas}
              placeholder="Síntomas"
              editable={isEditing}
              multiline
              onContentSizeChange={(e) => setSintomasHeight(e.nativeEvent.contentSize.height)} // Ajusta la altura dinámicamente
            />
          </View>

          <Text style={styles.label}>Modo de Transmisión:</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, { height: modoTransmisionHeight }]} // Altura dinámica para Modo de Transmisión
              value={modoTransmision}
              onChangeText={setModoTransmision}
              placeholder="Modo de Transmisión"
              editable={isEditing}
              multiline
              onContentSizeChange={(e) => setModoTransmisionHeight(e.nativeEvent.contentSize.height)} // Ajusta la altura dinámicamente
            />
          </View>
          
          {isEditing ? (
            <Button title="Guardar Cambios" onPress={handleUpdateEnfermedad} />
          ) : (
            <Button title="Editar" onPress={() => setIsEditing(true)} />
          )}

          {/* Botón para eliminar la enfermedad */}
          <Button
            title="Eliminar Enfermedad"
            color="red"
            onPress={handleDeleteEnfermedad} // Llama a la función de eliminar
          />
        </>
      ) : (
        <Text>Cargando datos de la enfermedad...</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1, // Permite que el ScrollView funcione correctamente
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#344e41',
  },
  inputContainer: {
    borderWidth: 2,
    borderColor: '#3E7B31', // Color verde
    borderRadius: 10,
    padding: 5,
    marginBottom: 15,
    backgroundColor: '#f9f9f9', // Fondo blanco para el campo de entrada
  },
  input: {
    paddingHorizontal: 10,
    textAlignVertical: 'top', // Asegura que el texto esté alineado al principio en entradas multilinea
    fontWeight: 'black', // Establece el texto en negrita
    color: '#000', // Asegura que el texto sea negro
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
});

export default PerfilEnfermedadScreen;
