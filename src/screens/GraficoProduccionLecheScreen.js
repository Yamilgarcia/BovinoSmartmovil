import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Button, Alert } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Picker } from '@react-native-picker/picker';
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
  const [filtro, setFiltro] = useState("todo");
  const chartRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const produccionPorAnimal = {};

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

        let labels = Object.keys(produccionPorAnimal);
        let data = Object.values(produccionPorAnimal);

        if (filtro === "menos") {
          const threshold = Math.min(...data) + 5;
          labels = labels.filter((_, index) => data[index] <= threshold);
          data = data.filter(value => value <= threshold);
        } else if (filtro === "mas") {
          const threshold = Math.max(...data) - 5;
          labels = labels.filter((_, index) => data[index] >= threshold);
          data = data.filter(value => value >= threshold);
        }

        setDataGrafico({
          labels,
          datasets: [{ data }]
        });
      } catch (error) {
        console.error("Error al obtener datos:", error);
      }
    };

    fetchData();
  }, [filtro]);

  const generarPDF = async () => {
    try {
      const uri = await captureRef(chartRef, {
        format: "png",
        quality: 1,
        width: 800,
        height: 600,
      });

      const doc = new jsPDF();

      // Encabezado del PDF
      doc.setFontSize(16);
      doc.text("Reporte de Producción de Leche por Animal", 10, 10);
      doc.setFontSize(12);
      doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 10, 20);

      // Agregar el gráfico como imagen y expandirlo
      const chartImage = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      doc.addImage(`data:image/png;base64,${chartImage}`, "PNG", 5, 30, 200, 140); // Expande la imagen a 200x140

      // Agregar datos en formato de tabla sin fondo negro
      doc.setFontSize(14);
      doc.text("Detalle de Producción", 10, 180);
      doc.setFontSize(12);

      // Configuración de la tabla
      const startX = 10;
      const startY = 190;
      const rowHeight = 8;
      let yPosition = startY;

      // Encabezado de la tabla sin fondo
      doc.text("Animal", startX + 2, yPosition + 6);
      doc.text("Cantidad", startX + 92, yPosition + 6); // Cambiado a "Cantidad"
      yPosition += rowHeight;

      // Línea debajo del encabezado de la tabla
      doc.line(startX, yPosition, startX + 140, yPosition);
      yPosition += 2;

      // Datos de la tabla
      dataGrafico.labels.forEach((label, index) => {
        const produccion = dataGrafico.datasets[0].data[index];
        doc.text(label, startX + 2, yPosition + 6); // Columna de animal
        doc.text(`${produccion} L`, startX + 92, yPosition + 6); // Columna de producción
        yPosition += rowHeight;
      });

      // Pie de página
      doc.setFontSize(10);
      doc.text("Reporte generado por Sistema de Producción de Leche", 10, 290);

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
      <View style={styles.container} ref={chartRef}>
        <Text style={styles.title}>Producción de Leche por Animal</Text>

        <Picker
          selectedValue={filtro}
          onValueChange={(itemValue) => setFiltro(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Todo" value="todo" />
          <Picker.Item label="Menos Producción" value="menos" />
          <Picker.Item label="Más Producción" value="mas" />
        </Picker>

        {dataGrafico.labels.length > 0 && (
          <LineChart
            data={dataGrafico}
            width={screenWidth - (screenWidth * 0.1)}
            height={250}
            chartConfig={{
              backgroundGradientFrom: "#fff",
              backgroundGradientTo: "#ffff",
              color: (opacity = 1) => `rgba(0, 150, 136, ${opacity})`,
              labelColor: () => `#00796b`,
              fillShadowGradient: "#00796b",
              fillShadowGradientOpacity: 0.8,
              style: {
                borderRadius: 16,
              },
            }}
            bezier
            verticalLabelRotation={30}
            style={{
              marginVertical: 8,
              borderRadius: 16,
              backgroundColor: '#ffffff',
            }}
          />
        )}
        <Button title="Generar PDF" onPress={generarPDF} color="#28a745" />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    margin: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  chartContainer: {
    padding: 8,
    backgroundColor: '#ffffff',
    borderRadius: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000000',
    textAlign: 'center',
    fontFamily: 'serif'
  },
  picker: {
    height: 50,
    width: "80%",
    alignSelf: 'center',
    marginBottom: 20,
  },
});

export default GraficoProduccionLecheScreen;
