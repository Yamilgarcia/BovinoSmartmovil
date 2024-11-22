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
import * as ImagePicker from 'expo-image-picker';
import { db } from '../../src/conection/firebase';
import { collection, addDoc } from 'firebase/firestore';

const RegistroEnfermedadScreen = ({ navigation }) => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [sintomas, setSintomas] = useState('');
  const [modoTransmision, setModoTransmision] = useState('');
  const [imagen, setImagen] = useState(null);

  const registrarEnfermedad = async () => {
    try {
      await addDoc(collection(db, 'enfermedades'), {
        nombre,
        descripcion,
        sintomas,
        modoTransmision,
        imagen,
      });
      Alert.alert('Éxito', 'Enfermedad registrada correctamente');
      navigation.navigate('GestionEnfermedades');
    } catch (error) {
      console.error('Error al registrar la enfermedad: ', error);
      Alert.alert('Error', 'No se pudo registrar la enfermedad');
    }
  };

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

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
      <View style={styles.container}>
        <View style={styles.formContainer}>
          <TouchableOpacity onPress={seleccionarImagen} style={styles.imageContainer}>
            {imagen ? (
              <Image source={{ uri: imagen }} style={styles.imagePreview} />
            ) : (
              <Image source={require('../../assets/iconos/flecha.png')} style={styles.imageIcon} />
            )}
          </TouchableOpacity>

          <Text style={styles.label}>Nombre de la Enfermedad:</Text>
          <TextInput
            placeholder="Nombre de la Enfermedad"
            value={nombre}
            onChangeText={setNombre}
            style={styles.input}
            testID="inputNombre"
          />

          <Text style={styles.label}>Descripción:</Text>
          <TextInput
            placeholder="Descripción"
            value={descripcion}
            onChangeText={setDescripcion}
            style={styles.input}
            testID="inputDescripcion"
            multiline
          />

          <Text style={styles.label}>Síntomas:</Text>
          <TextInput
            placeholder="Síntomas"
            value={sintomas}
            onChangeText={setSintomas}
            style={styles.input}
            testID="inputSintomas"
            multiline
          />

          <Text style={styles.label}>Modo de Transmisión:</Text>
          <TextInput
            placeholder="Modo de Transmisión"
            value={modoTransmision}
            onChangeText={setModoTransmision}
            style={styles.input}
            testID="inputModoTransmision"
          />

          <TouchableOpacity onPress={registrarEnfermedad} style={styles.button}>
            <Text style={styles.buttonText}>Registrar Enfermedad</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  formContainer: {
    backgroundColor: '#8AC879',
    padding: 20,
    borderRadius: 15,
    borderColor: '#3E7B31',
    borderWidth: 4,
    marginTop: 60,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#344e41',
    fontFamily: 'Junge',
  },
  input: {
    borderWidth: 1,
    borderColor: '#344e41',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#587A83',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imageContainer: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    marginBottom: 20,
    backgroundColor: '#d1e7dd',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    borderColor: '#344e41',
    borderWidth: 1,
    overflow: 'hidden', // Esto asegura que la imagen no se desborde
  },
  imageIcon: {
    width: 50,
    height: 50,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover', // Ajusta la imagen para que se adapte al contenedor
  },
});

export default RegistroEnfermedadScreen;
