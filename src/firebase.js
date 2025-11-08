import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCNzlm3_VtgYibIyMMa0ttd9vQL_JUCs-I",
  authDomain: "women-safety-951f9.firebaseapp.com",
  projectId: "women-safety-951f9",
  storageBucket: "women-safety-951f9.appspot.com", // ✅ change ".app" to ".appspot.com"
  messagingSenderId: "278774268791",
  appId: "1:278774268791:web:d5a9ac5a0073e8be6d9772",
  measurementId: "G-LT0WJ3ZB25",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
