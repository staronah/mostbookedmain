
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBLxeSnlj9-YhbwLHB2xq4vd5nY1cQYG34",
  authDomain: "mostbooked-fb4a8.firebaseapp.com",
  projectId: "mostbooked-fb4a8",
  storageBucket: "mostbooked-fb4a8.firebasestorage.app",
  messagingSenderId: "584552068588",
  appId: "1:584552068588:web:26a3f7635bce195e9f7cc9",
  measurementId: "G-6XQ90LFJ4R"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});
export default app;
