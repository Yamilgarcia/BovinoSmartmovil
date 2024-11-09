// Extiende las funcionalidades de Jest para trabajar con Testing Library
import '@testing-library/jest-native/extend-expect';

// Crea un mock de Firebase para evitar llamadas reales a la base de datos durante las pruebas
jest.mock('firebase', () => require('./__mocks__/firebase'));
jest.mock('expo-image-picker');
