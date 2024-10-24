import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyADqKvbqmKc5veLO_udzJdLvaGDl_9POd8",
    authDomain: "simplysplit-87576.firebaseapp.com",
    projectId: "simplysplit-87576",
    storageBucket: "simplysplit-87576.appspot.com",
    messagingSenderId: "288374291567",
    appId: "1:288374291567:web:6624febeb83f01c5c6e19a"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

const db = getFirestore(app);

export { db, auth, googleProvider, doc, setDoc, updateDoc, arrayUnion };






