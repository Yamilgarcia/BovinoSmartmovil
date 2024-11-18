jest.mock('expo-image-picker', () => {
  return {
    // Mock para la función de seleccionar imágenes
    launchImageLibraryAsync: jest.fn(async () => ({
      canceled: false, // Cambia a `true` si deseas simular que se cancela la selección
      assets: [{ uri: 'test-image-uri' }], // Devuelve una URI simulada para la imagen seleccionada
    })),

    // Mock para opciones de tipos de medios
    MediaTypeOptions: {
      Images: 'Images', // Simula que el tipo permitido es solo imágenes
      Videos: 'Videos', // También puedes añadir Videos si es necesario
    },
  };
});
