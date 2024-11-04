import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Button, Alert } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { captureRef } from 'react-native-view-shot';
import { jsPDF } from 'jspdf';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { db } from '../../src/conection/firebase';
import { collection, getDocs } from 'firebase/firestore';

const GraficoProduccionLecheScreen = () => {
  const [dataGrafico, setDataGrafico] = useState({
    labels: [],
    datasets: [{ data: [] }]
  });

  const chartRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
      const produccionPorAnimal = {};

      // Obtener la lista de animales y sumar la cantidad de leche producida
      const animalesSnapshot = await getDocs(collection(db, 'animales'));
      for (const animalDoc of animalesSnapshot.docs) {
        const animalData = animalDoc.data();
        const animalNombre = animalData.nombre;

        const produccionLecheRef = collection(db, 'animales', animalDoc.id, 'produccion_leche');
        const produccionSnapshot = await getDocs(produccionLecheRef);

        produccionSnapshot.forEach(produccionDoc => {
          const cantidad = produccionDoc.data().cantidad;
          if (cantidad) {
            produccionPorAnimal[animalNombre] = (produccionPorAnimal[animalNombre] || 0) + cantidad;
          }
        });
      }

      // Crear datos para el gráfico de barras
      const labels = Object.keys(produccionPorAnimal);
      const data = Object.values(produccionPorAnimal);

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
        width: 800, // Mayor ancho para mejor resolución
        height: 600, // Mayor altura para mejor resolución
      });

      // Crear el PDF
      const doc = new jsPDF();
      doc.text("Reporte de Producción de Leche", 10, 10);

      // Leer la imagen capturada y agregarla al PDF
      const chartImage = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      doc.addImage(`data:image/png;base64,${chartImage}`, "PNG", 10, 20, 180, 120);

      // Agregar datos de texto al PDF
      dataGrafico.labels.forEach((label, index) => {
        const produccion = dataGrafico.datasets[0].data[index];
        doc.text(`${label}: ${produccion} litros`, 10, 150 + index * 10);
      });

      // Guardar y compartir el PDF
      const pdfBase64 = doc.output('datauristring').split(',')[1];
      const fileUri = `${FileSystem.documentDirectory}reporte_produccion_leche.pdf`;

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
        <Text style={styles.title}>Producción de Leche por Animal</Text>
        <View style={styles.chartContainer} ref={chartRef}>
          <BarChart
            data={dataGrafico}
            width={screenWidth - (screenWidth * 0.1)}
            height={250}
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
            verticalLabelRotation={30}
            style={{
              marginVertical: 8,
              borderRadius: 16,
              backgroundColor: '#ffffff',
            }}
          />
        </View>
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
    borderColor: '#000000',
    borderRadius: 16,
    margin: 8,
  },
  chartContainer: {
    padding: 4,
    backgroundColor: '#ffffff',
    borderRadius: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#3e3a3a',
    textAlign: 'center',
    fontFamily: 'serif',
  },
});

export default GraficoProduccionLecheScreen;
