import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Button, Alert } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { captureRef } from 'react-native-view-shot';
import { jsPDF } from 'jspdf';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { db } from '../../src/conection/firebase';
import { collection, getDocs } from 'firebase/firestore';

const GraficoProductosAplicadosScreen = () => {
  const [dataGrafico, setDataGrafico] = useState({
    labels: [],
    datasets: [{ data: [] }]
  });

  const chartRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
      const conteoPorProducto = {};

      // Obtener la lista de productos y contar cuántas veces aparece cada nombre
      const productosSnapshot = await getDocs(collection(db, 'productos'));
      productosSnapshot.forEach(productoDoc => {
        const productoData = productoDoc.data();
        const nombreProducto = productoData.nombre; // Nombre del producto

        // Contar cada aparición del producto por nombre
        conteoPorProducto[nombreProducto] = (conteoPorProducto[nombreProducto] || 0) + 1;
      });

      // Crear datos para el gráfico de barras
      const labels = Object.keys(conteoPorProducto);
      const data = Object.values(conteoPorProducto);

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
        width: 800,
        height: 600,
      });

      // Crear el PDF
      const doc = new jsPDF();
      doc.text("Reporte de Productos Más Aplicados", 10, 10);

      // Leer la imagen capturada y agregarla al PDF
      const chartImage = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      doc.addImage(`data:image/png;base64,${chartImage}`, "PNG", 10, 20, 180, 120);

      // Agregar datos de texto al PDF
      dataGrafico.labels.forEach((label, index) => {
        const aplicaciones = dataGrafico.datasets[0].data[index];
        doc.text(`${label}: ${aplicaciones} veces registrado`, 10, 150 + index * 10);
      });

      // Guardar y compartir el PDF
      const pdfBase64 = doc.output('datauristring').split(',')[1];
      const fileUri = `${FileSystem.documentDirectory}reporte_productos_mas_aplicados.pdf`;

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
        <Text style={styles.title}>Productos Más Aplicados</Text>
        <View ref={chartRef} style={styles.chartContainer}>
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
              backgroundColor: '#ffffff', // Fondo blanco del contenedor del gráfico
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
    padding: 10,
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
    color: '#000000',
    textAlign: 'center',
  },
});

export default GraficoProductosAplicadosScreen;

