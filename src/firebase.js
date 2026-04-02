import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCtKinK8YOipyS0c65AhsqXGaOXcyCR9y8",
  authDomain: "chat-app-5700c.firebaseapp.com",
  projectId: "chat-app-5700c",
  storageBucket: "chat-app-5700c.firebasestorage.app",
  messagingSenderId: "288013584994",
  appId: "1:288013584994:web:7b3dbbc03208c57835df3b"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);