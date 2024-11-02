import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Image, Button, ScrollView } from 'react-native';
import { db } from '../../src/conection/firebase';
import { doc, getDoc, updateDoc, collection, addDoc, getDocs } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

const PerfilAnimalScreen = ({ route, navigation }) => {
    const { animalId } = route.params;
    const [animal, setAnimal] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [mostrarFechaNacimiento, setMostrarFechaNacimiento] = useState(false);
    const [fechaNacimiento, setFechaNacimiento] = useState(new Date());
    const [enfermedades, setEnfermedades] = useState([]);
    const [enfermedadesDisponibles, setEnfermedadesDisponibles] = useState([]);
    const [nuevaEnfermedad, setNuevaEnfermedad] = useState('');
    const [fechaNuevaEnfermedad, setFechaNuevaEnfermedad] = useState(new Date());
    const [mostrarFechaNuevaEnfermedad, setMostrarFechaNuevaEnfermedad] = useState(false);

    useEffect(() => {
        fetchAnimal();
        fetchEnfermedades();
        fetchEnfermedadesDisponibles();
    }, [animalId]);

    const fetchAnimal = async () => {
        try {
            const docRef = doc(db, 'animales', animalId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                setAnimal({ id: animalId, ...docSnap.data() });
                if (docSnap.data().fecha_nacimiento) {
                    setFechaNacimiento(new Date(docSnap.data().fecha_nacimiento));
                }
            } else {
                console.log('No such document!');
            }
        } catch (error) {
            console.error('Error al obtener los datos del animal: ', error);
        }
    };

    const fetchEnfermedades = async () => {
        try {
            const enfermedadesSnapshot = await getDocs(collection(db, `animales/${animalId}/enfermedades`));
            const listaEnfermedades = [];

            for (let enfermedadDoc of enfermedadesSnapshot.docs) {
                const enfermedadData = enfermedadDoc.data();
                const enfermedadRef = doc(db, 'enfermedades', enfermedadData.enfermedad);
                const enfermedadSnap = await getDoc(enfermedadRef);

                if (enfermedadSnap.exists()) {
                    listaEnfermedades.push({
                        id: enfermedadDoc.id,
                        nombre: enfermedadSnap.data().nombre,
                        fecha: enfermedadData.fecha,
                    });
                }
            }

            setEnfermedades(listaEnfermedades);
        } catch (error) {
            console.error('Error al obtener las enfermedades: ', error);
        }
    };

    const fetchEnfermedadesDisponibles = async () => {
        try {
            const enfermedadesSnap = await getDocs(collection(db, 'enfermedades'));
            const listaEnfermedadesDisponibles = enfermedadesSnap.docs.map((doc) => ({
                id: doc.id,
                nombre: doc.data().nombre,
            }));
            setEnfermedadesDisponibles(listaEnfermedadesDisponibles);
        } catch (error) {
            console.error('Error al obtener las enfermedades disponibles: ', error);
        }
    };

    const seleccionarImagen = async () => {
        let resultado = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!resultado.canceled && resultado.assets.length > 0) {
            setAnimal({ ...animal, imagen: resultado.assets[0].uri });
        }
    };

    const handleUpdateAnimal = async () => {
        if (animal) {
            try {
                const docRef = doc(db, 'animales', animalId);
                await updateDoc(docRef, {
                    nombre: animal.nombre,
                    codigo_idVaca: animal.codigo_idVaca,
                    peso_nacimiento: parseFloat(animal.peso_nacimiento),
                    peso_destete: parseFloat(animal.peso_destete),
                    peso_actual: parseFloat(animal.peso_actual),
                    fecha_nacimiento: fechaNacimiento.toISOString().split('T')[0],
                    imagen: animal.imagen,
                    observaciones: animal.observaciones,
                });

                // Actualizar enfermedades existentes
                for (let enf of enfermedades) {
                    const enfermedadRef = doc(db, `animales/${animalId}/enfermedades`, enf.id);
                    await updateDoc(enfermedadRef, {
                        fecha: enf.fecha,
                    });
                }

                // Agregar nueva enfermedad
                if (nuevaEnfermedad) {
                    await addDoc(collection(db, `animales/${animalId}/enfermedades`), {
                        enfermedad: nuevaEnfermedad,
                        fecha: fechaNuevaEnfermedad.toISOString().split('T')[0],
                    });
                    setNuevaEnfermedad('');
                }

                alert('Animal y enfermedades actualizados correctamente');
                setIsEditing(false);
                fetchEnfermedades(); // Actualiza la lista de enfermedades después de guardar
            } catch (error) {
                console.error('Error al actualizar el animal: ', error);
                alert('Error al actualizar el animal');
            }
        }
    };

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
            <View style={styles.container}>
                {animal ? (
                    <>
                        <View style={styles.header}>
                            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                                <Text style={styles.backButtonText}>←</Text>
                            </TouchableOpacity>
                            <Text style={styles.title}>Información general del Animal:</Text>
                        </View>

                        <View style={styles.card}>
                            <TouchableOpacity onPress={seleccionarImagen}>
                                <Image
                                    source={{ uri: animal.imagen || 'https://via.placeholder.com/150' }}
                                    style={styles.cardImage}
                                />
                            </TouchableOpacity>

                            {!isEditing ? (
                                <>
                                    <Text style={styles.infoText}>Nombre del Animal: {animal.nombre}</Text>
                                    <Text style={styles.infoText}>Código: {animal.codigo_idVaca}</Text>
                                    <Text style={styles.infoText}>Fecha de Nacimiento: {animal.fecha_nacimiento}</Text>
                                    <Text style={styles.infoText}>Peso al Nacer: {animal.peso_nacimiento} KG</Text>
                                    <Text style={styles.infoText}>Peso al Destete: {animal.peso_destete} KG</Text>
                                    <Text style={styles.infoText}>Peso Actual: {animal.peso_actual} KG</Text>
                                    <Text style={styles.infoText}>Observaciones: {animal.observaciones}</Text>

                                    <View style={styles.section}>
                                        <Text style={styles.subtitle}>Historial Médico:</Text>
                                        {enfermedades.length > 0 ? (
                                            enfermedades.map((enf, index) => (
                                                <View key={index} style={styles.enfermedadCard}>
                                                    <Text style={styles.enfermedadText}>Enfermedad: {enf.nombre}</Text>
                                                    <Text style={styles.enfermedadText}>Fecha: {enf.fecha}</Text>
                                                </View>
                                            ))
                                        ) : (
                                            <Text style={styles.infoText}>No hay historial médico registrado.</Text>
                                        )}
                                    </View>

                                    <Button title="Editar" onPress={() => setIsEditing(true)} />
                                </>
                            ) : (
                                <>
                                    <TextInput
                                        style={styles.input}
                                        value={animal.nombre}
                                        onChangeText={(text) => setAnimal({ ...animal, nombre: text })}
                                        placeholder="Nombre del Animal"
                                    />
                                    <TextInput
                                        style={styles.input}
                                        value={animal.codigo_idVaca}
                                        onChangeText={(text) => setAnimal({ ...animal, codigo_idVaca: text })}
                                        placeholder="Código ID Vaca"
                                    />
                                    <TouchableOpacity onPress={() => setMostrarFechaNacimiento(true)} style={styles.button}>
                                        <Text style={styles.buttonText}>Seleccionar Fecha de Nacimiento</Text>
                                    </TouchableOpacity>
                                    {mostrarFechaNacimiento && (
                                        <DateTimePicker
                                            value={fechaNacimiento}
                                            mode="date"
                                            display="default"
                                            onChange={(event, selectedDate) => {
                                                setMostrarFechaNacimiento(false);
                                                if (selectedDate) {
                                                    setFechaNacimiento(selectedDate);
                                                }
                                            }}
                                        />
                                    )}
                                    <Text>Fecha Seleccionada: {fechaNacimiento.toDateString()}</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={String(animal.peso_nacimiento)}
                                        onChangeText={(text) => setAnimal({ ...animal, peso_nacimiento: text })}
                                        placeholder="Peso al Nacer (KG)"
                                        keyboardType="numeric"
                                    />
                                    <TextInput
                                        style={styles.input}
                                        value={String(animal.peso_destete)}
                                        onChangeText={(text) => setAnimal({ ...animal, peso_destete: text })}
                                        placeholder="Peso al Destete (KG)"
                                        keyboardType="numeric"
                                    />
                                    <TextInput
                                        style={styles.input}
                                        value={String(animal.peso_actual)}
                                        onChangeText={(text) => setAnimal({ ...animal, peso_actual: text })}
                                        placeholder="Peso Actual (KG)"
                                        keyboardType="numeric"
                                    />
                                    <TextInput
                                        style={styles.input}
                                        value={animal.observaciones}
                                        onChangeText={(text) => setAnimal({ ...animal, observaciones: text })}
                                        placeholder="Observaciones"
                                    />

                                    <View style={styles.section}>
                                        <Text style={styles.subtitle}>Historial Médico:</Text>
                                        {enfermedades.map((enf, index) => (
                                            <View key={index} style={styles.enfermedadCard}>
                                                <Text style={styles.enfermedadText}>Enfermedad: {enf.nombre}</Text>
                                                <TouchableOpacity
                                                    onPress={() => setMostrarFechaNuevaEnfermedad(index)}
                                                    style={styles.button}
                                                >
                                                    <Text style={styles.buttonText}>Seleccionar Fecha</Text>
                                                </TouchableOpacity>
                                                {mostrarFechaNuevaEnfermedad === index && (
                                                    <DateTimePicker
                                                        value={new Date(enf.fecha)}
                                                        mode="date"
                                                        display="default"
                                                        onChange={(event, selectedDate) => {
                                                            if (selectedDate) {
                                                                const nuevasEnfermedades = [...enfermedades];
                                                                nuevasEnfermedades[index].fecha = selectedDate.toISOString().split('T')[0];
                                                                setEnfermedades(nuevasEnfermedades);
                                                            }
                                                        }}
                                                    />
                                                )}
                                                <Text>Fecha Seleccionada: {enf.fecha}</Text>
                                            </View>
                                        ))}

                                        <Text style={styles.subtitle}>Agregar Nueva Enfermedad:</Text>
                                        <Picker
                                            selectedValue={nuevaEnfermedad}
                                            onValueChange={(value) => setNuevaEnfermedad(value)}
                                            style={styles.input}
                                        >
                                            <Picker.Item label="Seleccione una enfermedad" value="" />
                                            {enfermedadesDisponibles.map((enf) => (
                                                <Picker.Item key={enf.id} label={enf.nombre} value={enf.id} />
                                            ))}
                                        </Picker>
                                        <TouchableOpacity onPress={() => setMostrarFechaNuevaEnfermedad(true)} style={styles.button}>
                                            <Text style={styles.buttonText}>Seleccionar Fecha de Enfermedad</Text>
                                        </TouchableOpacity>
                                        {mostrarFechaNuevaEnfermedad && (
                                            <DateTimePicker
                                                value={fechaNuevaEnfermedad}
                                                mode="date"
                                                display="default"
                                                onChange={(event, selectedDate) => {
                                                    setMostrarFechaNuevaEnfermedad(false);
                                                    if (selectedDate) {
                                                        setFechaNuevaEnfermedad(selectedDate);
                                                    }
                                                }}
                                            />
                                        )}
                                        <Text style={styles.selectedDateText}>
                                            Fecha Seleccionada: {fechaNuevaEnfermedad.toISOString().split('T')[0]}
                                        </Text>

                                    </View>

                                    <Button title="Guardar Cambios" onPress={handleUpdateAnimal} />
                                    <Button title="Cancelar" onPress={() => setIsEditing(false)} />
                                </>
                            )}
                        </View>
                    </>
                ) : (
                    <Text>Cargando datos del animal...</Text>
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    backButton: {
        padding: 10,
    },
    backButtonText: {
        fontSize: 30,
        color: '#007BFF',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        flex: 1,
        textAlign: 'center',
    },
    card: {
        backgroundColor: '#ffffff',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
    },
    cardImage: {
        width: 150,
        height: 150,
        marginBottom: 20,
        borderRadius: 10,
    },
    infoText: {
        fontSize: 18,
        color: '#333',
        marginVertical: 5,
    },
    input: {
        backgroundColor: '#f1f1f1',
        width: '100%',
        padding: 10,
        marginVertical: 5,
        borderRadius: 5,
    },
    button: {
        backgroundColor: '#007BFF',
        padding: 10,
        borderRadius: 5,
        marginVertical: 15,
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
    },
    section: {
        width: '100%',
        marginTop: 20,
        marginBottom: 20,
    },
    subtitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginVertical: 10,
        color: '#007BFF',
        textAlign: 'center',
    },
    enfermedadCard: {
        backgroundColor: '#e3f2fd',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
    },
    enfermedadText: {
        fontSize: 16,
        color: '#007BFF',
    },
});

export default PerfilAnimalScreen;
