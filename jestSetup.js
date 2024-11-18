import { NativeModules } from 'react-native';

// Mock de NativeModules para evitar errores en TurboModules
NativeModules.SettingsManager = NativeModules.SettingsManager || {
  settings: {},
  setValues: jest.fn(),
  getConstants: jest.fn(() => ({
    settings: {},
  })),
};

NativeModules.PlatformConstants = NativeModules.PlatformConstants || {
  forceTouchAvailable: false,
};

NativeModules.RNDeviceInfo = NativeModules.RNDeviceInfo || {
  uniqueId: 'mockUniqueId',
  deviceId: 'mockDeviceId',
};

// Mock de react-native-reanimated
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

// Mock de expo-image-picker
jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(() =>
    Promise.resolve({ canceled: false, assets: [{ uri: 'mockUri' }] })
  ),
}));

// Mock de @react-native-picker/picker
jest.mock('@react-native-picker/picker', () => ({
  Picker: jest.fn(({ children }) => children),
}));

// Mock de @react-native-community/datetimepicker
jest.mock('@react-native-community/datetimepicker', () => ({
  default: jest.fn(() => null),
}));

// Mock de react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: jest
    .fn()
    .mockImplementation(({ children }) => children),
  State: {},
  PanGestureHandler: jest.fn(),
  BaseButton: jest.fn(),
  Directions: {},
  
}));


jest.mock('@react-native-picker/picker', () => {
  const React = require('react');
  const Picker = ({ children, onValueChange }) =>
    React.createElement('select', { onChange: (e) => onValueChange(e.target.value) }, children);

  Picker.Item = ({ label, value }) => React.createElement('option', { value }, label);

  return { Picker };
})