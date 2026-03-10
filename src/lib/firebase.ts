import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBrvw6lZCFUMIQKPjbLQn88U8aYXSMBllo",
  authDomain: "luo-watch.firebaseapp.com",
  projectId: "luo-watch",
  storageBucket: "luo-watch.firebasestorage.app",
  messagingSenderId: "715391513900",
  appId: "1:715391513900:web:eb58773716134d3c60a889",
  measurementId: "G-275C5X897V",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
