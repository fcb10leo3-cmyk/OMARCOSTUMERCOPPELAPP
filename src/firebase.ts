import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  query,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCCeLrgPDOLERlr0lHe8Y1ugliPxWcyab0",
  authDomain: "coppel-asistencia.firebaseapp.com",
  projectId: "coppel-asistencia",
  storageBucket: "coppel-asistencia.firebasestorage.app",
  messagingSenderId: "484673873075",
  appId: "1:484673873075:web:7f483347a495126122bcc6"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

export {
  app,
  db,
  collection,
  addDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  query,
  orderBy,
  limit,
  Timestamp
};
