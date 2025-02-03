// Import Firebase modules
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCWrzazfJ0XppB_UMZhYv-LU18Yjlq-jxQ",
  authDomain: "cbx-logistics-website.firebaseapp.com",
  projectId: "cbx-logistics-website",
  storageBucket: "cbx-logistics-website.firebasestorage.app",
  messagingSenderId: "318828955558",
  appId: "1:318828955558:web:13554df63818500192b167"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);       // For authentication (login)
export const db = getFirestore(app);    // For Firestore database
