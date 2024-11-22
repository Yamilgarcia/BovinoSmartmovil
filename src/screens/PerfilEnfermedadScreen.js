import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, Button, Alert, Image, TouchableOpacity, ScrollView } from 'react-native';
import { db } from '../../src/conection/firebase';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';

const PerfilEnfermedadScreen = ({ route, navigation }) => {
  const { enfermedadId } = route.params;
  const [enfermedad, setEnfermedad] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [sintomas, setSintomas] = useState('');
  const [modoTransmision, setModoTransmision] = useState('');
  const [imagen, setImagen] = useState('');

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
      base64: true,
    });

    if (!resultado.canceled) {
      const base64Imagen = `data:image/jpeg;base64,${resultado.assets[0].base64}`;
      setImagen(base64Imagen);
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
        imagen,
      });
      Alert.alert('Éxito', 'Enfermedad actualizada correctamente');
      setIsEditing(false);
    } catch (error) {
      console.error("Error al actualizar la enfermedad: ", error);
      Alert.alert('Error', 'No se pudo actualizar la enfermedad');
    }
  };

  const handleDeleteEnfermedad = async () => {
    try {
      const docRef = doc(db, 'enfermedades', enfermedadId);
      await deleteDoc(docRef);
      Alert.alert('Éxito', 'Enfermedad eliminada correctamente');
      navigation.goBack();
    } catch (error) {
      console.error("Error al eliminar la enfermedad: ", error);
      Alert.alert('Error', 'No se pudo eliminar la enfermedad');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {enfermedad ? (
        <>
          <View style={styles.card}>
            <TouchableOpacity onPress={isEditing ? seleccionarImagen : null} style={styles.imageContainer}>
              <Image
                source={{ uri: imagen || 'https://via.placeholder.com/150' }}
                style={styles.image}
              />
            </TouchableOpacity>

            <Text style={styles.label}>Nombre:</Text>
            <TextInput
              style={styles.input}
              value={nombre}
              onChangeText={setNombre}
              editable={isEditing}
              placeholder="Nombre de la enfermedad"
            />

            <Text style={styles.label}>Descripción:</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={descripcion}
              onChangeText={setDescripcion}
              editable={isEditing}
              placeholder="Descripción de la enfermedad"
              multiline
            />

            <Text style={styles.label}>Síntomas:</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={sintomas}
              onChangeText={setSintomas}
              editable={isEditing}
              placeholder="Síntomas de la enfermedad"
              multiline
            />

            <Text style={styles.label}>Modo de Transmisión:</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={modoTransmision}
              onChangeText={setModoTransmision}
              editable={isEditing}
              placeholder="Modo de transmisión"
              multiline
            />
          </View>

          <View style={styles.actions}>
            {isEditing ? (
              <>
                <Button title="Guardar" onPress={handleUpdateEnfermedad} />
                <Button title="Cancelar" onPress={() => setIsEditing(false)} />
              </>
            ) : (
              <Button title="Editar" onPress={() => setIsEditing(true)} />
            )}
            <Button
              title="Eliminar Enfermedad"
              color="red"
              onPress={() =>
                Alert.alert(
                  'Confirmar Eliminación',
                  '¿Estás seguro de que deseas eliminar esta enfermedad? Esta acción no se puede deshacer.',
                  [
                    { text: 'Cancelar', style: 'cancel' },
                    { text: 'Eliminar', onPress: handleDeleteEnfermedad, style: 'destructive' },
                  ]
                )
              }
            />
          </View>
        </>
      ) : (
        <Text>Cargando datos de la enfermedad...</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f4f4f8',
  },
  card: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 20,
  },
  imageContainer: {
    alignSelf: 'center',
    marginBottom: 15,
    borderRadius: 10,
    overflow: 'hidden',
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#555',
  },
  actions: {
    marginTop: 20,
  },
  button: {
    marginBottom: 10, // Espaciado entre botones
  },
});

export default PerfilEnfermedadScreen;
