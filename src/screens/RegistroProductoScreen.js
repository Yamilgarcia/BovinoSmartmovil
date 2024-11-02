import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { db } from '../../src/conection/firebase';
import { collection, addDoc } from 'firebase/firestore';

const RegistroProductoScreen = () => {
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState('');
  const [dosisRecomendada, setDosisRecomendada] = useState('');
  const [frecuenciaAplicacion, setFrecuenciaAplicacion] = useState('');
  const [notas, setNotas] = useState('');
  const [esTratamiento, setEsTratamiento] = useState(false);

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
      });

      Alert.alert('Éxito', 'Producto registrado exitosamente');
      setNombre('');
      setTipo('');
      setDosisRecomendada('');
      setFrecuenciaAplicacion('');
      setNotas('');
      setEsTratamiento(false);
    } catch (error) {
      console.error("Error registrando el producto: ", error);
      Alert.alert('Error', 'Error al registrar el producto');
    }
  };

  return (
    <View style={styles.container}>
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
        onChangeText={setDosisRecomendada}
        style={styles.input}
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

      <TouchableOpacity onPress={registrarProducto} style={styles.button}>
        <Text style={styles.buttonText}>Registrar Producto</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
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
});

export default RegistroProductoScreen;
