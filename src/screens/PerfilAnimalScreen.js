import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Image, ScrollView, Alert, Button, } from 'react-native';
import { db } from '../../src/conection/firebase';
import { doc, getDoc, updateDoc, collection, getDocs, writeBatch, addDoc, deleteDoc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

const PerfilAnimalScreen = ({ route }) => {
    const { animalId } = route.params;
    const [animal, setAnimal] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [codigoIdVaca, setCodigoIdVaca] = useState('');
    const [raza, setRaza] = useState('');
    const [observaciones, setObservaciones] = useState('');
    const [mostrarFechaProducto, setMostrarFechaProducto] = useState(false);
    const [productoEnEdicion, setProductoEnEdicion] = useState(null);

    const [banosRegistrados, setBanosRegistrados] = useState([]);
    const [nuevoBano, setNuevoBano] = useState({
        fecha: new Date(),
        productos: '',
    });
    const [banoEnEdicion, setBanoEnEdicion] = useState(null);
    const [mostrarFechaBano, setMostrarFechaBano] = useState(false);

    // Fecha de nacimiento
    const [fechaNacimiento, setFechaNacimiento] = useState(new Date());
    const [mostrarFechaNacimiento, setMostrarFechaNacimiento] = useState(false);

    // Enfermedades
    const [enfermedadesRegistradas, setEnfermedadesRegistradas] = useState([]);
    const [enfermedadesDisponibles, setEnfermedadesDisponibles] = useState([]);
    const [mostrarFechaEnfermedad, setMostrarFechaEnfermedad] = useState(false);
    const [editingFechaId, setEditingFechaId] = useState(null);
    const [nuevaEnfermedad, setNuevaEnfermedad] = useState({
        enfermedad: '',
        fecha: new Date(),
    });


    const handleAgregarEnfermedad = async () => {
        try {
            await addDoc(collection(db, `animales/${animalId}/enfermedades`), {
                enfermedad: nuevaEnfermedad.enfermedad,
                fecha: nuevaEnfermedad.fecha.toISOString().split('T')[0], // Fecha en formato YYYY-MM-DD
            });
            Alert.alert('Éxito', 'Enfermedad registrada correctamente.');
            setNuevaEnfermedad({ enfermedad: '', fecha: new Date() });
            fetchEnfermedades(); // Recargar las enfermedades registradas
        } catch (error) {
            console.error('Error al registrar la enfermedad:', error);
            Alert.alert('Error', 'No se pudo registrar la enfermedad.');
        }
    };

    // Pesos
    const [pesoNacimiento, setPesoNacimiento] = useState('');
    const [pesoDestete, setPesoDestete] = useState('');
    const [pesoActual, setPesoActual] = useState('');

    const [producciones, setProducciones] = useState([]);
    const [nuevaProduccion, setNuevaProduccion] = useState({
        fecha: new Date(),
        cantidad: '', // Cantidad en litros
        calidad: '', // Calidad puede ser "Buena", "Regular", "Mala"
    });
    const [produccionEnEdicion, setProduccionEnEdicion] = useState(null);
    const [mostrarFechaProduccion, setMostrarFechaProduccion] = useState(false);

    // Estado para las inseminaciones
    const [inseminaciones, setInseminaciones] = useState([]);
    const [nuevaInseminacion, setNuevaInseminacion] = useState({
        fecha_inseminacion: new Date(),
        observaciones: '',
        resultado: '',
        tipo_inseminacion: '',
    });
    const [inseminacionEnEdicion, setInseminacionEnEdicion] = useState(null);
    const [mostrarFechaInseminacion, setMostrarFechaInseminacion] = useState(false);




    const handleEliminarAnimalCompleto = async () => {
        try {
            // Eliminar los subdocumentos relacionados (como inseminaciones, producciones, etc.)
            const subcolecciones = [
                'estado_reproductivo',
                'inseminaciones',
                'produccion_leche',
                'control_banos',
                'enfermedades',
                'productosAplicados',
            ];

            // Eliminar todos los documentos dentro de las subcolecciones
            for (const subcoleccion of subcolecciones) {
                const snapshot = await getDocs(collection(db, `animales/${animalId}/${subcoleccion}`));
                const batch = writeBatch(db); // Corrección aquí
                snapshot.docs.forEach((doc) => {
                    batch.delete(doc.ref);
                });
                await batch.commit(); // Commit del batch
            }

            // Finalmente, elimina el documento principal del animal
            const animalRef = doc(db, 'animales', animalId);
            await deleteDoc(animalRef);

            Alert.alert('Éxito', 'El registro del animal y todos sus datos relacionados han sido eliminados.');
        } catch (error) {
            console.error('Error al eliminar el registro completo del animal:', error);
            Alert.alert('Error', 'No se pudo eliminar el registro completo del animal.');
        }
    };


    // Estado para el manejo de los datos reproductivos
    const [estadoReproductivo, setEstadoReproductivo] = useState([]);
    const [nuevoEstado, setNuevoEstado] = useState({
        ciclo_celo: '',
        servicios_realizados: '',
        numero_gestaciones: '',
        partos_realizados: '',
        resultados_lactancia: '',
        uso_programa_inseminacion: '',
        resultado_prueba_reproductiva: '',
        fecha_ultimo_celo: new Date(),
    });
    const [estadoEnEdicion, setEstadoEnEdicion] = useState(null);
    const [mostrarFechaCelo, setMostrarFechaCelo] = useState(false);


    const fetchEstadoReproductivo = async () => {
        try {
            const snapshot = await getDocs(
                collection(db, `animales/${animalId}/estado_reproductivo`)
            );
            const datos = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
                fecha_ultimo_celo: doc.data().fecha_ultimo_celo
                    ? new Date(doc.data().fecha_ultimo_celo)
                    : null,
            }));
            setEstadoReproductivo(datos);
        } catch (error) {
            console.error('Error al cargar estado reproductivo:', error);
        }
    };



    const handleAgregarEstado = async () => {
        try {
            const data = {
                ciclo_celo: animal.sexo === 'Hembra' ? nuevoEstado.ciclo_celo : null,
                fecha_ultimo_celo:
                    animal.sexo === 'Hembra'
                        ? nuevoEstado.fecha_ultimo_celo.toISOString().split('T')[0]
                        : null,
                servicios_realizados: animal.sexo === 'Hembra' ? nuevoEstado.servicios_realizados : null,
                numero_gestaciones: animal.sexo === 'Hembra' ? nuevoEstado.numero_gestaciones : null,
                partos_realizados: animal.sexo === 'Hembra' ? nuevoEstado.partos_realizados : null,
                resultados_lactancia: animal.sexo === 'Hembra' ? nuevoEstado.resultados_lactancia : null,
                uso_programa_inseminacion:
                    animal.sexo === 'Macho' ? nuevoEstado.uso_programa_inseminacion : null,
                resultado_prueba_reproductiva:
                    animal.sexo === 'Macho' ? nuevoEstado.resultado_prueba_reproductiva : null,
            };

            await addDoc(collection(db, `animales/${animalId}/estado_reproductivo`), data);
            Alert.alert('Éxito', 'Estado reproductivo agregado correctamente.');
            setNuevoEstado({
                ciclo_celo: '',
                servicios_realizados: '',
                numero_gestaciones: '',
                partos_realizados: '',
                resultados_lactancia: '',
                uso_programa_inseminacion: '',
                resultado_prueba_reproductiva: '',
                fecha_ultimo_celo: new Date(),
            });
            fetchEstadoReproductivo(); // Recargar datos
        } catch (error) {
            console.error('Error al agregar estado reproductivo:', error);
            Alert.alert('Error', 'No se pudo agregar el estado reproductivo.');
        }
    };



    const handleGuardarEdicionEstado = async () => {
        if (!estadoEnEdicion) return;

        try {
            const estadoRef = doc(
                db,
                `animales/${animalId}/estado_reproductivo`,
                estadoEnEdicion.id
            );

            await updateDoc(estadoRef, {
                ciclo_celo: animal.sexo === 'Hembra' ? estadoEnEdicion.ciclo_celo : null,
                fecha_ultimo_celo:
                    animal.sexo === 'Hembra'
                        ? estadoEnEdicion.fecha_ultimo_celo.toISOString().split('T')[0]
                        : null,
                servicios_realizados: animal.sexo === 'Hembra' ? estadoEnEdicion.servicios_realizados : null,
                numero_gestaciones: animal.sexo === 'Hembra' ? estadoEnEdicion.numero_gestaciones : null,
                partos_realizados: animal.sexo === 'Hembra' ? estadoEnEdicion.partos_realizados : null,
                resultados_lactancia: animal.sexo === 'Hembra' ? estadoEnEdicion.resultados_lactancia : null,
                uso_programa_inseminacion:
                    animal.sexo === 'Macho' ? estadoEnEdicion.uso_programa_inseminacion : null,
                resultado_prueba_reproductiva:
                    animal.sexo === 'Macho' ? estadoEnEdicion.resultado_prueba_reproductiva : null,
            });

            Alert.alert('Éxito', 'Estado reproductivo actualizado correctamente.');
            setEstadoEnEdicion(null);
            fetchEstadoReproductivo(); // Recargar datos
        } catch (error) {
            console.error('Error al guardar edición de estado reproductivo:', error);
            Alert.alert('Error', 'No se pudo actualizar el estado reproductivo.');
        }
    };



    const handleEliminarEstado = async (estadoId) => {
        try {
            const estadoRef = doc(
                db,
                `animales/${animalId}/estado_reproductivo`,
                estadoId
            );
            await deleteDoc(estadoRef);
            Alert.alert('Éxito', 'Estado reproductivo eliminado correctamente.');
            fetchEstadoReproductivo(); // Recargar datos
        } catch (error) {
            console.error('Error al eliminar estado reproductivo:', error);
            Alert.alert('Error', 'No se pudo eliminar el estado reproductivo.');
        }
    };








    // Función para obtener inseminaciones
    const fetchInseminaciones = async () => {
        try {
            const snapshot = await getDocs(collection(db, `animales/${animalId}/inseminaciones`));
            const datos = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
                fecha_inseminacion: new Date(doc.data().fecha_inseminacion), // Convertimos la fecha al formato Date
            }));
            setInseminaciones(datos);
        } catch (error) {
            console.error('Error al cargar inseminaciones:', error);
        }
    };




    const fetchProducciones = async () => {
        try {
            const snapshot = await getDocs(collection(db, `animales/${animalId}/produccion_leche`));
            const datos = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
                fecha: new Date(doc.data().fecha), // Convertimos la fecha al formato Date
            }));
            setProducciones(datos);
        } catch (error) {
            console.error('Error al cargar producciones:', error);
        }
    };



    const handleAgregarProduccion = async () => {
        try {
            await addDoc(collection(db, `animales/${animalId}/produccion_leche`), {
                cantidad: parseFloat(nuevaProduccion.cantidad), // Convertimos cantidad a número
                calidad: nuevaProduccion.calidad, // Calidad como texto
                fecha: nuevaProduccion.fecha.toISOString().split('T')[0], // Fecha en formato "YYYY-MM-DD"
            });
            Alert.alert('Éxito', 'Producción agregada correctamente.');
            setNuevaProduccion({ fecha: new Date(), cantidad: '', calidad: '' });
            fetchProducciones(); // Recargar producciones
        } catch (error) {
            console.error('Error al agregar producción:', error);
            Alert.alert('Error', 'No se pudo agregar la producción.');
        }
    };



    const handleGuardarEdicionProduccion = async () => {
        if (!produccionEnEdicion) return;

        try {
            const produccionRef = doc(db, `animales/${animalId}/produccion_leche`, produccionEnEdicion.id);
            await updateDoc(produccionRef, {
                cantidad: parseFloat(produccionEnEdicion.cantidad), // Convertimos cantidad a número
                calidad: produccionEnEdicion.calidad, // Calidad como texto
                fecha: produccionEnEdicion.fecha.toISOString().split('T')[0], // Fecha en formato "YYYY-MM-DD"
            });
            Alert.alert('Éxito', 'Producción actualizada correctamente.');
            setProduccionEnEdicion(null);
            fetchProducciones(); // Recargar producciones
        } catch (error) {
            console.error('Error al guardar producción:', error);
            Alert.alert('Error', 'No se pudo actualizar la producción.');
        }
    };



    const handleEliminarProduccion = async (produccionId) => {
        try {
            const produccionRef = doc(db, `animales/${animalId}/produccion_leche`, produccionId);
            await deleteDoc(produccionRef);
            Alert.alert('Éxito', 'Producción eliminada correctamente.');
            fetchProducciones(); // Recargar producciones
        } catch (error) {
            console.error('Error al eliminar producción:', error);
            Alert.alert('Error', 'No se pudo eliminar la producción.');
        }
    };



    const fetchBanosRegistrados = async () => {
        try {
            const snapshot = await getDocs(collection(db, `animales/${animalId}/control_banos`));
            const banos = snapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    fecha: data.fecha ? new Date(`${data.fecha}T00:00:00`) : null, // Convertir cadena a Date
                    productos: data.productos_utilizados || 'Sin productos registrados',
                };
            });
            setBanosRegistrados(banos);
        } catch (error) {
            console.error('Error al cargar los baños registrados:', error);
        }
    };





    const handleAgregarBano = async () => {
        try {
            await addDoc(collection(db, `animales/${animalId}/control_banos`), {
                fecha: nuevoBano.fecha.toISOString().split('T')[0], // Almacenar como cadena "YYYY-MM-DD"
                productos_utilizados: nuevoBano.productos,
            });
            Alert.alert('Éxito', 'Baño agregado correctamente.');
            setNuevoBano({ fecha: new Date(), productos: '' });
            fetchBanosRegistrados(); // Recargar los baños registrados
        } catch (error) {
            console.error('Error al agregar el baño:', error);
            Alert.alert('Error', 'No se pudo agregar el baño.');
        }
    };




    const handleEditarBano = (bano) => {
        setBanoEnEdicion(bano);
    };

    const handleGuardarEdicionBano = async () => {
        if (!banoEnEdicion) return;

        try {
            // Ajustar la fecha compensando la diferencia horaria
            const adjustedDate = new Date(banoEnEdicion.fecha.getTime() - banoEnEdicion.fecha.getTimezoneOffset() * 60000);

            const banoRef = doc(db, `animales/${animalId}/control_banos`, banoEnEdicion.id);
            await updateDoc(banoRef, {
                fecha: adjustedDate.toISOString().split('T')[0], // Almacenar como cadena "YYYY-MM-DD"
                productos_utilizados: banoEnEdicion.productos,
            });
            Alert.alert('Éxito', 'Baño actualizado correctamente.');
            setBanoEnEdicion(null);
            fetchBanosRegistrados(); // Recargar baños registrados
        } catch (error) {
            console.error('Error al guardar los cambios del baño:', error);
            Alert.alert('Error', 'No se pudo actualizar el baño.');
        }
    };




    const handleEliminarBano = async (banoId) => {
        try {
            const banoRef = doc(db, `animales/${animalId}/control_banos`, banoId);
            await deleteDoc(banoRef);
            Alert.alert('Éxito', 'Baño eliminado correctamente.');
            fetchBanosRegistrados(); // Recargar baños registrados
        } catch (error) {
            console.error('Error al eliminar el baño:', error);
            Alert.alert('Error', 'No se pudo eliminar el baño.');
        }
    };





    useEffect(() => {
        fetchAnimalData();
        fetchBanosRegistrados(); // Llamar aquí después de cargar el animalId
        fetchProducciones();
        fetchInseminaciones(); // Llamar aquí para cargar inseminaciones
        fetchEstadoReproductivo()
    }, [animalId]);


    const fetchAnimalData = async () => {
        try {
            const docRef = doc(db, 'animales', animalId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const animalData = docSnap.data();
                setAnimal({ id: animalId, ...animalData });

                setCodigoIdVaca(animalData.codigo_idVaca || '');
                setRaza(animalData.raza || '');
                setObservaciones(animalData.observaciones || '');
                setFechaNacimiento(new Date(animalData.fecha_nacimiento || new Date()));
                setPesoNacimiento(String(animalData.peso_nacimiento || ''));
                setPesoDestete(String(animalData.peso_destete || ''));
                setPesoActual(String(animalData.peso_actual || ''));

                await fetchEnfermedades();
                await fetchEnfermedadesDisponibles();
                await fetchProductosAplicados();

            }
        } catch (error) {
            console.error('Error al obtener los datos del animal:', error);
        }
    };

    const handleAgregarInseminacion = async () => {
        try {

            const fechaConAjuste = new Date(nuevaInseminacion.fecha_inseminacion);
            fechaConAjuste.setDate(fechaConAjuste.getDate() + 1);

            await addDoc(collection(db, `animales/${animalId}/inseminaciones`), {
                ...nuevaInseminacion,
                fecha_inseminacion: fechaConAjuste.toISOString().split('T')[0], // Fecha ajustada en formato "YYYY-MM-DD"
            });

            Alert.alert('Éxito', 'Inseminación agregada correctamente.');
            setNuevaInseminacion({ fecha_inseminacion: new Date(), observaciones: '', resultado: '', tipo_inseminacion: '' });
            fetchInseminaciones(); // Recargar las inseminaciones
        } catch (error) {
            console.error('Error al agregar inseminación:', error);
            Alert.alert('Error', 'No se pudo agregar la inseminación.');
        }
    };



    const handleGuardarEdicionInseminacion = async () => {
        if (!inseminacionEnEdicion) return;

        try {
            const inseminacionRef = doc(db, `animales/${animalId}/inseminaciones`, inseminacionEnEdicion.id);
            await updateDoc(inseminacionRef, {
                fecha_inseminacion: inseminacionEnEdicion.fecha_inseminacion.toISOString().split('T')[0],
                observaciones: inseminacionEnEdicion.observaciones,
                resultado: inseminacionEnEdicion.resultado,
                tipo_inseminacion: inseminacionEnEdicion.tipo_inseminacion,
            });
            Alert.alert('Éxito', 'Inseminación actualizada correctamente.');
            setInseminacionEnEdicion(null);
            fetchInseminaciones(); // Recargar inseminaciones
        } catch (error) {
            console.error('Error al actualizar inseminación:', error);
            Alert.alert('Error', 'No se pudo actualizar la inseminación.');
        }
    };


    const handleEliminarInseminacion = async (inseminacionId) => {
        try {
            const inseminacionRef = doc(db, `animales/${animalId}/inseminaciones`, inseminacionId);
            await deleteDoc(inseminacionRef);
            Alert.alert('Éxito', 'Inseminación eliminada correctamente.');
            fetchInseminaciones(); // Recargar inseminaciones
        } catch (error) {
            console.error('Error al eliminar inseminación:', error);
            Alert.alert('Error', 'No se pudo eliminar la inseminación.');
        }
    };




    const fetchEnfermedades = async () => {
        try {
            const enfermedadesSnapshot = await getDocs(collection(db, `animales/${animalId}/enfermedades`));
            const enfermedadesData = enfermedadesSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setEnfermedadesRegistradas(enfermedadesData);
        } catch (error) {
            console.error('Error al cargar las enfermedades registradas:', error);
        }
    };

    const fetchEnfermedadesDisponibles = async () => {
        try {
            const enfermedadesSnapshot = await getDocs(collection(db, 'enfermedades'));
            const enfermedadesData = enfermedadesSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setEnfermedadesDisponibles(enfermedadesData);
        } catch (error) {
            console.error('Error al cargar las enfermedades disponibles:', error);
        }
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
        if (!date || !(date instanceof Date)) return 'Fecha no disponible';
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
                    codigo_idVaca: codigoIdVaca,
                    raza,
                    observaciones, // Agrega las observaciones al objeto que se guarda
                    fecha_nacimiento: formatDateForFirestore(fechaNacimiento),
                    peso_nacimiento: parseFloat(pesoNacimiento) || 0,
                    peso_destete: parseFloat(pesoDestete) || 0,
                    peso_actual: parseFloat(pesoActual) || 0,
                    nombre: animal.nombre,
                    sexo: animal.sexo,
                    estado: animal.estado,
                    imagen: animal.imagen || '',
                });


                Alert.alert('Éxito', 'Datos del animal actualizados.');
                setIsEditing(false);
                fetchAnimalData(); // Vuelve a cargar los datos actualizados
            }
        } catch (error) {
            console.error('Error al actualizar el animal:', error);
            Alert.alert('Error', 'No se pudo actualizar el animal.');
        }
    };


    const formatDateForFirestore = (date) => {
        const offset = date.getTimezoneOffset() * 60000; // Compensa la diferencia de zona horaria
        const localDate = new Date(date.getTime() - offset);
        return localDate.toISOString().split('T')[0]; // Devuelve solo la parte de la fecha (YYYY-MM-DD)
    };



    const handleUpdateEnfermedades = async () => {
        try {
            const batch = writeBatch(db);
            enfermedadesRegistradas.forEach((enfermedad) => {
                const enfermedadRef = doc(db, `animales/${animalId}/enfermedades`, enfermedad.id);
                batch.update(enfermedadRef, {
                    enfermedad: enfermedad.enfermedad,
                    fecha: enfermedad.fecha instanceof Date
                        ? enfermedad.fecha.toISOString()
                        : enfermedad.fecha,
                });
            });
            await batch.commit();
            Alert.alert('Éxito', 'Enfermedades actualizadas.');
            fetchEnfermedades();
        } catch (error) {
            console.error('Error al actualizar enfermedades:', error);
            Alert.alert('Error', 'No se pudieron actualizar las enfermedades.');
        }
    };


    const handleSaveChanges = async () => {
        try {
            await handleUpdateAnimal(); // Actualizar datos del animal
            await handleUpdateEnfermedades(); // Actualizar enfermedades
            Alert.alert('Éxito', 'Cambios guardados correctamente.');
            setIsEditing(false);
        } catch (error) {
            console.error('Error al guardar los cambios:', error);
            Alert.alert('Error', 'No se pudieron guardar los cambios.');
        }
    };


    const [productosAplicados, setProductosAplicados] = useState([]);
    const [nuevoProducto, setNuevoProducto] = useState({
        nombre: '',
        dosis: '',
        fecha: new Date(),
        esTratamiento: false,
    });


    const fetchProductosAplicados = async () => {
        try {
            const snapshot = await getDocs(collection(db, `animales/${animalId}/productosAplicados`));
            const productos = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
                fecha: doc.data().fecha.toDate(), // Convertir Timestamp a Date
            }));
            setProductosAplicados(productos);
        } catch (error) {
            console.error('Error al cargar los productos aplicados:', error);
        }
    };


    const handleAgregarProducto = async () => {
        try {
            await addDoc(collection(db, `animales/${animalId}/productosAplicados`), {
                ...nuevoProducto,
                fecha: nuevoProducto.fecha,
            });
            Alert.alert('Éxito', 'Producto agregado.');
            setNuevoProducto({ nombre: '', dosis: '', fecha: new Date(), esTratamiento: false });
            fetchProductosAplicados(); // Recargar productos aplicados
        } catch (error) {
            console.error('Error al agregar el producto:', error);
            Alert.alert('Error', 'No se pudo agregar el producto.');
        }
    };



    const handleActualizarProducto = async (productoId, camposActualizados) => {
        try {
            const productoRef = doc(db, `animales/${animalId}/productosAplicados`, productoId);
            await updateDoc(productoRef, camposActualizados);
            Alert.alert('Éxito', 'Producto actualizado.');
            fetchProductosAplicados();
        } catch (error) {
            console.error('Error al actualizar el producto:', error);
            Alert.alert('Error', 'No se pudo actualizar el producto.');
        }
    };


    const handleEliminarProducto = async (productoId) => {
        try {
            const productoRef = doc(db, `animales/${animalId}/productosAplicados`, productoId); // Cambiar "productos" por "productosAplicados"
            await deleteDoc(productoRef);
            Alert.alert('Éxito', 'Producto eliminado correctamente.');
            fetchProductosAplicados(); // Recarga la lista de productos después de eliminar
        } catch (error) {
            console.error('Error al eliminar el producto:', error);
            Alert.alert('Error', 'No se pudo eliminar el producto.');
        }
    };

    const handleEditarProducto = (producto) => {
        setProductoEnEdicion(producto);
    };


    const handleGuardarEdicionProducto = async () => {
        if (!productoEnEdicion) return;

        try {
            const productoRef = doc(db, `animales/${animalId}/productosAplicados`, productoEnEdicion.id);
            await updateDoc(productoRef, {
                nombre: productoEnEdicion.nombre,
                dosis: productoEnEdicion.dosis,
                fecha: productoEnEdicion.fecha,
                esTratamiento: productoEnEdicion.esTratamiento,
            });
            Alert.alert('Éxito', 'Producto actualizado.');
            setProductoEnEdicion(null); // Salir del modo edición
            fetchProductosAplicados(); // Recargar productos
        } catch (error) {
            console.error('Error al guardar los cambios del producto:', error);
            Alert.alert('Error', 'No se pudo actualizar el producto.');
        }
    };




    const adjustDateToLocal = (date) => {
        return new Date(date.getTime() + date.getTimezoneOffset() * 60000);
    };


    return (
        <ScrollView contentContainerStyle={styles.container}>
            {animal ? (
                <>
                    <View style={styles.card}>
                        {/* Imagen */}
                        <TouchableOpacity onPress={isEditing ? seleccionarImagen : null}>
                            <Image
                                source={{ uri: animal.imagen || 'https://via.placeholder.com/150' }}
                                style={styles.image}
                            />
                        </TouchableOpacity>

                        {/* Nombre */}
                        <TextInput
                            value={animal.nombre}
                            onChangeText={(text) => setAnimal({ ...animal, nombre: text })}
                            style={styles.input}
                            editable={isEditing}
                            placeholder="Nombre del Animal"
                        />

                        {/* Género */}
                        <Picker
                            selectedValue={animal.sexo}
                            enabled={isEditing}
                            style={styles.input}
                            onValueChange={(itemValue) => setAnimal({ ...animal, sexo: itemValue })}
                        >
                            <Picker.Item label="Seleccionar Género" value="" />
                            <Picker.Item label="Macho" value="Macho" />
                            <Picker.Item label="Hembra" value="Hembra" />
                        </Picker>

                        {/* Fecha de Nacimiento */}
                        <TouchableOpacity onPress={() => isEditing && setMostrarFechaNacimiento(true)}>
                            <TextInput
                                value={formatDate(fechaNacimiento)}
                                style={styles.input}
                                editable={false}
                                pointerEvents="none"
                            />
                        </TouchableOpacity>
                        {mostrarFechaNacimiento && (
                            <DateTimePicker
                                value={fechaNacimiento}
                                mode="date"
                                display="default"
                                onChange={(event, selectedDate) => {
                                    setMostrarFechaNacimiento(false);
                                    if (selectedDate) setFechaNacimiento(selectedDate);
                                }}
                            />
                        )}

                        <Text style={styles.label}>Código Único:</Text>
                        <TextInput
                            value={codigoIdVaca}
                            onChangeText={(text) => {
                                setCodigoIdVaca(text);
                                setAnimal((prev) => ({ ...prev, codigo_idVaca: text })); // Sincroniza con `animal`
                            }}
                            style={styles.input}
                            editable={isEditing}
                            placeholder="Código Único del Animal"
                        />


                        <Text style={styles.label}>Raza del Animal:</Text>
                        <TextInput
                            value={raza}
                            onChangeText={(text) => setRaza(text)}
                            style={styles.input}
                            editable={isEditing}
                            placeholder="Escribe la raza del animal"
                        />


                        <Text style={styles.label}>Observaciones Generales:</Text>
                        <TextInput
                            value={observaciones}
                            onChangeText={(text) => setObservaciones(text)}
                            style={styles.input}
                            editable={isEditing}
                            multiline
                            placeholder="Escribe observaciones generales del animal"
                        />



                        {/* Pesos */}
                        <Text style={styles.label}>Peso al Nacimiento (kg):</Text>
                        <TextInput
                            value={pesoNacimiento}
                            onChangeText={(text) => setPesoNacimiento(text)}
                            style={styles.input}
                            editable={isEditing}
                            keyboardType="numeric"
                        />
                        <Text style={styles.label}>Peso al Destete (kg):</Text>
                        <TextInput
                            value={pesoDestete}
                            onChangeText={(text) => setPesoDestete(text)}
                            style={styles.input}
                            editable={isEditing}
                            keyboardType="numeric"
                        />
                        <Text style={styles.label}>Peso Actual (kg):</Text>
                        <TextInput
                            value={pesoActual}
                            onChangeText={(text) => setPesoActual(text)}
                            style={styles.input}
                            editable={isEditing}
                            keyboardType="numeric"
                        />

                        {/* Estado */}
                        <Picker
                            selectedValue={animal.estado}
                            enabled={isEditing}
                            style={styles.input}
                            onValueChange={(itemValue) => setAnimal({ ...animal, estado: itemValue })}
                        >
                            <Picker.Item label="Seleccionar Estado" value="" />
                            <Picker.Item label="Activo" value="Activo" />
                            <Picker.Item label="Enfermo" value="Enfermo" />
                            <Picker.Item label="Muerto" value="Muerto" />
                            <Picker.Item label="Vendido" value="Vendido" />
                        </Picker>
                    </View>


                    <View style={styles.card}>
                        <Text style={styles.subtitle}>Agregar Enfermedad</Text>
                        <Picker
                            selectedValue={nuevoProducto.nombre}
                            onValueChange={(itemValue) => setNuevaEnfermedad({ ...nuevaEnfermedad, enfermedad: itemValue })}
                            style={styles.input}
                        >
                            <Picker.Item label="Seleccionar Enfermedad" value="" />
                            {enfermedadesDisponibles.map((enfermedad) => (
                                <Picker.Item key={enfermedad.id} label={enfermedad.nombre} value={enfermedad.id} />
                            ))}
                        </Picker>
                        <TouchableOpacity onPress={() => setMostrarFechaEnfermedad(true)}>
                            <TextInput
                                value={formatDate(nuevaEnfermedad.fecha)}
                                style={styles.input}
                                editable={false}
                                placeholder="Fecha de detección"
                            />
                        </TouchableOpacity>
                        {mostrarFechaEnfermedad && (
                            <DateTimePicker
                                value={nuevaEnfermedad.fecha}
                                mode="date"
                                display="default"
                                onChange={(event, selectedDate) => {
                                    setMostrarFechaEnfermedad(false);
                                    if (selectedDate) setNuevaEnfermedad({ ...nuevaEnfermedad, fecha: selectedDate });
                                }}
                            />
                        )}
                        <Button title="Agregar Enfermedad" onPress={handleAgregarEnfermedad} />
                    </View>



                    {/* Enfermedades */}
                    <View style={styles.card}>
                        <Text style={styles.subtitle}>Historial de Enfermedades</Text>
                        {enfermedadesRegistradas.map((enf) => (
                            <View key={enf.id} style={styles.enfermedadContainer}>
                                {/* Mostrar enfermedad registrada */}
                                <Text style={styles.enfermedadLabel}>Enfermedad Registrada:</Text>
                                <Text style={styles.enfermedadText}>
                                    {enfermedadesDisponibles.find((e) => e.id === enf.enfermedad)?.nombre || "No registrada"}
                                </Text>

                                {/* Picker */}
                                <Picker
                                    selectedValue={enf.enfermedad}
                                    enabled={isEditing}
                                    onValueChange={(value) => {
                                        setEnfermedadesRegistradas((prev) =>
                                            prev.map((registro) =>
                                                registro.id === enf.id ? { ...registro, enfermedad: value } : registro
                                            )
                                        );
                                    }}
                                    style={styles.input}
                                >
                                    <Picker.Item label="Seleccionar Enfermedad" value="" />
                                    {enfermedadesDisponibles.map((enfDisp) => (
                                        <Picker.Item key={enfDisp.id} label={enfDisp.nombre} value={enfDisp.id} />
                                    ))}
                                </Picker>

                                {/* Fecha */}
                                <TouchableOpacity
                                    onPress={() => {
                                        if (isEditing) {
                                            setEditingFechaId(enf.id);
                                            setMostrarFechaEnfermedad(true);
                                        }
                                    }}
                                >
                                    <TextInput
                                        value={formatDate(new Date(enf.fecha))}
                                        style={styles.input}
                                        editable={false}
                                        pointerEvents="none"
                                    />
                                </TouchableOpacity>
                                {mostrarFechaEnfermedad && editingFechaId === enf.id && (
                                    <DateTimePicker
                                        value={
                                            enf.fecha instanceof Date
                                                ? enf.fecha
                                                : new Date(new Date(enf.fecha).getTime() - new Date().getTimezoneOffset() * 60000)
                                        }
                                        mode="date"
                                        display="default"
                                        onChange={(event, selectedDate) => {
                                            setMostrarFechaEnfermedad(false);
                                            if (selectedDate) {
                                                setEnfermedadesRegistradas((prev) =>
                                                    prev.map((registro) =>
                                                        registro.id === enf.id
                                                            ? { ...registro, fecha: selectedDate.toISOString() }
                                                            : registro
                                                    )
                                                );
                                            }
                                        }}
                                    />
                                )}

                            </View>
                        ))}


                        <View style={styles.card}>
                            <Text style={styles.subtitle}>Agregar Producto Aplicado</Text>
                            <TextInput
                                value={nuevoProducto.nombre}
                                onChangeText={(text) => setNuevoProducto({ ...nuevoProducto, nombre: text })}
                                style={styles.input}
                                placeholder="Nombre del Producto"
                            />
                            <TextInput
                                value={nuevoProducto.dosis}
                                onChangeText={(text) => setNuevoProducto({ ...nuevoProducto, dosis: text })}
                                style={styles.input}
                                placeholder="Dosis (ml, g, etc.)"
                                keyboardType="numeric"
                            />
                            <TouchableOpacity onPress={() => setMostrarFechaProducto(true)}>
                                <TextInput
                                    value={formatDate(nuevoProducto.fecha)}
                                    style={styles.input}
                                    editable={false}
                                    placeholder="Fecha de Aplicación"
                                />
                            </TouchableOpacity>
                            {mostrarFechaProducto && (
                                <DateTimePicker
                                    value={nuevoProducto.fecha}
                                    mode="date"
                                    display="default"
                                    onChange={(event, selectedDate) => {
                                        setMostrarFechaProducto(false);
                                        if (selectedDate) setNuevoProducto({ ...nuevoProducto, fecha: selectedDate });
                                    }}
                                />
                            )}
                            <Picker
                                selectedValue={nuevoProducto.esTratamiento}
                                onValueChange={(value) => setNuevoProducto({ ...nuevoProducto, esTratamiento: value })}
                                style={styles.input}
                            >
                                <Picker.Item label="¿Es tratamiento?" value={false} />
                                <Picker.Item label="Sí" value={true} />
                            </Picker>
                            <Button title="Agregar Producto" onPress={handleAgregarProducto} />
                        </View>

                        <View style={styles.card}>
                            <Text style={styles.subtitle}>Historial de Productos Aplicados</Text>
                            {productosAplicados.map((producto) => (
                                <View key={producto.id} style={styles.productoContainer}>
                                    {productoEnEdicion && productoEnEdicion.id === producto.id ? (
                                        // Formulario de edición
                                        <>
                                            <TextInput
                                                value={productoEnEdicion.nombre}
                                                onChangeText={(text) =>
                                                    setProductoEnEdicion({ ...productoEnEdicion, nombre: text })
                                                }
                                                style={styles.input}
                                                placeholder="Nombre del Producto"
                                            />
                                            <TextInput
                                                value={productoEnEdicion.dosis}
                                                onChangeText={(text) =>
                                                    setProductoEnEdicion({ ...productoEnEdicion, dosis: text })
                                                }
                                                style={styles.input}
                                                placeholder="Dosis"
                                                keyboardType="numeric"
                                            />
                                            <TouchableOpacity onPress={() => setMostrarFechaProducto(true)}>
                                                <TextInput
                                                    value={formatDate(productoEnEdicion.fecha)}
                                                    style={styles.input}
                                                    editable={false}
                                                    placeholder="Fecha de Aplicación"
                                                />
                                            </TouchableOpacity>
                                            {mostrarFechaProducto && (
                                                <DateTimePicker
                                                    value={productoEnEdicion.fecha}
                                                    mode="date"
                                                    display="default"
                                                    onChange={(event, selectedDate) => {
                                                        setMostrarFechaProducto(false);
                                                        if (selectedDate) {
                                                            setProductoEnEdicion({
                                                                ...productoEnEdicion,
                                                                fecha: selectedDate,
                                                            });
                                                        }
                                                    }}
                                                />
                                            )}
                                            <Picker
                                                selectedValue={productoEnEdicion.esTratamiento}
                                                onValueChange={(value) =>
                                                    setProductoEnEdicion({ ...productoEnEdicion, esTratamiento: value })
                                                }
                                                style={styles.input}
                                            >
                                                <Picker.Item label="¿Es tratamiento?" value={false} />
                                                <Picker.Item label="Sí" value={true} />
                                            </Picker>
                                            <Button title="Guardar" onPress={handleGuardarEdicionProducto} />
                                            <Button title="Cancelar" onPress={() => setProductoEnEdicion(null)} />
                                        </>
                                    ) : (
                                        // Vista de producto normal
                                        <>
                                            <Text>Nombre: {producto.nombre}</Text>
                                            <Text>Dosis: {producto.dosis}</Text>
                                            <Text>Fecha: {formatDate(producto.fecha)}</Text>
                                            <Text>¿Es tratamiento?: {producto.esTratamiento ? 'Sí' : 'No'}</Text>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                                <Button
                                                    title="Editar"
                                                    onPress={() => handleEditarProducto(producto)}
                                                />
                                                <Button
                                                    title="Eliminar"
                                                    onPress={() => handleEliminarProducto(producto.id)}
                                                />
                                            </View>
                                        </>
                                    )}
                                </View>
                            ))}
                        </View>



                        <View style={styles.card}>
                            <Text style={styles.subtitle}>Agregar Baño</Text>
                            <TextInput
                                value={nuevoBano.productos}
                                onChangeText={(text) => setNuevoBano({ ...nuevoBano, productos: text })}
                                style={styles.input}
                                placeholder="Productos utilizados"
                            />
                            <TouchableOpacity onPress={() => setMostrarFechaBano(true)}>
                                <TextInput
                                    value={formatDate(nuevoBano.fecha)}
                                    style={styles.input}
                                    editable={false}
                                    placeholder="Fecha del baño"
                                />
                            </TouchableOpacity>
                            {mostrarFechaBano && (
                                <DateTimePicker
                                    value={nuevoBano.fecha}
                                    mode="date"
                                    display="default"
                                    onChange={(event, selectedDate) => {
                                        setMostrarFechaBano(false);
                                        if (selectedDate) {
                                            const localDate = adjustDateToLocal(selectedDate);
                                            setNuevoBano({ ...nuevoBano, fecha: localDate });
                                        }
                                    }}
                                />



                            )}
                            <Button title="Agregar Baño" onPress={handleAgregarBano} />

                            <Text style={styles.subtitle}>Historial de Baños Registrados</Text>
                            {banosRegistrados.map((bano) => (
                                <View key={bano.id} style={styles.productoContainer}>
                                    {banoEnEdicion && banoEnEdicion.id === bano.id ? (
                                        <>
                                            <TextInput
                                                value={banoEnEdicion.productos}
                                                onChangeText={(text) => setBanoEnEdicion({ ...banoEnEdicion, productos: text })}
                                                style={styles.input}
                                                placeholder="Productos utilizados"
                                            />
                                            <TouchableOpacity onPress={() => setMostrarFechaBano(true)}>
                                                <TextInput
                                                    value={formatDate(banoEnEdicion.fecha)}
                                                    style={styles.input}
                                                    editable={false}
                                                    placeholder="Fecha del baño"
                                                />
                                            </TouchableOpacity>
                                            {mostrarFechaBano && (
                                                <DateTimePicker
                                                    value={banoEnEdicion.fecha}
                                                    mode="date"
                                                    display="default"
                                                    onChange={(event, selectedDate) => {
                                                        setMostrarFechaBano(false);
                                                        if (selectedDate) {
                                                            setBanoEnEdicion({ ...banoEnEdicion, fecha: selectedDate });
                                                        }
                                                    }}
                                                />
                                            )}
                                            <Button title="Guardar" onPress={handleGuardarEdicionBano} />
                                            <Button title="Cancelar" onPress={() => setBanoEnEdicion(null)} />
                                        </>
                                    ) : (
                                        <>
                                            <Text>Productos: {bano.productos}</Text>
                                            <Text>Fecha: {formatDate(bano.fecha)}</Text>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                                <Button title="Editar" onPress={() => handleEditarBano(bano)} />
                                                <Button title="Eliminar" onPress={() => handleEliminarBano(bano.id)} />
                                            </View>
                                        </>
                                    )}
                                </View>
                            ))}
                        </View>



                        <View style={styles.card}>
                            <Text style={styles.subtitle}>Producción de Leche</Text>

                            {/* Formulario para agregar nueva producción */}
                            <Text style={styles.label}>Agregar Producción</Text>
                            <TextInput
                                value={nuevaProduccion.cantidad}
                                onChangeText={(text) => setNuevaProduccion({ ...nuevaProduccion, cantidad: text })}
                                style={styles.input}
                                placeholder="Cantidad (litros)"
                                keyboardType="numeric"
                            />
                            <TextInput
                                value={nuevaProduccion.calidad}
                                onChangeText={(text) => setNuevaProduccion({ ...nuevaProduccion, calidad: text })}
                                style={styles.input}
                                placeholder="Calidad (Buena, Regular, Mala)"
                            />
                            <TouchableOpacity onPress={() => setMostrarFechaProduccion(true)}>
                                <TextInput
                                    value={formatDate(nuevaProduccion.fecha)}
                                    style={styles.input}
                                    editable={false}
                                    placeholder="Fecha de Producción"
                                />
                            </TouchableOpacity>
                            {mostrarFechaProduccion && (
                                <DateTimePicker
                                    value={nuevaProduccion.fecha}
                                    mode="date"
                                    display="default"
                                    onChange={(event, selectedDate) => {
                                        setMostrarFechaProduccion(false);
                                        if (selectedDate) setNuevaProduccion({ ...nuevaProduccion, fecha: selectedDate });
                                    }}
                                />
                            )}
                            <Button title="Agregar Producción" onPress={handleAgregarProduccion} />

                            {/* Historial de Producción */}
                            <Text style={[styles.subtitle, { marginTop: 20 }]}>Historial de Producción</Text>
                            {producciones.length > 0 ? (
                                producciones.map((produccion) => (
                                    <View key={produccion.id} style={styles.productoContainer}>
                                        {produccionEnEdicion && produccionEnEdicion.id === produccion.id ? (
                                            <>
                                                <TextInput
                                                    value={produccionEnEdicion.cantidad}
                                                    onChangeText={(text) =>
                                                        setProduccionEnEdicion({ ...produccionEnEdicion, cantidad: text })
                                                    }
                                                    style={styles.input}
                                                    placeholder="Cantidad"
                                                    keyboardType="numeric"
                                                />
                                                <TextInput
                                                    value={produccionEnEdicion.calidad}
                                                    onChangeText={(text) =>
                                                        setProduccionEnEdicion({ ...produccionEnEdicion, calidad: text })
                                                    }
                                                    style={styles.input}
                                                    placeholder="Calidad"
                                                />
                                                <TouchableOpacity onPress={() => setMostrarFechaProduccion(true)}>
                                                    <TextInput
                                                        value={formatDate(produccionEnEdicion.fecha)}
                                                        style={styles.input}
                                                        editable={false}
                                                        placeholder="Fecha de Producción"
                                                    />
                                                </TouchableOpacity>
                                                {mostrarFechaProduccion && (
                                                    <DateTimePicker
                                                        value={produccionEnEdicion.fecha}
                                                        mode="date"
                                                        display="default"
                                                        onChange={(event, selectedDate) => {
                                                            setMostrarFechaProduccion(false);
                                                            if (selectedDate) {
                                                                setProduccionEnEdicion({
                                                                    ...produccionEnEdicion,
                                                                    fecha: selectedDate,
                                                                });
                                                            }
                                                        }}
                                                    />
                                                )}
                                                <Button title="Guardar" onPress={handleGuardarEdicionProduccion} />
                                                <Button title="Cancelar" onPress={() => setProduccionEnEdicion(null)} />
                                            </>
                                        ) : (
                                            <>
                                                <Text>Cantidad: {produccion.cantidad} litros</Text>
                                                <Text>Calidad: {produccion.calidad}</Text>
                                                <Text>Fecha: {formatDate(produccion.fecha)}</Text>
                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                                    <Button title="Editar" onPress={() => setProduccionEnEdicion(produccion)} />
                                                    <Button
                                                        title="Eliminar"
                                                        onPress={() => handleEliminarProduccion(produccion.id)}
                                                    />
                                                </View>
                                            </>
                                        )}
                                    </View>
                                ))
                            ) : (
                                <Text>No hay registros de producción.</Text>
                            )}
                        </View>


                        <View style={styles.card}>
                            <Text style={styles.subtitle}>Historial de Inseminaciones</Text>

                            {/* Formulario para agregar nueva inseminación */}
                            <TextInput
                                value={nuevaInseminacion.tipo_inseminacion}
                                onChangeText={(text) => setNuevaInseminacion({ ...nuevaInseminacion, tipo_inseminacion: text })}
                                style={styles.input}
                                placeholder="Tipo de Inseminación (Ejemplo: Artificial)"
                            />
                            <TextInput
                                value={nuevaInseminacion.resultado}
                                onChangeText={(text) => setNuevaInseminacion({ ...nuevaInseminacion, resultado: text })}
                                style={styles.input}
                                placeholder="Resultado (Ejemplo: Exitosa)"
                            />
                            <TextInput
                                value={nuevaInseminacion.observaciones}
                                onChangeText={(text) => setNuevaInseminacion({ ...nuevaInseminacion, observaciones: text })}
                                style={styles.input}
                                placeholder="Observaciones"
                            />
                            <TouchableOpacity onPress={() => setMostrarFechaInseminacion(true)}>
                                <TextInput
                                    value={formatDate(nuevaInseminacion.fecha_inseminacion)}
                                    style={styles.input}
                                    editable={false}
                                    placeholder="Fecha de Inseminación"
                                />
                            </TouchableOpacity>
                            {mostrarFechaInseminacion && (
                                <DateTimePicker
                                    value={nuevaInseminacion.fecha_inseminacion}
                                    mode="date"
                                    display="default"
                                    onChange={(event, selectedDate) => {
                                        setMostrarFechaInseminacion(false);
                                        if (selectedDate) setNuevaInseminacion({ ...nuevaInseminacion, fecha_inseminacion: selectedDate });
                                    }}
                                />
                            )}
                            <Button title="Agregar Inseminación" onPress={handleAgregarInseminacion} />

                            {/* Mostrar historial de inseminaciones */}
                            {inseminaciones.map((inseminacion) => (
                                <View key={inseminacion.id} style={styles.productoContainer}>
                                    {inseminacionEnEdicion && inseminacionEnEdicion.id === inseminacion.id ? (
                                        <>
                                            <TextInput
                                                value={inseminacionEnEdicion.tipo_inseminacion}
                                                onChangeText={(text) => setInseminacionEnEdicion({ ...inseminacionEnEdicion, tipo_inseminacion: text })}
                                                style={styles.input}
                                                placeholder="Tipo de Inseminación"
                                            />
                                            <TextInput
                                                value={inseminacionEnEdicion.resultado}
                                                onChangeText={(text) => setInseminacionEnEdicion({ ...inseminacionEnEdicion, resultado: text })}
                                                style={styles.input}
                                                placeholder="Resultado"
                                            />
                                            <TextInput
                                                value={inseminacionEnEdicion.observaciones}
                                                onChangeText={(text) => setInseminacionEnEdicion({ ...inseminacionEnEdicion, observaciones: text })}
                                                style={styles.input}
                                                placeholder="Observaciones"
                                            />
                                            <TouchableOpacity onPress={() => setMostrarFechaInseminacion(true)}>
                                                <TextInput
                                                    value={formatDate(inseminacionEnEdicion.fecha_inseminacion)}
                                                    style={styles.input}
                                                    editable={false}
                                                    placeholder="Fecha"
                                                />
                                            </TouchableOpacity>
                                            {mostrarFechaInseminacion && (
                                                <DateTimePicker
                                                    value={inseminacionEnEdicion.fecha_inseminacion}
                                                    mode="date"
                                                    display="default"
                                                    onChange={(event, selectedDate) => {
                                                        setMostrarFechaInseminacion(false);
                                                        if (selectedDate)
                                                            setInseminacionEnEdicion({
                                                                ...inseminacionEnEdicion,
                                                                fecha_inseminacion: selectedDate,
                                                            });
                                                    }}
                                                />
                                            )}
                                            <Button title="Guardar" onPress={handleGuardarEdicionInseminacion} />
                                            <Button title="Cancelar" onPress={() => setInseminacionEnEdicion(null)} />
                                        </>
                                    ) : (
                                        <>
                                            <Text>Tipo: {inseminacion.tipo_inseminacion}</Text>
                                            <Text>Resultado: {inseminacion.resultado}</Text>
                                            <Text>Observaciones: {inseminacion.observaciones}</Text>
                                            <Text>Fecha: {formatDate(inseminacion.fecha_inseminacion)}</Text>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                                <Button title="Editar" onPress={() => setInseminacionEnEdicion(inseminacion)} />
                                                <Button title="Eliminar" onPress={() => handleEliminarInseminacion(inseminacion.id)} />
                                            </View>
                                        </>
                                    )}
                                </View>
                            ))}
                        </View>

                        <View style={styles.card}>
                            <Text style={styles.subtitle}>Agregar Estado Reproductivo</Text>
                            {animal.sexo === 'Hembra' && (
                                <>
                                    <TextInput
                                        value={nuevoEstado.ciclo_celo}
                                        onChangeText={(text) => setNuevoEstado({ ...nuevoEstado, ciclo_celo: text })}
                                        style={styles.input}
                                        placeholder="Ciclo de Celo"
                                    />
                                    <TextInput
                                        value={nuevoEstado.servicios_realizados}
                                        onChangeText={(text) =>
                                            setNuevoEstado({ ...nuevoEstado, servicios_realizados: text })
                                        }
                                        style={styles.input}
                                        placeholder="Servicios Realizados"
                                        keyboardType="numeric"
                                    />
                                    <TextInput
                                        value={nuevoEstado.numero_gestaciones}
                                        onChangeText={(text) =>
                                            setNuevoEstado({ ...nuevoEstado, numero_gestaciones: text })
                                        }
                                        style={styles.input}
                                        placeholder="Número de Gestaciones"
                                        keyboardType="numeric"
                                    />
                                    <TextInput
                                        value={nuevoEstado.partos_realizados}
                                        onChangeText={(text) =>
                                            setNuevoEstado({ ...nuevoEstado, partos_realizados: text })
                                        }
                                        style={styles.input}
                                        placeholder="Partos Realizados"
                                        keyboardType="numeric"
                                    />
                                    <TextInput
                                        value={nuevoEstado.resultados_lactancia}
                                        onChangeText={(text) =>
                                            setNuevoEstado({ ...nuevoEstado, resultados_lactancia: text })
                                        }
                                        style={styles.input}
                                        placeholder="Resultados de Lactancia"
                                    />
                                    <TouchableOpacity onPress={() => setMostrarFechaCelo(true)}>
                                        <TextInput
                                            value={formatDate(nuevoEstado.fecha_ultimo_celo)}
                                            style={styles.input}
                                            editable={false}
                                            placeholder="Fecha Último Celo"
                                        />
                                    </TouchableOpacity>
                                    {mostrarFechaCelo && (
                                        <DateTimePicker
                                            value={nuevoEstado.fecha_ultimo_celo}
                                            mode="date"
                                            display="default"
                                            onChange={(event, selectedDate) => {
                                                setMostrarFechaCelo(false);
                                                if (selectedDate) setNuevoEstado({ ...nuevoEstado, fecha_ultimo_celo: selectedDate });
                                            }}
                                        />
                                    )}
                                </>
                            )}
                            {animal.sexo === 'Macho' && (
                                <>
                                    <TextInput
                                        value={nuevoEstado.uso_programa_inseminacion}
                                        onChangeText={(text) =>
                                            setNuevoEstado({ ...nuevoEstado, uso_programa_inseminacion: text })
                                        }
                                        style={styles.input}
                                        placeholder="Uso en Programa de Inseminación"
                                    />
                                    <TextInput
                                        value={nuevoEstado.resultado_prueba_reproductiva}
                                        onChangeText={(text) =>
                                            setNuevoEstado({ ...nuevoEstado, resultado_prueba_reproductiva: text })
                                        }
                                        style={styles.input}
                                        placeholder="Resultado de Prueba Reproductiva"
                                    />
                                </>
                            )}
                            <Button title="Agregar Estado" onPress={handleAgregarEstado} />
                        </View>


                        <View style={styles.card}>
                            <Text style={styles.subtitle}>Historial de Estado Reproductivo</Text>
                            {estadoReproductivo.length > 0 ? (
                                estadoReproductivo.map((estado) => (
                                    <View key={estado.id} style={styles.productoContainer}>
                                        {estadoEnEdicion && estadoEnEdicion.id === estado.id ? (
                                            // Formulario de edición
                                            <>
                                                {animal.sexo === 'Hembra' && (
                                                    <>
                                                        <TextInput
                                                            value={estadoEnEdicion.ciclo_celo}
                                                            onChangeText={(text) =>
                                                                setEstadoEnEdicion({ ...estadoEnEdicion, ciclo_celo: text })
                                                            }
                                                            style={styles.input}
                                                            placeholder="Ciclo de Celo"
                                                        />
                                                        <TouchableOpacity onPress={() => setMostrarFechaCelo(true)}>
                                                            <TextInput
                                                                value={formatDate(estadoEnEdicion.fecha_ultimo_celo)}
                                                                style={styles.input}
                                                                editable={false}
                                                                placeholder="Fecha Último Celo"
                                                            />
                                                        </TouchableOpacity>
                                                        {mostrarFechaCelo && (
                                                            <DateTimePicker
                                                                value={estadoEnEdicion.fecha_ultimo_celo}
                                                                mode="date"
                                                                display="default"
                                                                onChange={(event, selectedDate) => {
                                                                    setMostrarFechaCelo(false);
                                                                    if (selectedDate) {
                                                                        setEstadoEnEdicion({
                                                                            ...estadoEnEdicion,
                                                                            fecha_ultimo_celo: selectedDate,
                                                                        });
                                                                    }
                                                                }}
                                                            />
                                                        )}
                                                        <TextInput
                                                            value={estadoEnEdicion.servicios_realizados}
                                                            onChangeText={(text) =>
                                                                setEstadoEnEdicion({
                                                                    ...estadoEnEdicion,
                                                                    servicios_realizados: text,
                                                                })
                                                            }
                                                            style={styles.input}
                                                            placeholder="Servicios Realizados"
                                                            keyboardType="numeric"
                                                        />
                                                        <TextInput
                                                            value={estadoEnEdicion.numero_gestaciones}
                                                            onChangeText={(text) =>
                                                                setEstadoEnEdicion({
                                                                    ...estadoEnEdicion,
                                                                    numero_gestaciones: text,
                                                                })
                                                            }
                                                            style={styles.input}
                                                            placeholder="Número de Gestaciones"
                                                            keyboardType="numeric"
                                                        />
                                                        <TextInput
                                                            value={estadoEnEdicion.partos_realizados}
                                                            onChangeText={(text) =>
                                                                setEstadoEnEdicion({
                                                                    ...estadoEnEdicion,
                                                                    partos_realizados: text,
                                                                })
                                                            }
                                                            style={styles.input}
                                                            placeholder="Partos Realizados"
                                                            keyboardType="numeric"
                                                        />
                                                        <TextInput
                                                            value={estadoEnEdicion.resultados_lactancia}
                                                            onChangeText={(text) =>
                                                                setEstadoEnEdicion({
                                                                    ...estadoEnEdicion,
                                                                    resultados_lactancia: text,
                                                                })
                                                            }
                                                            style={styles.input}
                                                            placeholder="Resultados de Lactancia"
                                                        />
                                                    </>
                                                )}
                                                {animal.sexo === 'Macho' && (
                                                    <>
                                                        <TextInput
                                                            value={estadoEnEdicion.uso_programa_inseminacion}
                                                            onChangeText={(text) =>
                                                                setEstadoEnEdicion({
                                                                    ...estadoEnEdicion,
                                                                    uso_programa_inseminacion: text,
                                                                })
                                                            }
                                                            style={styles.input}
                                                            placeholder="Uso en Programa de Inseminación"
                                                        />
                                                        <TextInput
                                                            value={estadoEnEdicion.resultado_prueba_reproductiva}
                                                            onChangeText={(text) =>
                                                                setEstadoEnEdicion({
                                                                    ...estadoEnEdicion,
                                                                    resultado_prueba_reproductiva: text,
                                                                })
                                                            }
                                                            style={styles.input}
                                                            placeholder="Resultado de Prueba Reproductiva"
                                                        />
                                                    </>
                                                )}
                                                <Button title="Guardar" onPress={handleGuardarEdicionEstado} />
                                                <Button title="Cancelar" onPress={() => setEstadoEnEdicion(null)} />
                                            </>
                                        ) : (
                                            // Vista normal
                                            <>
                                                {animal.sexo === 'Hembra' && (
                                                    <>
                                                        <Text>Ciclo de Celo: {estado.ciclo_celo || 'N/A'}</Text>
                                                        <Text>
                                                            Fecha Último Celo:{' '}
                                                            {estado.fecha_ultimo_celo ? formatDate(estado.fecha_ultimo_celo) : 'N/A'}
                                                        </Text>
                                                        <Text>Servicios Realizados: {estado.servicios_realizados || 'N/A'}</Text>
                                                        <Text>Número de Gestaciones: {estado.numero_gestaciones || 'N/A'}</Text>
                                                        <Text>Partos Realizados: {estado.partos_realizados || 'N/A'}</Text>
                                                        <Text>Resultados de Lactancia: {estado.resultados_lactancia || 'N/A'}</Text>
                                                    </>
                                                )}
                                                {animal.sexo === 'Macho' && (
                                                    <>
                                                        <Text>
                                                            Uso en Programa de Inseminación:{' '}
                                                            {estado.uso_programa_inseminacion || 'N/A'}
                                                        </Text>
                                                        <Text>
                                                            Resultado de Prueba Reproductiva:{' '}
                                                            {estado.resultado_prueba_reproductiva || 'N/A'}
                                                        </Text>
                                                    </>
                                                )}
                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                                    <Button title="Editar" onPress={() => setEstadoEnEdicion(estado)} />
                                                    <Button title="Eliminar" onPress={() => handleEliminarEstado(estado.id)} />
                                                </View>
                                            </>
                                        )}
                                    </View>
                                ))
                            ) : (
                                <Text>No hay estados reproductivos registrados.</Text>
                            )}
                        </View>




                    </View>

                    <View style={styles.actions}>
                        {isEditing ? (
                            <>
                                <Button title="Guardar Cambios" onPress={handleSaveChanges} />
                                <Button title="Cancelar" onPress={() => setIsEditing(false)} />
                            </>
                        ) : (
                            <Button title="Editar" onPress={() => setIsEditing(true)} />
                        )}
                        <Button
                            title="Eliminar Animal"
                            onPress={() =>
                                Alert.alert(
                                    'Confirmar Eliminación',
                                    '¿Estás seguro de que deseas eliminar este animal y todos sus registros? Esta acción no se puede deshacer.',
                                    [
                                        { text: 'Cancelar', style: 'cancel' },
                                        { text: 'Eliminar', style: 'destructive', onPress: handleEliminarAnimalCompleto },
                                    ]
                                )
                            }
                            color="red"
                        />
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
        backgroundColor: '#f4f4f8',
    },
    card: {
        padding: 20,
        backgroundColor: '#ffffff',
        borderRadius: 15,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 5 },
        shadowRadius: 10,
        elevation: 4,
        marginBottom: 20,
    },
    image: {
        width: 150,
        height: 150,
        borderRadius: 15,
        marginBottom: 20,
        alignSelf: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 12,
        borderRadius: 10,
        marginBottom: 12,
        backgroundColor: '#f9f9f9',
        fontSize: 16,
    },
    subtitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333',
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        color: '#555',
    },
    actions: {
        marginTop: 20,
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    enfermedadContainer: {
        padding: 15,
        backgroundColor: '#ffffff',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 5,
        elevation: 2,
        marginBottom: 15,
    },
    enfermedadLabel: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#444',
        marginBottom: 5,
    },
    enfermedadText: {
        fontSize: 16,
        color: '#666',
        backgroundColor: '#f0f0f5',
        padding: 8,
        borderRadius: 8,
        marginBottom: 10,
    },
    button: {
        backgroundColor: '#007bff',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },

    productoContainer: {
        padding: 15,
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 3,
    },




});


export default PerfilAnimalScreen;
