import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

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