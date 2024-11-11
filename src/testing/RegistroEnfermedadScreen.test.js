import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import RegistroEnfermedadScreen from '../screens/RegistroEnfermedadScreen';
import * as ImagePicker from 'expo-image-picker';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../src/conection/firebase';

// Mock de expo-image-picker
jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(async () => ({
    canceled: false,
    assets: [{ uri: 'test-image-uri' }],
  })),
}));

// Mock de firebase/firestore
jest.mock('firebase/firestore', () => {
  const originalModule = jest.requireActual('firebase/firestore');
  return {
    ...originalModule,
    addDoc: jest.fn(),
    collection: jest.fn(),
  };
});

describe('RegistroEnfermedadScreen', () => {
  test('debe renderizar correctamente y registrar una enfermedad sin imagen', async () => {
    const navigation = { navigate: jest.fn() };

    const { getByPlaceholderText, getByTestId } = render(
      <RegistroEnfermedadScreen navigation={navigation} />
    );

    // Llenar los campos de entrada
    fireEvent.changeText(getByPlaceholderText('Nombre de la Enfermedad'), 'Enfermedad Test');
    fireEvent.changeText(getByPlaceholderText('Descripción'), 'Descripción de prueba');
    fireEvent.changeText(getByPlaceholderText('Síntomas'), 'Fiebre, tos');
    fireEvent.changeText(getByPlaceholderText('Modo de Transmisión'), 'Contacto directo');

    // Simular la acción de presionar el botón de registro
    const registerButton = getByTestId('registerButton');
    fireEvent.press(registerButton);

    // Esperar a que la función addDoc sea llamada
    await waitFor(() => {
      expect(addDoc).toHaveBeenCalledWith(
        collection(db, 'enfermedades'), 
        {
          nombre: 'Enfermedad Test',
          descripcion: 'Descripción de prueba',
          sintomas: 'Fiebre, tos',
          modoTransmision: 'Contacto directo',
          imagen: null,
        }
      );
    });

    // Verificar que la navegación ocurrió
    expect(navigation.navigate).toHaveBeenCalledWith('GestionEnfermedades');
  });
});
