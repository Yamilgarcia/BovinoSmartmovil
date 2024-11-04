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
        <Text style={styles.title}>Enfermedades con más frecuencia</Text>
        <ScrollView horizontal contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.chartContainer}>
            <BarChart
              data={dataGrafico}
              width={Math.max(screenWidth, dataGrafico.labels.length * 60)} // Ajuste de ancho dinámico
              height={Math.max(250, dataGrafico.datasets[0].data.length * 30)} // Ajuste de altura dinámico
              chartConfig={{
                backgroundGradientFrom: "#d4edda", // Verde claro
                backgroundGradientTo: "#c3e6cb", // Verde más claro
                color: (opacity = 1) => `rgba(34, 139, 34, ${opacity})`, // Verde oscuro para las barras
                labelColor: () => `#2d6a4f`, // Verde oscuro para las etiquetas
                fillShadowGradient: "#28a745", // Sombra verde para las barras
                fillShadowGradientOpacity: 0.8,
                style: {
                  borderRadius: 16,
                },
              }}
              verticalLabelRotation={10}
              style={{
                marginVertical: 8,
                borderRadius: 12,
                backgroundColor: '#f0fdf4', // Fondo verde muy claro dentro del gráfico
              }}
            />
          </View>
        </ScrollView>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#ffffff', // 
    borderWidth: 1,
    borderColor: '#000000', //
    borderRadius: 12,
    margin: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000000', //
    textAlign: 'center',
    fontFamily: 'serif',
  },
  chartContainer: {
    padding: 6,
    backgroundColor: '#ffffff', // Fondo blanco para el contenedor del gráfico
    borderRadius: 12,
  }
});

export default GraficoEnfermedadesScreen;
