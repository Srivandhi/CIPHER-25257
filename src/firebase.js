// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAwd1kM0jF9v124vKcYsZYWUrRpw10Xo_A",
    authDomain: "cipher-d39fe.firebaseapp.com",
    projectId: "cipher-d39fe",
    storageBucket: "cipher-d39fe.firebasestorage.app",
    messagingSenderId: "598690915118",
    appId: "1:598690915118:web:358d2b712e3b00d8ded0bf"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
