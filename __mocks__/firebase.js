export const auth = {
  currentUser: { uid: 'test-uid', email: 'test@example.com' }
};

export const db = {
  collection: jest.fn(() => ({
    doc: jest.fn(() => ({
      set: jest.fn(),
      get: jest.fn(() => Promise.resolve({ exists: true, data: () => ({}) })),
      update: jest.fn(),
      delete: jest.fn()
    }))
  }))
};
