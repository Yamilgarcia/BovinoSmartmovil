import React, { useState } from 'react';
import { View, Text, TextInput, Button, ScrollView, StyleSheet } from 'react-native';
import axios from 'axios';

const IAScreen = () => {
  const [pregunta, setPregunta] = useState('');  // Estado para manejar la pregunta del usuario
  const [respuesta, setRespuesta] = useState('');  // Estado para manejar la respuesta de la IA

  // Función para enviar la pregunta a Wit.ai
  const enviarPreguntaAWitAI = async () => {
    try {
      const res = await axios.get('https://api.wit.ai/message', {
        params: {
          v: '20230820',  // Versión de la API
          q: pregunta,    // La pregunta del usuario
        },
        headers: {
          'Authorization': `Bearer EJXYEXNEXM34ZK4QTNJSNGKEJUZIWDWE`,  // El token de Wit.ai
        },
      });

      const { entities } = res.data;

      // Detecta las entidades de la respuesta
      const enfermedad = entities['enfermedad:enfermedad'] ? entities['enfermedad:enfermedad'][0].value : 'No detectada';
      const medicamentos = entities['medicamento:medicamento'] ? entities['medicamento:medicamento'].map(m => m.value) : [];

      // Generar respuesta basada en múltiples medicamentos
      if (enfermedad !== 'No detectada' && medicamentos.length > 0) {
        const medicamentosList = medicamentos.join(', ');
        setRespuesta(`Para la enfermedad ${enfermedad}, se recomiendan los siguientes medicamentos: ${medicamentosList}.`);
      } else if (enfermedad !== 'No detectada') {
        setRespuesta(`Se detectó la enfermedad ${enfermedad}, pero no se encontraron medicamentos específicos.`);
      } else {
        setRespuesta('No se pudo detectar la enfermedad ni los medicamentos en tu pregunta.');
      }
    } catch (error) {
      console.error('Error al enviar la pregunta a Wit.ai:', error.response ? error.response.data : error.message);
      setRespuesta('Hubo un error al procesar tu pregunta.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Pregúntale a la IA sobre enfermedades</Text>

      <TextInput
        style={styles.input}
        value={pregunta}
        onChangeText={setPregunta}
        placeholder="Escribe tu pregunta"
      />

      <Button title="Preguntar" onPress={enviarPreguntaAWitAI} />

      {respuesta ? (
        <View style={styles.responseContainer}>
          <Text style={styles.responseTitle}>Respuesta:</Text>
          <Text style={styles.response}>{respuesta}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    marginBottom: 20,
    borderRadius: 8,
  },
  responseContainer: {
    marginTop: 20,
  },
  responseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  response: {
    fontSize: 16,
  },
});

export default IAScreen;
