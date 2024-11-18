module.exports = {
  preset: 'jest-expo',
  setupFiles: ['<rootDir>/__mocks__/firebase'], // Asegúrate de que la ruta sea correcta
  setupFilesAfterEnv: [
    '@testing-library/jest-native/extend-expect',
    '<rootDir>/jestSetup.js',
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|expo|@expo|@unimodules|firebase|@firebase)',
  ],
};
