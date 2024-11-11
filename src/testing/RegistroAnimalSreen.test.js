import { render, fireEvent, waitFor } from '@testing-library/react-native';
import RegistroAnimalScreen from '../screens/RegistroAnimalScreen';
import { addDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../../src/conection/firebase';
import { Alert } from 'react-native';

// Mock de firebase/firestore
jest.mock('firebase/firestore', () => {
  const originalModule = jest.requireActual('firebase/firestore');
  return {
    ...originalModule,
    addDoc: jest.fn(),
    collection: jest.fn(),
    getDocs: jest.fn(() => Promise.resolve({ forEach: jest.fn() })),
  };
});

// Mock de Alert para capturar la alerta
jest.spyOn(Alert, 'alert');

describe('RegistroAnimalScreen', () => {
  test('debe renderizar correctamente y registrar un animal sin imagen y sin validar código único', async () => {
    const { getByPlaceholderText, getByTestId } = render(<RegistroAnimalScreen />);

    // Llenar los campos de entrada obligatorios
    fireEvent.changeText(getByPlaceholderText('Nombre del Animal'), 'Animal Test');
    fireEvent.changeText(getByPlaceholderText('Raza'), 'Holstein');
    fireEvent.changeText(getByPlaceholderText('Observaciones'), 'Sin observaciones');

    // Activar los campos de peso si están ocultos inicialmente
    fireEvent.press(getByTestId('togglePesosButton'));

    // Llenar los campos de peso
    fireEvent.changeText(getByPlaceholderText('Peso al Nacimiento (kg)'), '30');
    fireEvent.changeText(getByPlaceholderText('Peso al Destete (kg)'), '50');
    fireEvent.changeText(getByPlaceholderText('Peso Actual (kg)'), '200');

    // Seleccionar el estado
    fireEvent(getByTestId('statusPicker'), 'onValueChange', 'Activo');

    // Simular la acción de presionar el botón de registro
    const registerButton = getByTestId('registerAnimalButton');
    fireEvent.press(registerButton);

    // Verificar que la función addDoc se haya llamado al menos una vez
    await waitFor(() => {
      expect(addDoc).toHaveBeenCalled();
    });

    // Verificar que se muestra una alerta de éxito
    expect(Alert.alert).toHaveBeenCalledWith('Éxito', 'Animal y datos registrados exitosamente');
  });
});
