import React, { useEffect, useState, useRef } from 'react'; 
import { View, Text, StyleSheet, ScrollView, Dimensions, Button, Alert } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { captureRef } from 'react-native-view-shot';
import { jsPDF } from 'jspdf';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { db } from '../../src/conection/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

const GraficoEnfermedadesScreen = () => {
  const [dataGrafico, setDataGrafico] = useState({
    labels: [],
    datasets: [{ data: [] }]
  });

  const chartRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
      const conteoPorEnfermedad = {};

      // Obtener la lista de animales y contar cada enfermedad por ID
      const animalesSnapshot = await getDocs(collection(db, 'animales'));
      for (const animalDoc of animalesSnapshot.docs) {
        const enfermedadesRef = collection(db, 'animales', animalDoc.id, 'enfermedades');
        const enfermedadesSnapshot = await getDocs(enfermedadesRef);

        enfermedadesSnapshot.forEach(enfermedadDoc => {
          const enfermedadId = enfermedadDoc.data().enfermedad;
          if (enfermedadId) {
            conteoPorEnfermedad[enfermedadId] = (conteoPorEnfermedad[enfermedadId] || 0) + 1;
          }
        });
      }

      // Obtener los nombres de las enfermedades usando los IDs
      const labels = [];
      const data = [];
      for (const enfermedadId of Object.keys(conteoPorEnfermedad)) {
        const enfermedadDoc = await getDoc(doc(db, 'enfermedades', enfermedadId));
        const enfermedadNombre = enfermedadDoc.exists() ? enfermedadDoc.data().nombre : enfermedadId;
        labels.push(enfermedadNombre);
        data.push(conteoPorEnfermedad[enfermedadId]);
      }

      // Configurar los datos para el gráfico
      setDataGrafico({
        labels,
        datasets: [{ data }]
      });
    };

    fetchData();
  }, []);

  const generarPDF = async () => {
    try {
      // Capturar el gráfico como imagen
      const uri = await captureRef(chartRef, {
        format: "png",
        quality: 1,
        width: 600,
        height: 400,
      });

      // Crear el PDF
      const doc = new jsPDF();
      doc.text("Reporte de Enfermedades", 10, 10);

      // Leer la imagen capturada y agregarla al PDF
      const chartImage = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      doc.addImage(`data:image/png;base64,${chartImage}`, "PNG", 10, 20, 180, 90);

      // Agregar datos de texto al PDF
      dataGrafico.labels.forEach((label, index) => {
        const count = dataGrafico.datasets[0].data[index];
        doc.text(`${label}: ${count} casos`, 10, 120 + index * 10);
      });

      // Guardar y compartir el PDF
      const pdfBase64 = doc.output('datauristring').split(',')[1];
      const fileUri = `${FileSystem.documentDirectory}reporte_enfermedades.pdf`;

      await FileSystem.writeAsStringAsync(fileUri, pdfBase64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      await Sharing.shareAsync(fileUri);
    } catch (error) {
      console.error("Error al generar o compartir el PDF: ", error);
      Alert.alert('Error', 'No se pudo generar o compartir el PDF.');
    }
  };

  let screenWidth = Dimensions.get("window").width;

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
      <View style={styles.container}>
        <Text style={styles.title}>Enfermedades con más frecuencia</Text>
        <ScrollView horizontal contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.chartContainer} ref={chartRef}>
            <BarChart
              data={dataGrafico}
              width={Math.max(screenWidth, dataGrafico.labels.length * 60)} // Ajuste de ancho dinámico
              height={Math.max(250, dataGrafico.datasets[0].data.length * 30)} // Ajuste de altura dinámico
              chartConfig={{
                backgroundGradientFrom: "#d4edda",
                backgroundGradientTo: "#c3e6cb",
                color: (opacity = 1) => `rgba(34, 139, 34, ${opacity})`,
                labelColor: () => `#2d6a4f`,
                fillShadowGradient: "#28a745",
                fillShadowGradientOpacity: 0.8,
                style: {
                  borderRadius: 16,
                },
              }}
              verticalLabelRotation={10}
              style={{
                marginVertical: 8,
                borderRadius: 12,
                backgroundColor: '#f0fdf4',
              }}
            />
          </View>
        </ScrollView>
        <Button title="Generar PDF" onPress={generarPDF} color="#28a745" />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 4,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#28a745',
    borderRadius: 12,
    margin: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000000',
    textAlign: 'center',
    fontFamily: 'serif',
  },
  chartContainer: {
    padding: 4,
    backgroundColor: '#ffffff',
    borderRadius: 12,
  }
});

export default GraficoEnfermedadesScreen;
