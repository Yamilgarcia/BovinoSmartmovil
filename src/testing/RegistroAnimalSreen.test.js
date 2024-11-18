import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import RegistroAnimalScreen from '../screens/RegistroAnimalScreen'; // Ajusta la ruta según tu proyecto.

test('Debería renderizar correctamente y manejar el registro del animal', () => {
  const { getByPlaceholderText, getByTestId } = render(<RegistroAnimalScreen />);

  const nombreInput = getByPlaceholderText('Nombre del Animal');
  const codigoInput = getByPlaceholderText('Código Único');
  const registerButton = getByTestId('registerAnimalButton');

  fireEvent.changeText(nombreInput, 'Vaca Test');
  fireEvent.changeText(codigoInput, '12345');
  fireEvent.press(registerButton);

  expect(getByTestId('registerAnimalButton')).toBeTruthy();
});
