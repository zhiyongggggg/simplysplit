import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

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

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
// Initialize Firestore
const db = getFirestore(app);

const firestore = getFirestore(app);


export var userList = [];
{
  const q = query(collection(firestore, "users"));
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach(i => userList.push(i.data()));
  userList = userList.map((user) => {
      const { username, groupsInvolved } = user;
      console.log(username, groupsInvolved);
      return {
        username,
        groupsInvolved
      };
    });
}

export const addUser = async (username) => {
  try {
    await setDoc(doc(firestore, "users", uid+vid), {
      username: username,
      vid: vid
    });
    console.log("Successfully saved User to database.");
  } catch (error) {
      console.error(error);
  }
}

