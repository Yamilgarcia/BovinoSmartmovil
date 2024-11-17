import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { db } from '../../src/conection/firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';

const InformeMedicoScreen = ({ route, navigation }) => {
  const { animal } = route.params;
  const [enfermedadesDetalladas, setEnfermedadesDetalladas] = useState([]);

  useEffect(() => {
    const fetchEnfermedadesDetalladas = async () => {
      if (animal && animal.id) {
        try {
          // Obtener las enfermedades desde la subcolección
          const enfermedadesSnapshot = await getDocs(
            collection(db, `animales/${animal.id}/enfermedades`)
          );

          const enfermedades = enfermedadesSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          // Obtener los nombres de las enfermedades desde la colección principal
          const detalles = await Promise.all(
            enfermedades.map(async (enfermedad) => {
              const enfermedadDoc = await getDoc(doc(db, 'enfermedades', enfermedad.enfermedad));
              if (enfermedadDoc.exists()) {
                return {
                  nombre: enfermedadDoc.data().nombre,
                  fecha: formatDate(enfermedad.fecha), // Formatear la fecha
                };
              }
              return null;
            })
          );

          // Filtrar null y actualizar el estado
          setEnfermedadesDetalladas(detalles.filter((detalle) => detalle !== null));
        } catch (error) {
          console.error('Error al cargar enfermedades detalladas:', error);
        }
      }
    };

    fetchEnfermedadesDetalladas();
  }, [animal]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleExportarInforme = () => {
    navigation.navigate('ResultadoInforme', { animal, enfermedadesDetalladas });
  };

  if (!animal) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No se proporcionaron datos del animal.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Informe Médico</Text>
      <Text style={styles.label}>Nombre: {animal.nombre}</Text>
      <Text style={styles.label}>ID: {animal.codigo_idVaca}</Text>
      <Text style={styles.label}>Raza: {animal.raza}</Text>
      <Text style={styles.label}>Estado: {animal.estado}</Text>
      <Text style={styles.label}>Enfermedades:</Text>
      {enfermedadesDetalladas.length > 0 ? (
        enfermedadesDetalladas.map((enfermedad, index) => (
          <Text key={index} style={styles.enfermedadItem}>
            - {enfermedad.nombre} (Fecha: {enfermedad.fecha})
          </Text>
        ))
      ) : (
        <Text>No tiene enfermedades registradas.</Text>
      )}

      <TouchableOpacity style={styles.button} onPress={handleExportarInforme}>
        <Text style={styles.buttonText}>Exportar Informe</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
  },
  enfermedadItem: {
    fontSize: 16,
    marginBottom: 5,
  },
  button: {
    backgroundColor: '#6dbf47',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    fontSize: 18,
  },
});

export default InformeMedicoScreen;
