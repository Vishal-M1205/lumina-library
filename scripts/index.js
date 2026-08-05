// index.js

// 1. Notice how ALL THREE imports now use version 12.17.1
import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/12.17.1/firebase-analytics.js';
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js';

const firebaseConfig = {
  apiKey: 'AIzaSyDPW-66ZikP8UHM_QflBCx9kA4y466xyoI', // Remember to put your key back!
  authDomain: 'my-book-tracker-4d85b.firebaseapp.com',
  projectId: 'my-book-tracker-4d85b',
  storageBucket: 'my-book-tracker-4d85b.firebasestorage.app',
  messagingSenderId: '519074664965',
  appId: '1:519074664965:web:d37cc3dc2279a5537cc26c',
  measurementId: 'G-JBRWLF0S90',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const auth = getAuth(app);
export {
  auth,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
};
