import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAVkxt4OVcGfqQrAbnlMpiz2aeJE0542n4",
  authDomain: "sea-river-view.firebaseapp.com",
  projectId: "sea-river-view",
  storageBucket: "sea-river-view.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

// Prevent initializing more than once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };