// Mock explícito de expo-image-picker
jest.mock('expo-image-picker', () => {
    return {
      launchImageLibraryAsync: jest.fn(async () => ({
        canceled: false,
        assets: [{ uri: 'test-image-uri' }],
      })),
      MediaTypeOptions: {
        Images: 'Images', // Mock explícito del valor que estás esperando
      },
    };
  });
  