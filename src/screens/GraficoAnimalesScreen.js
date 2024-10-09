import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { db } from '../../firebase'; // Ajusta la ruta según la ubicación de tu archivo firebase.js
import { collection, onSnapshot } from 'firebase/firestore';

const GraficoAnimalesScreen = () => {
  const [dataGrafico, setDataGrafico] = useState([]);

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

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
      <View style={styles.container}>
        <Text style={styles.title}>Registro de Animales por Mes</Text>
        <PieChart
          data={dataGrafico}
          width={Dimensions.get("window").width - 40}
          height={220}
          chartConfig={{
            backgroundColor: "#ffffff", // Fondo del gráfico
            backgroundGradientFrom: "#ffffff", // Color inicial del gradiente de fondo
            backgroundGradientTo: "#ffffff", // Color final del gradiente de fondo
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`, // Color de los segmentos
            labelColor: () => `#344e41`, // Color de las etiquetas
            style: {
              borderRadius: 16,
            },
          }}
          accessor="count"
          paddingLeft="15"
          style={{
            marginVertical: 8,
            borderRadius: 16,
            backgroundColor: '#ffffff', // Asegúrate de que el fondo sea blanco
          }}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#344e41',
    textAlign: 'center', // Centrar el texto
  },
});

export default GraficoAnimalesScreen;
