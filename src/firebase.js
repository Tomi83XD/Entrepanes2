// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; 
import { getFirestore } from "firebase/firestore"; 

// --- Configuración de Firebase ---
const firebaseConfig = {
    apiKey: "AIzaSyAvBWbWkhEooaUvc2cPByOx-Q-JEjhRNnQ",
    authDomain: "entrepanesvcp-ad077.firebaseapp.com",
    projectId: "entrepanesvcp-ad077",
    storageBucket: "entrepanesvcp-ad077.firebasestorage.app",
    messagingSenderId: "230894274953",
    appId: "1:230894274953:web:2d577123b8c1988d1db958",
    measurementId: "G-LTJL6CQVMF"
};

const app = initializeApp(firebaseConfig);

// Exportación de servicios (CRÍTICO: Aquí se definen 'auth' y 'db' que el Admin.jsx necesita)
export const auth = getAuth(app); 
export const db = getFirestore(app); 
