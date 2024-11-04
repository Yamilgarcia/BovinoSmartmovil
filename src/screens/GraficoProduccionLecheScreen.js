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
        <BarChart
          data={dataGrafico}
          width={screenWidth - (screenWidth * 0.1)}
          height={250}
          chartConfig={{
            backgroundGradientFrom: "#e5d4b5",
            backgroundGradientTo: "#f7f2e7",
            color: (opacity = 1) => `rgba(34, 139, 34, ${opacity})`, // Verde oscuro para las barras
            labelColor: () => `#3e3a3a`,
            fillShadowGradient: "#228B22", // Sombra verde para las barras
            fillShadowGradientOpacity: 0.8,
            style: {
              borderRadius: 16,
            },
          }}
          verticalLabelRotation={30}
          style={{
            marginVertical: 8,
            borderRadius: 16,
            backgroundColor: '#fff8dc',
          }}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#e5d4b5',
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
