import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Modal, Pressable } from 'react-native'; // Modal y Pressable para mejorar detalles
import { PieChart } from 'react-native-chart-kit';
import { db } from '../../firebase'; // Ajusta la ruta según la ubicación de tu archivo firebase.js
import { collection, onSnapshot } from 'firebase/firestore';

const GraficoAnimalesScreen = () => {
  const [dataGrafico, setDataGrafico] = useState([]);
  const [detalleMes, setDetalleMes] = useState(null); // Estado para manejar detalles por mes
  const [modalVisible, setModalVisible] = useState(false); // Estado para controlar la visibilidad del modal

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'animales'), (querySnapshot) => {
      const animalesList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Contar animales por mes
      const conteoPorMes = Array(12).fill(0);
      animalesList.forEach(animal => {
        const month = new Date(animal.fecha_nacimiento).getMonth();
        if (month >= 0 && month < 12) {
          conteoPorMes[month] += 1;
        }
      });

      // Crear datos para el gráfico de pastel
      const nuevoDataGrafico = conteoPorMes.map((count, index) => ({
        name: getMonthName(index),
        count: count,
        color: getColor(index),
        legendFontColor: "#344e41", // Color de las leyendas
        legendFontSize: 15,
      
      })).filter(item => item.count > 0); // Filtrar meses sin animales

      setDataGrafico(nuevoDataGrafico);
    });

    return () => unsubscribe(); // Limpiar el listener al desmontar el componente
  }, []);

  // Función para obtener el nombre del mes
  const getMonthName = (index) => {
    const months = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    return months[index];
  };

  // Función para obtener el color del mes
  const getColor = (index) => {
    const colors = [
      "#FF5733", "#33FF57", "#3357FF", "#F1C40F", "#E74C3C", "#8E44AD", // Cambia los colores aquí
      "#3498DB", "#2ECC71", "#9B59B6", "#34495E", "#F39C12", "#D35400"
    ];
    return colors[index % colors.length];
  };

  // Función para manejar cuando un segmento es tocado
  const handleSegmentClick = (index) => {
    const mesSeleccionado = dataGrafico[index].name;  // Usar el nombre directamente de dataGrafico
    setDetalleMes({
      mes: mesSeleccionado,
      count: dataGrafico[index].count
    }); // Actualizar el estado con el mes y número de animales
    setModalVisible(true); // Mostrar el modal con detalles
  };

  let screenWidth = Dimensions.get("window").width;

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
      <View style={styles.container}>
        <Text style={styles.title}>Registro de Animales por Mes</Text>
        <PieChart
          data={dataGrafico}
          width={screenWidth - (screenWidth * 0.1)}
          height={250} 
          chartConfig={{
            backgroundGradientFrom: "rgba(255, 0, 0, 0.1)", // Aplicando un fondo degradado similar
            backgroundGradientFromOpacity: 0.1,
            backgroundGradientTo: "rgba(255, 0, 0, 0.1)", 
            backgroundGradientToOpacity: 0.1,
            color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`, // Color de los segmentos con opacidad
            strokeWidth: 2, // Grosor de las líneas del gráfico
            barPercentage: 0.5,
            fillShadowGradient: "#FF4444", 
            fillShadowGradientOpacity: 1,
            labelColor: () => `#344e41`, // Color de las etiquetas
            style: {
              borderRadius: 16,
            },
          }}
          accessor="count"
          paddingLeft="50"
          style={{
            marginVertical: 8,
            borderRadius: 16,
            backgroundColor: '#ffffff', // Asegúrate de que el fondo sea blanco
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
      </View>

      {/* Modal para Detalles del Mes Seleccionado */}
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#344e41',
    textAlign: 'center', // Centrar el texto
  },
  leyendasContainer: {
    marginTop: 20,
    alignItems: 'center',
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
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
