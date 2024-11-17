import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { PDFDownloadLink, Document, Page, Text as PdfText, StyleSheet as PdfStyles } from '@react-pdf/renderer';

const InformeMedicoPdf = ({ data }) => (
  <Document>
    <Page style={styles.page}>
      <PdfText style={styles.header}>Informe Médico</PdfText>
      <PdfText>Animal: {data.nombre} (ID: {data.codigo_idVaca})</PdfText>
      <PdfText>Raza: {data.raza}</PdfText>
      <PdfText>Estado: {data.estado}</PdfText>
      <PdfText>Enfermedades:</PdfText>
      {data.enfermedades.map((enfermedad, index) => (
        <PdfText key={index}>
          - {enfermedad.nombre} (Fecha: {enfermedad.fecha})
        </PdfText>
      ))}
    </Page>
  </Document>
);

const ResultadoInforme = ({ route, navigation }) => {
  const { animalId, fechaInicio, fechaFin, enfermedad } = route.params;

  // Aquí deberías filtrar los datos del animal según los parámetros recibidos
  const datosFiltrados = {
    nombre: 'Ejemplo Animal',
    codigo_idVaca: animalId || '1234',
    raza: 'Holstein',
    estado: 'Activo',
    enfermedades: [
      { nombre: 'Enfermedad 1', fecha: '2024-01-01' },
      { nombre: 'Enfermedad 2', fecha: '2024-02-01' },
    ],
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Resultado del Informe Médico</Text>
      <PDFDownloadLink
        document={<InformeMedicoPdf data={datosFiltrados} />}
        fileName={`informe_medico_${animalId || 'desconocido'}.pdf`}
      >
        {({ loading }) => (
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>
              {loading ? 'Generando PDF...' : 'Descargar Informe'}
            </Text>
          </TouchableOpacity>
        )}
      </PDFDownloadLink>

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Volver</Text>
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
  backButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#ccc',
    borderRadius: 5,
  },
  backButtonText: {
    textAlign: 'center',
    color: '#000',
  },
  page: {
    padding: 30,
  },
  header: {
    fontSize: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
});

export default ResultadoInforme;
