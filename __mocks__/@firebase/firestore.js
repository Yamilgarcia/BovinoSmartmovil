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
  
  export const initializeFirestore = jest.fn(() => getFirestore());
  export const doc = jest.fn();
  export const setDoc = jest.fn();
  export const getDoc = jest.fn(() => Promise.resolve({ exists: true, data: () => ({}) }));
  export const updateDoc = jest.fn();
  export const deleteDoc = jest.fn();
  