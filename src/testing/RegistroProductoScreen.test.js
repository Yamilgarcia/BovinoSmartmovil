import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import RegistroProductoScreen from '../screens/RegistroProductoScreen';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../src/conection/firebase';
import { Alert } from 'react-native';

// Mock de firebase/firestore
jest.mock('firebase/firestore', () => {
  const originalModule = jest.requireActual('firebase/firestore');
  return {
    ...originalModule,
    addDoc: jest.fn(),
    collection: jest.fn(),
  };
});

// Mock de Alert para capturar la alerta
jest.spyOn(Alert, 'alert');

describe('RegistroProductoScreen', () => {
  test('debe renderizar correctamente y registrar un producto sin imagen', async () => {
    const { getByPlaceholderText, getByText } = render(<RegistroProductoScreen />);

    // Llenar los campos de entrada obligatorios
    fireEvent.changeText(getByPlaceholderText('Nombre del Producto'), 'Producto Test');
    fireEvent.changeText(getByPlaceholderText('Tipo de Producto'), 'Medicamento');
    fireEvent.changeText(getByPlaceholderText('Dosis Recomendada'), '2 ml');
    fireEvent.changeText(getByPlaceholderText('Frecuencia de Aplicación'), 'Cada 12 horas');

    // Simular la acción de presionar el botón de registro
    const registerButton = getByText('Registrar Producto');
    fireEvent.press(registerButton);

    // Esperar a que la función addDoc sea llamada
    await waitFor(() => {
      expect(addDoc).toHaveBeenCalledWith(
        collection(db, 'productos'), 
        {
          nombre: 'Producto Test',
          tipo: 'Medicamento',
          dosis_recomendada: '2 ml',
          frecuencia_aplicacion: 'Cada 12 horas',
          notas: '',
          es_tratamiento: false,
          imagen: null, // Validar que la imagen no se haya incluido
        }
      );
    });

    // Verificar que se muestra una alerta de éxito
    expect(Alert.alert).toHaveBeenCalledWith('Éxito', 'Producto registrado exitosamente');
  });
});
