// __mocks__/firebase.js

export const initializeApp = jest.fn(() => ({}));
export const getFirestore = jest.fn(() => ({
  collection: jest.fn(() => ({
    doc: jest.fn(() => ({
      set: jest.fn(),
      get: jest.fn(() => Promise.resolve({ exists: true, data: () => ({}) })),
      update: jest.fn(),
      delete: jest.fn(),
    })),
  })),
}));
export const initializeAuth = jest.fn(() => ({
  currentUser: { uid: 'test-uid', email: 'test@example.com' },
}));
export const getReactNativePersistence = jest.fn(() => ({}));
export const auth = {
  currentUser: { uid: 'test-uid', email: 'test@example.com' },
};
export const db = getFirestore(); // Asegúrate de exportar db si tu código la usa

// En __mocks__/firebase.js o en el setup de Jest
export const getDocs = jest.fn(() =>
  Promise.resolve({
    forEach: (callback) => {
      const mockData = [
        { id: '1', data: () => ({ nombre: 'Enfermedad1' }) },
        { id: '2', data: () => ({ nombre: 'Enfermedad2' }) },
      ];
      mockData.forEach(callback);
    },
  })
);

