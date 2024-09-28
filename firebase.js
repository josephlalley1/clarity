// Import the functions you need from the Firebase SDKs
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";  // Import Auth and anonymous sign-in
import { getStorage } from "firebase/storage";               // Import Firebase Storage
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage

// Your web app's Firebase configuration
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

// Initialize Firebase Storage and Auth
export const storage = getStorage(app);
export const auth = getAuth(app);

// Sign in anonymously
signInAnonymously(auth)
  .then(async (userCredential) => {
    // Signed in successfully.
    const user = userCredential.user;  // This is the signed-in user
    console.log('Signed in anonymously:', user.uid);
    
    // Store the UID using AsyncStorage
    await AsyncStorage.setItem('userUID', user.uid);
  })
  .catch((error) => {
    console.error('Anonymous sign-in failed:', error);
  });
