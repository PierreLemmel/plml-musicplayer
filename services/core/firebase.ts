import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore, doc, FirestoreError, updateDoc, collection, DocumentData } from 'firebase/firestore';
import { Auth, getAuth, signInWithPopup, GoogleAuthProvider, signOut, User } from "firebase/auth";
import { useAuthState } from 'react-firebase-hooks/auth';
import { useDocumentData } from "react-firebase-hooks/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCyLvFF8rAZUdqrUnupHTnIaKXtYfb31GM",
  authDomain: "plml-musicplayer.firebaseapp.com",
  projectId: "plml-musicplayer",
  storageBucket: "plml-musicplayer.appspot.com",
  messagingSenderId: "722344346320",
  appId: "1:722344346320:web:221c6c17eef8e2705554d5"
};

const app = initializeApp(firebaseConfig);

export const getFileStorage = () => getStorage(app);

const auth: Auth = getAuth(app);

export const useAuth = () => useAuthState(auth);

export const onAuthChanged = (callback: (user: User|null) => void) => auth.onAuthStateChanged(callback);

const googleProvider = new GoogleAuthProvider();
export const googleSignIn = async () => {

    try {
        await signInWithPopup(auth, googleProvider);
    }
    catch(error: any) {
        console.error(error);
    }
}

export const userSignOut = async () => {
    
    try {
        await signOut(auth);
    }
    catch(error: any) {
        console.error(error);
    }
}


const firestore = getFirestore(app);


function getDocument(path: string) {
    return doc(firestore, path);
}


export function useUserData<T>(path: string): T|undefined {

    const user = auth.currentUser;

    const docRef = user ? getDocument(`users-data/${user.uid}/${path}`) : undefined;
    const [docData, loading, error] = useDocumentData(docRef);

    let result: T|undefined;
    if (error) {
        console.error(error);
    }
    else if (docData) {
        const unknownData: unknown = docData; 
        result = unknownData as T;
    }

    return result;
}

export function updateUserData<T>(path: string, data: Partial<T>) {

    const user = auth.currentUser;

    const docRef = user ? getDocument(`users-data/${user.uid}/${path}`) : undefined;

    updateDoc<DocumentData>(docRef, data);
}