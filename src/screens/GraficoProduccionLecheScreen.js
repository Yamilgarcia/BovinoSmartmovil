import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { db } from '../../src/conection/firebase';
import { collection, getDocs } from 'firebase/firestore';

const GraficoProduccionLecheScreen = () => {
  const [dataGrafico, setDataGrafico] = useState({
    labels: [],
    datasets: [{ data: [] }]
  });

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

  let screenWidth = Dimensions.get("window").width;

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
      <View style={styles.container}>
        <Text style={styles.title}>Producción de Leche por Animal</Text>
        <View style={styles.chartContainer}>
          <BarChart
            data={dataGrafico}
            width={screenWidth - (screenWidth * 0.1)}
            height={250}
            chartConfig={{
              backgroundGradientFrom: "#d4edda", // Fondo verde claro
              backgroundGradientTo: "#c3e6cb", // Fondo degradado verde
              color: (opacity = 1) => `rgba(34, 139, 34, ${opacity})`, // Verde oscuro para las barras
              labelColor: () => `#2d6a4f`, // Verde oscuro para las etiquetas
              fillShadowGradient: "#28a745", // Sombra verde para las barras
              fillShadowGradientOpacity: 0.8,
              style: {
                borderRadius: 16,
              },
            }}
            verticalLabelRotation={30}
            style={{
              marginVertical: 8,
              borderRadius: 16,
              backgroundColor: '#ffffff', // Fondo blanco dentro del gráfico
            }}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#ffffff', // Fondo blanco para el contenedor principal
    borderWidth: 1, // Ancho del borde
    borderColor: '#000000', // Color del borde
    borderRadius: 16, // Bordes redondeados
    margin: 8, // Espacio exterior para que el borde no toque el límite de la pantalla
  },
  chartContainer: {
    padding: 4, // Espacio interior para que el borde no toque el gráfico directamente
    backgroundColor: '#ffffff', // Fondo blanco para el contenedor del gráfico
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
