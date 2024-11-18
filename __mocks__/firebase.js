// Simula la inicialización de Firebase App
export const initializeApp = jest.fn(() => ({}));

// Simula Firebase Firestore
export const getFirestore = jest.fn(() => ({
  collection: jest.fn(() => ({
    addDoc: jest.fn(() => Promise.resolve({ id: 'mock-id' })), // Simula addDoc
    getDocs: jest.fn(() =>
      Promise.resolve({
        docs: [
          {
            id: 'mock-id',
            data: () => ({ codigo_idVaca: '12345', nombre: 'Vaca Test' }),
          },
        ],
      })
    ), // Simula getDocs
  })),
}));

// Simula Firebase Auth
export const initializeAuth = jest.fn(() => ({
  currentUser: { uid: 'mock-uid', email: 'mock@example.com' },
}));

export const auth = {
  currentUser: { uid: 'mock-uid', email: 'mock@example.com' },
};

// Exporta un objeto db (Firestore)
export const db = getFirestore();
