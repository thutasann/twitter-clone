import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyCJ2vsdQVOFcbjYXUpM2wDBrNQ03PtxarI",
    authDomain: "twitter-clone-9145a.firebaseapp.com",
    projectId: "twitter-clone-9145a",
    storageBucket: "twitter-clone-9145a.appspot.com",
    messagingSenderId: "724443679543",
    appId: "1:724443679543:web:25cb13003153b7951728b2"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore();
const storage = getStorage();

export default app;
export { db, storage };