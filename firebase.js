// Import necessary functions from Firebase SDK
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAjpgEXceNttO_QVM5h5G38DxOLKFX0hgI",
  authDomain: "clarity-740bf.firebaseapp.com",
  projectId: "clarity-740bf",
  storageBucket: "clarity-740bf.appspot.com",
  messagingSenderId: "143583289018",
  appId: "1:143583289018:web:efa702b6155c23bec2ec83",
  measurementId: "G-Q0P6JMBT79"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
