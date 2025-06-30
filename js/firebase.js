import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAcpgvBDeCXYwm49nj6V3x5BGPoIXus72Y",
  authDomain: "e-bus-management-8ba13.firebaseapp.com",
  projectId: "e-bus-management-8ba13",
  storageBucket: "e-bus-management-8ba13.firebasestorage.app",
  messagingSenderId: "393473606184",
  appId: "1:393473606184:web:3cde9241416fde153deb1d",
  measurementId: "G-GP9VT5W8DF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };