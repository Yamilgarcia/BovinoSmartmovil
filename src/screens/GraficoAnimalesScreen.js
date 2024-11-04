import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Modal, Pressable, Button, Alert } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { captureRef } from 'react-native-view-shot';
import { jsPDF } from 'jspdf';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { db } from '../../src/conection/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import GraficoEnfermedadesScreen from './GraficoEnfermedadesScreen';
import GraficoProduccionLecheScreen from './GraficoProduccionLecheScreen';

const GraficoAnimalesScreen = () => {
  const [dataGrafico, setDataGrafico] = useState([]);
  const [detalleMes, setDetalleMes] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const chartRef = useRef();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'animales'), (querySnapshot) => {
      const animalesList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      const conteoPorMes = Array(12).fill(0);
      animalesList.forEach(animal => {
        const month = new Date(animal.fecha_nacimiento).getMonth();
        if (month >= 0 && month < 12) {
          conteoPorMes[month] += 1;
        }
      });

      const nuevoDataGrafico = conteoPorMes.map((count, index) => ({
        name: getMonthName(index),
        count: count,
        color: getColor(index),
        legendFontColor: "#344e41",
        legendFontSize: 12,
      })).filter(item => item.count > 0);

      setDataGrafico(nuevoDataGrafico);
    });

    return () => unsubscribe();
  }, []);

  const getMonthName = (index) => {
    const months = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    return months[index];
  };

  const getColor = (index) => {
    const colors = [
      "#FF5733", "#33FF57", "#3357FF", "#F1C40F", "#E74C3C", "#8E44AD",
      "#3498DB", "#2ECC71", "#9B59B6", "#34495E", "#F39C12", "#D35400"
    ];
    return colors[index % colors.length];
  };

  const handleSegmentClick = (index) => {
    const mesSeleccionado = dataGrafico[index].name;
    setDetalleMes({
      mes: mesSeleccionado,
      count: dataGrafico[index].count
    });
    setModalVisible(true);
  };

  const generarPDF = async () => {
    try {
      const uri = await captureRef(chartRef, {
        format: "png",
        quality: 1,
        width: 800,
        height: 600,
      });

      const doc = new jsPDF();
      doc.text("Reporte de Animales por Mes", 10, 10);

      const chartImage = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      doc.addImage(`data:image/png;base64,${chartImage}`, "PNG", 10, 20, 180, 120);

      dataGrafico.forEach((item, index) => {
        doc.text(`${item.name}: ${item.count} animales`, 10, 150 + index * 10);
      });

      const pdfBase64 = doc.output('datauristring').split(',')[1];
      const fileUri = `${FileSystem.documentDirectory}reporte_animales_por_mes.pdf`;

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
        <Text style={styles.title}>Registro de Animales por Mes</Text>
        <PieChart
          ref={chartRef}
          data={dataGrafico}
          width={screenWidth - (screenWidth * 0.1)}
          height={250}
          chartConfig={{
            backgroundGradientFrom: "rgba(255, 0, 0, 0.1)",
            backgroundGradientFromOpacity: 0.1,
            backgroundGradientTo: "rgba(255, 0, 0, 0.1)",
            backgroundGradientToOpacity: 0.1,
            color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`,
            strokeWidth: 2,
            barPercentage: 0.5,
            fillShadowGradient: "#FF4444",
            fillShadowGradientOpacity: 1,
            labelColor: () => `#344e41`,
            style: {
              borderRadius: 16,
            },
          }}
          accessor="count"
          paddingLeft="14"
          style={{
            marginVertical: 8,
            borderRadius: 16,
            backgroundColor: '#ffffff',
          }}
          backgroundColor='transparent'
        />
        
        <View style={styles.leyendasContainer}>
          {dataGrafico.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.leyendaItem} 
              onPress={() => handleSegmentClick(index)}
            >
              <View style={[styles.colorBox, { backgroundColor: item.color }]} />
              <Text style={styles.leyendaText}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Button title="Generar PDF" onPress={generarPDF} color="#28a745" />
      </View>

      {detalleMes && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>Detalle de {detalleMes.mes}</Text>
              <Text style={styles.modalText}>Número de animales registrados: {detalleMes.count}</Text>
              <Pressable
                style={[styles.button, styles.buttonClose]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.textStyle}>Cerrar</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      )}

      <GraficoEnfermedadesScreen/>
      <GraficoProduccionLecheScreen/>
      
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#ffff',
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 16,
    margin: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#344e41',
    textAlign: 'center',
  },
  leyendasContainer: {
    marginTop: 20,
    alignItems: 'flex-start',
  },
  leyendaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  leyendaText: {
    fontSize: 16,
    color: '#344e41',
    marginLeft: 10,
  },
  colorBox: {
    width: 20,
    height: 20,
    borderRadius: 5,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#344e41',
  },
  modalText: {
    fontSize: 18,
    color: '#344e41',
  },
  button: {
    borderRadius: 10,
    padding: 10,
    elevation: 2,
  },
  buttonClose: {
    backgroundColor: '#2196F3',
    marginTop: 20,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default GraficoAnimalesScreen;
