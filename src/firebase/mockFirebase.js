const mockFirebase = {
  signIn: async (email, password) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (email && password) return { user: { email, uid: '12345' } };
    throw new Error('Invalid credentials');
  },
  signUp: async (email, password) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { user: { email, uid: '12345' } };
  },
  signInWithGoogle: async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { user: { email: 'user@gmail.com', uid: '12345' } };
  },
  resetPassword: async (email) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return true;
  },
  signOut: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return true;
  }
};

export default mockFirebase;
