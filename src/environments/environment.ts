export const environment = {
  production: false,
  firebase: {
    apiKey: 'AIzaSyCf8BZZjS1HF8GPzwUeu6XIJd05XoMZRjY',
    authDomain: 'yemek23-13114.firebaseapp.com',
    databaseURL: 'https://yemek23-13114-default-rtdb.firebaseio.com',
    projectId: 'yemek23-13114',
    storageBucket: 'yemek23-13114.firebasestorage.app',
    messagingSenderId: '881914222383',
    appId: '1:881914222383:web:c1ea439e81e9e8ea9e73da',
  },
  adminUser: {
    uid: 'admin',
    email: 'admin@yemek23.com',
    password: 'admin123',
    displayName: 'Admin',
    name: 'Admin',
    role: 'admin' as const,
    isActive: true,
  },
};
