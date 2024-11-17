import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

const ResultadoInforme = ({ route }) => {
  const { animal, enfermedadesDetalladas } = route.params;

  if (!animal) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No se proporcionaron datos del animal.</Text>
      </View>
    );
  }

  const generatePdf = async () => {
    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #6dbf47; }
            ul { list-style-type: none; padding: 0; }
            li { margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <h1>Informe Médico</h1>
          <h2>${animal.nombre} (ID: ${animal.codigo_idVaca})</h2>
          <p><strong>Raza:</strong> ${animal.raza}</p>
          <p><strong>Estado:</strong> ${animal.estado}</p>
          <h3>Enfermedades:</h3>
          <ul>
            ${
              enfermedadesDetalladas && enfermedadesDetalladas.length > 0
                ? enfermedadesDetalladas
                    .map(
                      (enf) => `<li>${enf.nombre} - Fecha: ${enf.fecha}</li>`
                    )
                    .join('')
                : '<li>No tiene enfermedades registradas.</li>'
            }
          </ul>
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        alert('No se puede compartir el PDF en este dispositivo.');
      }
    } catch (error) {
      console.error('Error al generar o compartir el PDF:', error);
      alert('Error al generar o compartir el PDF.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Resultado del Informe</Text>
      <Text style={styles.label}>Nombre: {animal.nombre}</Text>
      <Text style={styles.label}>ID: {animal.codigo_idVaca}</Text>
      <Text style={styles.label}>Raza: {animal.raza}</Text>
      <Text style={styles.label}>Estado: {animal.estado}</Text>
      <Text style={styles.label}>Enfermedades:</Text>
      {enfermedadesDetalladas && enfermedadesDetalladas.length > 0 ? (
        enfermedadesDetalladas.map((enf, index) => (
          <Text key={index} style={styles.enfermedadItem}>
            - {enf.nombre} (Fecha: {enf.fecha})
          </Text>
        ))
      ) : (
        <Text>No tiene enfermedades registradas.</Text>
      )}
      <TouchableOpacity style={styles.button} onPress={generatePdf}>
        <Text style={styles.buttonText}>Generar y Compartir PDF</Text>
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
  },
  enfermedadItem: {
    fontSize: 16,
    marginBottom: 5,
  },
  button: {
    backgroundColor: '#6dbf47',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    fontSize: 18,
  },
});

export default ResultadoInforme;
