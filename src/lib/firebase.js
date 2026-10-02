import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyC1bCALuerumOeSZSXaelcAZMTOHVw2-T0",
  authDomain: "pool-cb45f.firebaseapp.com",
  databaseURL: "https://pool-cb45f-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "pool-cb45f",
  storageBucket: "pool-cb45f.firebasestorage.app",
  messagingSenderId: "1031569027210",
  appId: "1:1031569027210:web:51f9f2dad5f544e9247d73"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
