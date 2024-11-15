import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Image, ScrollView, Button, Alert } from 'react-native';
import { db } from '../../src/conection/firebase';
import { doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';

const PerfilAnimalScreen = ({ route, navigation }) => {
    const { animalId } = route.params;

    const [animal, setAnimal] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [fechaNacimiento, setFechaNacimiento] = useState(new Date());
    const [mostrarFechaNacimiento, setMostrarFechaNacimiento] = useState(false);

    const [baños, setBaños] = useState([]);
    const [produccionLeche, setProduccionLeche] = useState([]);
    const [inseminaciones, setInseminaciones] = useState([]);
    const [enfermedades, setEnfermedades] = useState([]);
    const [productosAplicados, setProductosAplicados] = useState([]);
    const [estadoReproductivo, setEstadoReproductivo] = useState({
        ciclo_celo: '',
        servicios_realizados: 0,
        numero_gestaciones: 0,
        partos_realizados: 0,
        resultados_lactancia: '',
        uso_programa_inseminacion: '',
        resultado_prueba_reproductiva: '',
    });

    useEffect(() => {
        fetchAnimalData();
    }, [animalId]);

    const fetchAnimalData = async () => {
        try {
            const docRef = doc(db, 'animales', animalId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const animalData = docSnap.data();
                setAnimal({ id: animalId, ...animalData });
                if (animalData.fecha_nacimiento) setFechaNacimiento(new Date(animalData.fecha_nacimiento));

                // Fetch related data
                await Promise.all([
                    fetchBaños(),
                    fetchProduccionLeche(),
                    fetchInseminaciones(),
                    fetchEnfermedades(),
                    fetchProductosAplicados(),
                    fetchEstadoReproductivo(),
                ]);
            } else {
                console.log('El documento no existe.');
            }
        } catch (error) {
            console.error('Error al obtener los datos del animal:', error);
        }
    };

    const fetchBaños = async () => {
        const snapshot = await getDocs(collection(db, `animales/${animalId}/control_banos`));
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setBaños(data);
    };

    const fetchProduccionLeche = async () => {
        const snapshot = await getDocs(collection(db, `animales/${animalId}/produccion_leche`));
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setProduccionLeche(data);
    };

    const fetchInseminaciones = async () => {
        const snapshot = await getDocs(collection(db, `animales/${animalId}/inseminaciones`));
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setInseminaciones(data);
    };

    const fetchEnfermedades = async () => {
        const snapshot = await getDocs(collection(db, `animales/${animalId}/enfermedades`));
        const enfermedadesData = await Promise.all(snapshot.docs.map(async (docSnapshot) => {
            const enfermedadData = docSnapshot.data();
            const enfermedadRef = doc(db, 'enfermedades', enfermedadData.enfermedad);
            const enfermedadSnap = await getDoc(enfermedadRef);
            const nombreEnfermedad = enfermedadSnap.exists() ? enfermedadSnap.data().nombre : 'Desconocido';
            return { id: docSnapshot.id, nombre: nombreEnfermedad, fecha: enfermedadData.fecha };
        }));
        setEnfermedades(enfermedadesData);
    };

    const fetchProductosAplicados = async () => {
        const snapshot = await getDocs(collection(db, `animales/${animalId}/productosAplicados`));
        const data = snapshot.docs.map((docSnapshot) => {
            const productoData = docSnapshot.data();
            return {
                id: docSnapshot.id,
                nombre: productoData.nombre,
                dosis: productoData.dosis,
                fecha: productoData.fecha && productoData.fecha.toDate ? productoData.fecha.toDate() : null, // Conversión de Timestamp a Date
            };
        });
        setProductosAplicados(data);
    };



    const fetchEstadoReproductivo = async () => {
        const snapshot = await getDocs(collection(db, `animales/${animalId}/estado_reproductivo`));
        if (!snapshot.empty) setEstadoReproductivo(snapshot.docs[0].data());
    };

    const seleccionarImagen = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled && result.assets.length > 0) {
            setAnimal({ ...animal, imagen: result.assets[0].uri });
        }
    };

    const formatDate = (date) => {
        if (!date) return '';
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const handleUpdateAnimal = async () => {
        try {
            if (animal) {
                const docRef = doc(db, 'animales', animalId);
                await updateDoc(docRef, {
                    ...animal,
                    fecha_nacimiento: fechaNacimiento.toISOString().split('T')[0],
                    ...estadoReproductivo,
                });

                Alert.alert('Éxito', 'Animal actualizado correctamente.');
                setIsEditing(false);
                fetchAnimalData();
            }
        } catch (error) {
            console.error('Error al actualizar el animal:', error);
            Alert.alert('Error', 'No se pudo actualizar el animal.');
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {animal ? (
                <>
                    <View style={styles.card}>
                        <TouchableOpacity onPress={seleccionarImagen}>
                            <Image source={{ uri: animal.imagen || 'https://via.placeholder.com/150' }} style={styles.image} />
                        </TouchableOpacity>

                        {!isEditing ? (
                            <>
                                <Text style={styles.text}>Nombre: {animal.nombre}</Text>
                                <Text style={styles.text}>Código: {animal.codigo_idVaca}</Text>
                                <Text style={styles.text}>Sexo: {animal.sexo}</Text>
                                <Text style={styles.text}>Fecha de Nacimiento: {formatDate(fechaNacimiento)}</Text>
                                <Text style={styles.text}>Raza: {animal.raza}</Text>
                                <Text style={styles.text}>Observaciones: {animal.observaciones}</Text>
                                <Text style={styles.text}>Estado: {animal.estado}</Text>
                                <Text style={styles.text}>Peso al Nacer: {animal.peso_nacimiento} kg</Text>
                                <Text style={styles.text}>Peso al Destete: {animal.peso_destete} kg</Text>
                                <Text style={styles.text}>Peso Actual: {animal.peso_actual} kg</Text>

                                {animal.sexo === 'Macho' ? (
                                    <>
                                        <Text style={styles.subtitle}>Datos de Macho:</Text>
                                        <Text style={styles.text}>Uso en Programa de Inseminación: {estadoReproductivo.uso_programa_inseminacion || 'N/A'}</Text>
                                        <Text style={styles.text}>Resultado de la Prueba Reproductiva: {estadoReproductivo.resultado_prueba_reproductiva || 'N/A'}</Text>
                                    </>
                                ) : (
                                    <>
                                        <Text style={styles.subtitle}>Datos de Hembra:</Text>
                                        <Text style={styles.text}>Ciclo de Celo: {estadoReproductivo.ciclo_celo || 'N/A'}</Text>
                                        <Text style={styles.text}>Servicios Realizados: {estadoReproductivo.servicios_realizados || 'N/A'}</Text>
                                        <Text style={styles.text}>Número de Gestaciones: {estadoReproductivo.numero_gestaciones || 'N/A'}</Text>
                                        <Text style={styles.text}>Partos Realizados: {estadoReproductivo.partos_realizados || 'N/A'}</Text>
                                        <Text style={styles.text}>Resultados de Lactancia: {estadoReproductivo.resultados_lactancia || 'N/A'}</Text>
                                    </>
                                )}

                                <Text style={styles.subtitle}>Historial de Baños:</Text>
                                {baños.map((b) => (
                                    <Text key={b.id}>- {b.fecha}: {b.productos_utilizados}</Text>
                                ))}

                                <Text style={styles.subtitle}>Producción de Leche:</Text>
                                {produccionLeche.map((prod) => (
                                    <Text key={prod.id}>- {formatDate(new Date(prod.fecha))}: {prod.cantidad}L ({prod.calidad})</Text>
                                ))}

                                <Text style={styles.subtitle}>Inseminaciones:</Text>
                                {inseminaciones.map((ins) => (
                                    <Text key={ins.id}>- {formatDate(new Date(ins.fecha_inseminacion))}: {ins.tipo_inseminacion} ({ins.resultado})</Text>
                                ))}

                                <Text style={styles.subtitle}>Enfermedades:</Text>
                                {enfermedades.map((enf) => (
                                    <Text key={enf.id}>- {enf.nombre} ({formatDate(new Date(enf.fecha))})</Text>
                                ))}

                                <Text style={styles.subtitle}>Productos Aplicados:</Text>
                                {productosAplicados.map((prod) => (
                                    <Text key={prod.id}>
                                        - {prod.nombre} ({prod.dosis}) - {prod.fecha ? formatDate(prod.fecha) : 'Fecha no disponible'}
                                    </Text>
                                ))}


                                <Button title="Editar" onPress={() => setIsEditing(true)} />
                            </>
                        ) : (
                            <>
                                {/* Edición de datos */}
                                <TextInput
                                    style={styles.input}
                                    value={animal.nombre}
                                    onChangeText={(text) => setAnimal({ ...animal, nombre: text })}
                                    placeholder="Nombre"
                                />
                                {/* Resto de los campos editables */}
                                <Button title="Guardar Cambios" onPress={handleUpdateAnimal} />
                                <Button title="Cancelar" onPress={() => setIsEditing(false)} />
                            </>
                        )}
                    </View>
                </>
            ) : (
                <Text>Cargando datos...</Text>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    card: {
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 3,
    },
    image: {
        width: 150,
        height: 150,
        borderRadius: 10,
        marginBottom: 20,
    },
    text: {
        fontSize: 16,
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 15,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
    },
    button: {
        backgroundColor: '#007BFF',
        padding: 10,
        borderRadius: 5,
        marginVertical: 10,
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
    },
});

export default PerfilAnimalScreen;
