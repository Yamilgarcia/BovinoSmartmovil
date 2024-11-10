import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { act } from 'react-test-renderer';
import RegistroAnimalScreen from '../screens/RegistroAnimalScreen';
import { addDoc, getDocs, collection } from 'firebase/firestore';

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: jest.fn(),
  getDocs: jest.fn(() => Promise.resolve({
    docs: [
      { id: '12345', data: () => ({ codigo_idVaca: '12345' }) },
      { id: '67890', data: () => ({ codigo_idVaca: '67890' }) },
    ],
    forEach: jest.fn(callback => {
      const docs = [
        { id: '123', data: () => ({ nombre: 'Enfermedad1' }) },
        { id: '456', data: () => ({ nombre: 'Enfermedad2' }) },
      ];
      docs.forEach(callback);
    }),
  })),
}));

describe('RegistroAnimalScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    addDoc.mockResolvedValueOnce({ id: 'newAnimalId' });
  });

  it('debe renderizar correctamente y registrar un animal sin imagen', async () => {
    const { getByPlaceholderText, getByTestId } = render(<RegistroAnimalScreen />);
  
    // Cambiar los valores en los campos
    await act(async () => {
      fireEvent.changeText(getByPlaceholderText('Nombre del Animal'), 'Animal Test');
      fireEvent(getByTestId('genderPicker'), 'onValueChange', 'Macho');
      fireEvent.changeText(getByPlaceholderText('Código Único'), '12345');
      fireEvent.changeText(getByPlaceholderText('Raza'), 'Angus');
      fireEvent.changeText(getByPlaceholderText('Observaciones'), 'Observación de prueba');
  
      // **Presionamos el botón para mostrar los campos de peso**
      fireEvent.press(getByTestId('togglePesosButton'));
  
      // Ahora rellenamos los campos de peso
      fireEvent.changeText(getByPlaceholderText('Peso al Nacimiento (kg)'), '30');
      fireEvent.changeText(getByPlaceholderText('Peso al Destete (kg)'), '50');
      fireEvent.changeText(getByPlaceholderText('Peso Actual (kg)'), '200');
      fireEvent(getByTestId('statusPicker'), 'onValueChange', 'Activo');
      fireEvent.press(getByTestId('registerAnimalButton'));
    });
  
    // Verificar que addDoc fue llamado con los valores correctos
    await waitFor(() => {
      expect(addDoc).toHaveBeenNthCalledWith(1, expect.anything(), {
        nombre: 'Animal Test',
        sexo: 'Macho',
        codigo_idVaca: '12345',
        fecha_nacimiento: expect.any(String),
        raza: 'Angus',
        observaciones: 'Observación de prueba',
        peso_nacimiento: 30,
        peso_destete: 50,
        peso_actual: 200,
        estado: 'Activo',
        imagen: null,
      });
    });
  });
  
    // Confirmación de que se alcanzó la llamada a addDoc
    console.log('addDoc fue llamado correctamente en la prueba');
  });

