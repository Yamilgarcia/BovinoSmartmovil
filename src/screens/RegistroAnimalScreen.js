import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { db } from '../../firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Font from 'expo-font';

const RegistroAnimalScreen = () => {
  const [nombre, setNombre] = useState('');
  const [sexo, setSexo] = useState('');
  const [imagen, setImagen] = useState(null);
  const [codigo_idVaca, setCodigoIdVaca] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState(new Date());
  const [mostrarFechaNacimiento, setMostrarFechaNacimiento] = useState(false);
  const [raza, setRaza] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [pesoNacimiento, setPesoNacimiento] = useState('');
  const [pesoDestete, setPesoDestete] = useState('');
  const [pesoActual, setPesoActual] = useState('');
  const [estado, setEstado] = useState('');
  const [productos, setProductos] = useState([{ nombre: '', dosis: '', fecha: new Date(), es_tratamiento: false }]);
  const [enfermedades, setEnfermedades] = useState([]);
  const [enfermedadSeleccionada, setEnfermedadSeleccionada] = useState('');
  const [fechaEnfermedad, setFechaEnfermedad] = useState(new Date());
  const [mostrarFechaEnfermedad, setMostrarFechaEnfermedad] = useState(null);
  const [mostrarFechaProducto, setMostrarFechaProducto] = useState(null);

  // Estados para control de baños
  const [fechaBano, setFechaBano] = useState(new Date());
  const [productosUtilizados, setProductosUtilizados] = useState('');
  const [mostrarBanos, setMostrarBanos] = useState(false);
  const [mostrarFechaBano, setMostrarFechaBano] = useState(false);

  // Estados para producción de leche
  const [fechaProduccion, setFechaProduccion] = useState(new Date());
  const [cantidadLeche, setCantidadLeche] = useState('');
  const [calidadLeche, setCalidadLeche] = useState('');
  const [mostrarProduccionLeche, setMostrarProduccionLeche] = useState(false);
  const [mostrarFechaProduccion, setMostrarFechaProduccion] = useState(false);

  // Estados para historial de inseminaciones
  const [fechaInseminacion, setFechaInseminacion] = useState(new Date());
  const [tipoInseminacion, setTipoInseminacion] = useState('');
  const [resultadoInseminacion, setResultadoInseminacion] = useState('');
  const [observacionesInseminacion, setObservacionesInseminacion] = useState('');
  const [mostrarInseminaciones, setMostrarInseminaciones] = useState(false);
  const [mostrarFechaInseminacion, setMostrarFechaInseminacion] = useState(false);

  // Estados para mostrar/ocultar secciones
  const [mostrarEnfermedades, setMostrarEnfermedades] = useState(false);
  const [mostrarProductos, setMostrarProductos] = useState(false);
  const [mostrarPesos, setMostrarPesos] = useState(false);


  const [usoProgramaInseminacion, setUsoProgramaInseminacion] = useState('');
  const [resultadoPruebaReproductiva, setResultadoPruebaReproductiva] = useState('');


  // Estados para estado reproductivo
  const [mostrarEstadoReproductivo, setMostrarEstadoReproductivo] = useState(false);
  const [estadoReproductivo, setEstadoReproductivo] = useState({
    ciclo_celo: '',
    fecha_ultimo_celo: new Date(),
    servicios_realizados: 0,
    numero_gestaciones: 0,
    partos_realizados: 0,
    resultado_prueba_reproductiva: '',
    resultados_lactancia: '',
    uso_programa_inseminacion: '',
  });
  const [mostrarFechaCelo, setMostrarFechaCelo] = useState(false);

  const handleSexoChange = (itemValue) => {
    setSexo(itemValue);
    setMostrarEstadoReproductivo(itemValue === 'Macho' || itemValue === 'Hembra');
  };


  useEffect(() => {
    const cargarEnfermedades = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'enfermedades'));
        const listaEnfermedades = [];
        querySnapshot.forEach((doc) => {
          listaEnfermedades.push({ id: doc.id, nombre: doc.data().nombre });
        });
        setEnfermedades(listaEnfermedades);
      } catch (error) {
        console.error("Error cargando enfermedades: ", error);
      }
    };
    cargarEnfermedades();
  }, []);

  useEffect(() => {
    const cargarFuentes = async () => {
      await Font.loadAsync({
        'Junge': require('../../assets/fonts/Junge-Regular.ttf'),
      });
    };
    cargarFuentes();
  }, []);

  const seleccionarImagen = async () => {
    let resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!resultado.canceled && resultado.assets.length > 0) {
      setImagen(resultado.assets[0].uri);
    }
  };

  const registrarControlBano = async (animalId) => {
    try {
      await addDoc(collection(db, `animales/${animalId}/control_banos`), {
        fecha: fechaBano.toISOString().split('T')[0],
        productos_utilizados: productosUtilizados,
      });
      Alert.alert('Éxito', 'Control de baño registrado exitosamente');
      setFechaBano(new Date());
      setProductosUtilizados('');
    } catch (error) {
      console.error("Error registrando el control de baño: ", error);
      Alert.alert('Error', 'Error al registrar el control de baño');
    }
  };

  const registrarProduccionLeche = async (animalId) => {
    try {
      await addDoc(collection(db, `animales/${animalId}/produccion_leche`), {
        fecha: fechaProduccion.toISOString().split('T')[0],
        cantidad: parseFloat(cantidadLeche),
        calidad: calidadLeche,
      });
      Alert.alert('Éxito', 'Producción de leche registrada exitosamente');
      setFechaProduccion(new Date());
      setCantidadLeche('');
      setCalidadLeche('');
    } catch (error) {
      console.error("Error registrando la producción de leche: ", error);
      Alert.alert('Error', 'Error al registrar la producción de leche');
    }
  };

  const registrarInseminacion = async (animalId) => {
    try {
      await addDoc(collection(db, `animales/${animalId}/inseminaciones`), {
        fecha_inseminacion: fechaInseminacion.toISOString().split('T')[0],
        tipo_inseminacion: tipoInseminacion,
        resultado: resultadoInseminacion,
        observaciones: observacionesInseminacion,
      });
      Alert.alert('Éxito', 'Inseminación registrada exitosamente');
      setFechaInseminacion(new Date());
      setTipoInseminacion('');
      setResultadoInseminacion('');
      setObservacionesInseminacion('');
    } catch (error) {
      console.error("Error registrando la inseminación: ", error);
      Alert.alert('Error', 'Error al registrar la inseminación');
    }
  };

  const registrarAnimal = async () => {
    if (!nombre || !sexo || !codigo_idVaca || !raza || !estado) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return;
    }

    try {
      const nuevoAnimalRef = await addDoc(collection(db, 'animales'), {
        nombre,
        sexo,
        imagen,
        codigo_idVaca,
        fecha_nacimiento: fechaNacimiento.toISOString().split('T')[0],
        raza,
        observaciones,
        peso_nacimiento: parseFloat(pesoNacimiento),
        peso_destete: parseFloat(pesoDestete),
        peso_actual: parseFloat(pesoActual),
        estado,
      });

      const animalId = nuevoAnimalRef.id;

      // Registrar estado reproductivo si la sección está visible
      if (mostrarEstadoReproductivo) {
        await addDoc(collection(db, `animales/${animalId}/estado_reproductivo`), {
          ...estadoReproductivo,
          fecha_ultimo_celo: estadoReproductivo.fecha_ultimo_celo.toISOString().split('T')[0],
        });
      }

      if (enfermedadSeleccionada) {
        await addDoc(collection(db, `animales/${animalId}/enfermedades`), {
          enfermedad: enfermedadSeleccionada,
          fecha: fechaEnfermedad.toISOString().split('T')[0],
        });
      }

      for (let producto of productos) {
        await addDoc(collection(db, `animales/${animalId}/productosAplicados`), producto);
      }

      // Registrar control de baño si la sección está visible
      if (mostrarBanos) {
        await registrarControlBano(animalId);
      }

      // Registrar producción de leche si la sección está visible
      if (mostrarProduccionLeche) {
        await registrarProduccionLeche(animalId);
      }

      // Registrar inseminación si la sección está visible
      if (mostrarInseminaciones) {
        await registrarInseminacion(animalId);
      }

      Alert.alert('Éxito', 'Animal y datos registrados exitosamente');
      // Restablecer los campos del formulario
      setNombre('');
      setSexo('');
      setImagen(null);
      setCodigoIdVaca('');
      setFechaNacimiento(new Date());
      setRaza('');
      setObservaciones('');
      setPesoNacimiento('');
      setPesoDestete('');
      setPesoActual('');
      setEstado('');
      setEnfermedadSeleccionada('');
      setFechaEnfermedad(new Date());
      setProductos([{ nombre: '', dosis: '', fecha: new Date(), es_tratamiento: false }]);
      setMostrarBanos(false);
      setMostrarProduccionLeche(false);
      setMostrarInseminaciones(false);
      setMostrarEstadoReproductivo(false);
      setEstadoReproductivo({
        ciclo_celo: '',
        fecha_ultimo_celo: new Date(),
        servicios_realizados: 0,
        numero_gestaciones: 0,
        partos_realizados: 0,
        resultado_prueba_reproductiva: '',
        resultados_lactancia: '',
        uso_programa_inseminacion: '',
      });
    } catch (error) {
      console.error("Error registrando el animal: ", error);
      Alert.alert('Error', 'Error al registrar el animal');
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
      <View style={styles.container}>
        <View style={styles.formContainer}>
          <TouchableOpacity onPress={seleccionarImagen} style={styles.imageContainer}>
            <Image source={require('../../assets/flecha.png')} style={styles.imageIcon} />
          </TouchableOpacity>
          {imagen && <Image source={{ uri: imagen }} style={styles.imagePreview} />}

          <Text style={styles.label}>Nombre del Animal:</Text>
          <TextInput placeholder="Nombre del Animal" value={nombre} onChangeText={setNombre} style={styles.input} />

          <Text style={styles.label}>Género:</Text>
          <Picker selectedValue={sexo} onValueChange={handleSexoChange} style={styles.input}>
            <Picker.Item label="Seleccionar" value="" />
            <Picker.Item label="Macho" value="Macho" />
            <Picker.Item label="Hembra" value="Hembra" />
          </Picker>


          <Text style={styles.label}>Código Único:</Text>
          <TextInput placeholder="Código Único" value={codigo_idVaca} onChangeText={setCodigoIdVaca} style={styles.input} />

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
                if (selectedDate) setFechaNacimiento(selectedDate);
              }}
            />
          )}
          <Text>Fecha Seleccionada: {fechaNacimiento.toDateString()}</Text>

          <Text style={styles.label}>Raza:</Text>
          <TextInput placeholder="Raza" value={raza} onChangeText={setRaza} style={styles.input} />

          <Text style={styles.label}>Observaciones:</Text>
          <TextInput placeholder="Observaciones" value={observaciones} onChangeText={setObservaciones} style={styles.input} />

          {/* Botón para mostrar/ocultar la sección de pesos */}
          <TouchableOpacity onPress={() => setMostrarPesos(!mostrarPesos)} style={styles.toggleButton}>
            <Text style={styles.buttonText}>{mostrarPesos ? 'Ocultar Pesos' : 'Mostrar Pesos'}</Text>
          </TouchableOpacity>

          {mostrarPesos && (
            <View>
              <Text style={styles.label}>Peso al Nacimiento (kg):</Text>
              <TextInput placeholder="Peso al Nacimiento (kg)" value={pesoNacimiento} onChangeText={setPesoNacimiento} style={styles.input} keyboardType="numeric" />

              <Text style={styles.label}>Peso al Destete (kg):</Text>
              <TextInput placeholder="Peso al Destete (kg)" value={pesoDestete} onChangeText={setPesoDestete} style={styles.input} keyboardType="numeric" />

              <Text style={styles.label}>Peso Actual (kg):</Text>
              <TextInput placeholder="Peso Actual (kg)" value={pesoActual} onChangeText={setPesoActual} style={styles.input} keyboardType="numeric" />
            </View>
          )}

          <Text style={styles.label}>Estado:</Text>
          <Picker selectedValue={estado} onValueChange={(itemValue) => setEstado(itemValue)} style={styles.input}>
            <Picker.Item label="Seleccione el Estado" value="" />
            <Picker.Item label="Activo" value="Activo" />
            <Picker.Item label="Enfermo" value="Enfermo" />
            <Picker.Item label="Muerto" value="Muerto" />
            <Picker.Item label="Vendido" value="Vendido" />
          </Picker>

          {/* Botón para mostrar/ocultar la sección de enfermedades */}
          <TouchableOpacity onPress={() => setMostrarEnfermedades(!mostrarEnfermedades)} style={styles.toggleButton}>
            <Text style={styles.buttonText}>{mostrarEnfermedades ? 'Ocultar Historial de Enfermedades' : 'Mostrar Historial de Enfermedades'}</Text>
          </TouchableOpacity>

          {mostrarEnfermedades && (
            <View>
              <Text style={styles.subtitle}>Historial de Enfermedades</Text>
              <Picker selectedValue={enfermedadSeleccionada} onValueChange={(value) => setEnfermedadSeleccionada(value)} style={styles.input}>
                <Picker.Item label="Seleccione una enfermedad" value="" />
                {enfermedades.map((enf) => (
                  <Picker.Item key={enf.id} label={enf.nombre} value={enf.id} />
                ))}
              </Picker>

              <TouchableOpacity onPress={() => setMostrarFechaEnfermedad(true)} style={styles.button}>
                <Text style={styles.buttonText}>Seleccionar Fecha Diagnóstico</Text>
              </TouchableOpacity>
              {mostrarFechaEnfermedad && (
                <DateTimePicker
                  value={fechaEnfermedad}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setMostrarFechaEnfermedad(false);
                    if (selectedDate) setFechaEnfermedad(selectedDate);
                  }}
                />
              )}
              <Text>Fecha Diagnóstico Seleccionada: {fechaEnfermedad.toDateString()}</Text>
            </View>
          )}

          {/* Botón para mostrar/ocultar la sección de productos */}
          <TouchableOpacity onPress={() => setMostrarProductos(!mostrarProductos)} style={styles.toggleButton}>
            <Text style={styles.buttonText}>{mostrarProductos ? 'Ocultar Productos Aplicados' : 'Mostrar Productos Aplicados'}</Text>
          </TouchableOpacity>

          {mostrarProductos && (
            <View>
              <Text style={styles.subtitle}>Productos Aplicados</Text>
              {productos.map((producto, index) => (
                <View key={index}>
                  <TextInput
                    placeholder="Nombre del Producto"
                    value={producto.nombre}
                    onChangeText={(value) => {
                      const nuevosProductos = [...productos];
                      nuevosProductos[index].nombre = value;
                      setProductos(nuevosProductos);
                    }}
                    style={styles.input}
                  />
                  <TextInput
                    placeholder="Dosis"
                    value={producto.dosis}
                    onChangeText={(value) => {
                      const nuevosProductos = [...productos];
                      nuevosProductos[index].dosis = value;
                      setProductos(nuevosProductos);
                    }}
                    style={styles.input}
                  />

                  <TouchableOpacity onPress={() => setMostrarFechaProducto(index)} style={styles.button}>
                    <Text style={styles.buttonText}>Seleccionar Fecha de Aplicación</Text>
                  </TouchableOpacity>
                  {mostrarFechaProducto === index && (
                    <DateTimePicker
                      value={producto.fecha}
                      mode="date"
                      display="default"
                      onChange={(event, selectedDate) => {
                        setMostrarFechaProducto(null);
                        if (selectedDate) {
                          const nuevosProductos = [...productos];
                          nuevosProductos[index].fecha = selectedDate;
                          setProductos(nuevosProductos);
                        }
                      }}
                    />
                  )}
                  <Text>Fecha de Aplicación Seleccionada: {producto.fecha.toDateString()}</Text>

                  <Text>¿Es un tratamiento?</Text>
                  <Picker
                    selectedValue={producto.es_tratamiento}
                    onValueChange={(value) => {
                      const nuevosProductos = [...productos];
                      nuevosProductos[index].es_tratamiento = value;
                      setProductos(nuevosProductos);
                    }}
                    style={styles.input}
                  >
                    <Picker.Item label="No" value={false} />
                    <Picker.Item label="Sí" value={true} />
                  </Picker>
                </View>
              ))}
              <TouchableOpacity onPress={() => setProductos([...productos, { nombre: '', dosis: '', fecha: new Date(), es_tratamiento: false }])} style={styles.button}>
                <Text style={styles.buttonText}>Añadir Producto</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Botón para mostrar/ocultar la sección de baños */}
          <TouchableOpacity onPress={() => setMostrarBanos(!mostrarBanos)} style={styles.toggleButton}>
            <Text style={styles.buttonText}>{mostrarBanos ? 'Ocultar Baños' : 'Mostrar Baños'}</Text>
          </TouchableOpacity>

          {mostrarBanos && (
            <View>
              <Text style={styles.label}>Fecha del Baño:</Text>
              <TouchableOpacity onPress={() => setMostrarFechaBano(true)} style={styles.button}>
                <Text style={styles.buttonText}>Seleccionar Fecha del Baño</Text>
              </TouchableOpacity>
              {mostrarFechaBano && (
                <DateTimePicker
                  value={fechaBano}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setMostrarFechaBano(false);
                    if (selectedDate) {
                      setFechaBano(selectedDate);
                    }
                  }}
                />
              )}
              <Text>Fecha Seleccionada: {fechaBano.toDateString()}</Text>

              <Text style={styles.label}>Productos Utilizados:</Text>
              <TextInput
                placeholder="Productos utilizados"
                value={productosUtilizados}
                onChangeText={setProductosUtilizados}
                style={styles.input}
              />
            </View>
          )}

          {/* Botón para mostrar/ocultar la sección de producción de leche */}
          <TouchableOpacity onPress={() => setMostrarProduccionLeche(!mostrarProduccionLeche)} style={styles.toggleButton}>
            <Text style={styles.buttonText}>{mostrarProduccionLeche ? 'Ocultar Producción de Leche' : 'Mostrar Producción de Leche'}</Text>
          </TouchableOpacity>

          {mostrarProduccionLeche && (
            <View>
              <Text style={styles.label}>Fecha de Producción:</Text>
              <TouchableOpacity onPress={() => setMostrarFechaProduccion(true)} style={styles.button}>
                <Text style={styles.buttonText}>Seleccionar Fecha</Text>
              </TouchableOpacity>
              {mostrarFechaProduccion && (
                <DateTimePicker
                  value={fechaProduccion}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setMostrarFechaProduccion(false);
                    if (selectedDate) setFechaProduccion(selectedDate);
                  }}
                />
              )}
              <Text>Fecha Seleccionada: {fechaProduccion.toDateString()}</Text>

              <Text style={styles.label}>Cantidad (L):</Text>
              <TextInput
                placeholder="Cantidad de leche"
                value={cantidadLeche}
                onChangeText={setCantidadLeche}
                style={styles.input}
                keyboardType="numeric"
              />

              <Text style={styles.label}>Calidad:</Text>
              <TextInput
                placeholder="Calidad de la leche"
                value={calidadLeche}
                onChangeText={setCalidadLeche}
                style={styles.input}
              />
            </View>
          )}

          {/* Botón para mostrar/ocultar la sección de inseminaciones */}
          <TouchableOpacity onPress={() => setMostrarInseminaciones(!mostrarInseminaciones)} style={styles.toggleButton}>
            <Text style={styles.buttonText}>{mostrarInseminaciones ? 'Ocultar Inseminaciones' : 'Mostrar Inseminaciones'}</Text>
          </TouchableOpacity>

          {mostrarInseminaciones && (
            <View>
              <Text style={styles.label}>Fecha de Inseminación:</Text>
              <TouchableOpacity onPress={() => setMostrarFechaInseminacion(true)} style={styles.button}>
                <Text style={styles.buttonText}>Seleccionar Fecha</Text>
              </TouchableOpacity>
              {mostrarFechaInseminacion && (
                <DateTimePicker
                  value={fechaInseminacion}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setMostrarFechaInseminacion(false);
                    if (selectedDate) setFechaInseminacion(selectedDate);
                  }}
                />
              )}
              <Text>Fecha Seleccionada: {fechaInseminacion.toDateString()}</Text>

              <Text style={styles.label}>Tipo de Inseminación:</Text>
              <TextInput
                placeholder="Tipo de inseminación"
                value={tipoInseminacion}
                onChangeText={setTipoInseminacion}
                style={styles.input}
              />

              <Text style={styles.label}>Resultado:</Text>
              <TextInput
                placeholder="Resultado"
                value={resultadoInseminacion}
                onChangeText={setResultadoInseminacion}
                style={styles.input}
              />

              <Text style={styles.label}>Observaciones:</Text>
              <TextInput
                placeholder="Observaciones"
                value={observacionesInseminacion}
                onChangeText={setObservacionesInseminacion}
                style={styles.input}
              />
            </View>
          )}


          {/* Botón para mostrar/ocultar la sección de estado reproductivo */}
          {mostrarEstadoReproductivo && (
            <View>
              {sexo === 'Hembra' ? (
                <View>
                  <Text style={styles.label}>Ciclo de Celo:</Text>
                  <Picker
                    selectedValue={estadoReproductivo.ciclo_celo}
                    onValueChange={(value) => setEstadoReproductivo({ ...estadoReproductivo, ciclo_celo: value })}
                    style={styles.input}
                  >
                    <Picker.Item label="Seleccione el ciclo" value="" />
                    <Picker.Item label="18 días" value="18 días" />
                    <Picker.Item label="21 días" value="21 días" />
                    <Picker.Item label="24 días" value="24 días" />
                    <Picker.Item label="28 días" value="28 días" />
                  </Picker>

                  <TouchableOpacity onPress={() => setMostrarFechaCelo(true)} style={styles.button}>
                    <Text style={styles.buttonText}>Seleccionar Fecha del Último Celo</Text>
                  </TouchableOpacity>
                  {mostrarFechaCelo && (
                    <DateTimePicker
                      value={estadoReproductivo.fecha_ultimo_celo}
                      mode="date"
                      display="default"
                      onChange={(event, selectedDate) => {
                        setMostrarFechaCelo(false);
                        if (selectedDate) setEstadoReproductivo({ ...estadoReproductivo, fecha_ultimo_celo: selectedDate });
                      }}
                    />
                  )}
                  <Text>Fecha del Último Celo: {estadoReproductivo.fecha_ultimo_celo.toDateString()}</Text>

                  <Text style={styles.label}>Servicios Realizados:</Text>
                  <Picker
                    selectedValue={estadoReproductivo.servicios_realizados}
                    onValueChange={(value) => setEstadoReproductivo({ ...estadoReproductivo, servicios_realizados: value })}
                    style={styles.input}
                  >
                    {[...Array(10).keys()].map((num) => (
                      <Picker.Item key={num} label={num.toString()} value={num} />
                    ))}
                  </Picker>

                  <Text style={styles.label}>Número de Gestaciones:</Text>
                  <Picker
                    selectedValue={estadoReproductivo.numero_gestaciones}
                    onValueChange={(value) => setEstadoReproductivo({ ...estadoReproductivo, numero_gestaciones: value })}
                    style={styles.input}
                  >
                    {[...Array(10).keys()].map((num) => (
                      <Picker.Item key={num} label={num.toString()} value={num} />
                    ))}
                  </Picker>

                  <Text style={styles.label}>Partos Realizados:</Text>
                  <Picker
                    selectedValue={estadoReproductivo.partos_realizados}
                    onValueChange={(value) => setEstadoReproductivo({ ...estadoReproductivo, partos_realizados: value })}
                    style={styles.input}
                  >
                    {[...Array(10).keys()].map((num) => (
                      <Picker.Item key={num} label={num.toString()} value={num} />
                    ))}
                  </Picker>

                  <Text style={styles.label}>Resultados de la Lactancia:</Text>
                  <Picker
                    selectedValue={estadoReproductivo.resultados_lactancia}
                    onValueChange={(value) => setEstadoReproductivo({ ...estadoReproductivo, resultados_lactancia: value })}
                    style={styles.input}
                  >
                    <Picker.Item label="Seleccione" value="" />
                    <Picker.Item label="Alta producción" value="Alta producción" />
                    <Picker.Item label="Producción normal" value="Producción normal" />
                    <Picker.Item label="Baja producción" value="Baja producción" />
                  </Picker>
                </View>
              ) : (
                <View>
                  <Text style={styles.label}>Uso en Programa de Inseminación:</Text>
                  <Picker
                    selectedValue={usoProgramaInseminacion}
                    onValueChange={(itemValue) => setUsoProgramaInseminacion(itemValue)}
                    style={styles.input}
                  >
                    <Picker.Item label="Seleccione" value="" />
                    <Picker.Item label="Frecuente" value="Frecuente" />
                    <Picker.Item label="Ocasional" value="Ocasional" />
                    <Picker.Item label="Nunca" value="Nunca" />
                  </Picker>

                  <Text style={styles.label}>Resultado de la Prueba Reproductiva:</Text>
                  <Picker
                    selectedValue={resultadoPruebaReproductiva}
                    onValueChange={(itemValue) => setResultadoPruebaReproductiva(itemValue)}
                    style={styles.input}
                  >
                    <Picker.Item label="Seleccione" value="" />
                    <Picker.Item label="Positivo" value="Positivo" />
                    <Picker.Item label="Negativo" value="Negativo" />
                    <Picker.Item label="Pendiente" value="Pendiente" />
                  </Picker>
                </View>
              )}
            </View>
          )}



          <TouchableOpacity onPress={registrarAnimal} style={styles.button}>
            <Text style={styles.buttonText}>Registrar Animal</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  formContainer: {
    backgroundColor: '#8AC879',
    padding: 20,
    borderRadius: 15,
    borderColor: '#3E7B31',
    borderWidth: 4,
    marginTop: 60,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#344e41',
    fontFamily: 'Junge',
  },
  input: {
    borderWidth: 1,
    borderColor: '#344e41',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#587A83',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  buttonText: {
    color: '#000000',
    textAlign: 'center',
  },
  toggleButton: {
    backgroundColor: '#6dbf47',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  imageContainer: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: 20,
    backgroundColor: '#d1e7dd',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    borderColor: '#344e41',
    borderWidth: 1,
  },
  imageIcon: {
    width: 50,
    height: 50,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    marginBottom: 15,
    borderRadius: 5,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#344e41',
  },
});

export default RegistroAnimalScreen;
