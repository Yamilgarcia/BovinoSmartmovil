import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const InformeMedicoScreen = ({ navigation }) => {
  const [animalId, setAnimalId] = useState('');
  const [fechaInicio, setFechaInicio] = useState(null);
  const [fechaFin, setFechaFin] = useState(null);
  const [enfermedad, setEnfermedad] = useState('');

  const handleGenerarInforme = () => {
    navigation.navigate('ResultadoInforme', { animalId, fechaInicio, fechaFin, enfermedad });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Generar Informe Médico</Text>

      <TextInput
        style={styles.input}
        placeholder="ID o Nombre del Animal"
        value={animalId}
        onChangeText={setAnimalId}
      />

      <Text style={styles.label}>Fecha de Inicio</Text>
      <DateTimePicker
        value={fechaInicio || new Date()}
        mode="date"
        onChange={(event, date) => setFechaInicio(date)}
      />

      <Text style={styles.label}>Fecha de Fin</Text>
      <DateTimePicker
        value={fechaFin || new Date()}
        mode="date"
        onChange={(event, date) => setFechaFin(date)}
      />

      <TextInput
        style={styles.input}
        placeholder="Nombre de Enfermedad"
        value={enfermedad}
        onChangeText={setEnfermedad}
      />

      <TouchableOpacity style={styles.button} onPress={handleGenerarInforme}>
        <Text style={styles.buttonText}>Generar Informe</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  button: {
    backgroundColor: '#6dbf47',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default InformeMedicoScreen;
