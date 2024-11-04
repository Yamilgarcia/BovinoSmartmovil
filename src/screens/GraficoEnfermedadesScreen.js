import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { db } from '../../src/conection/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

const GraficoEnfermedadesScreen = () => {
  const [dataGrafico, setDataGrafico] = useState({
    labels: [],
    datasets: [{ data: [] }]
  });

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

  let screenWidth = Dimensions.get("window").width;

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
      <View style={styles.container}>
        <Text style={styles.title}>Conteo de Enfermedades</Text>
        <BarChart
          data={dataGrafico}
          width={screenWidth - (screenWidth * 0.1)}
          height={250}
          chartConfig={{
            backgroundGradientFrom: "#e5d4b5", // Fondo beige claro
            backgroundGradientTo: "#f7f2e7", // Fondo beige más claro
            color: (opacity = 1) => `rgba(139, 69, 19, ${opacity})`, // Marrón similar a madera para las barras
            labelColor: () => `#3e3a3a`, // Gris oscuro para el texto
            fillShadowGradient: "#8B4513", // Gradiente de sombra en marrón
            fillShadowGradientOpacity: 0.8,
            style: {
              borderRadius: 16,
            },
          }}
          verticalLabelRotation={30}
          style={{
            marginVertical: 8,
            borderRadius: 16,
            backgroundColor: '#fff8dc', // Fondo marrón claro para el contenedor
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
    backgroundColor: '#e5d4b5', // Fondo beige claro para todo el contenedor
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#3e3a3a', // Gris oscuro para el texto principal
    textAlign: 'center',
    fontFamily: 'serif', // Usar una fuente con estilo más tradicional si es posible
  },
});

export default GraficoEnfermedadesScreen;
