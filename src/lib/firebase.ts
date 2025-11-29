import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

// Replace with your Firebase config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "YOUR_STORAGE_BUCKET",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "YOUR_SENDER_ID",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "YOUR_APP_ID",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "YOUR_DATABASE_URL",
};

// Basic validation for database URL to give a helpful error early
const dbUrl = firebaseConfig.databaseURL;
if (!dbUrl || dbUrl.startsWith("YOUR_") || !/^https?:\/\/.+\.(firebaseio|firebasedatabase)\.com\/?$/.test(dbUrl)) {
  // Throw a clear error so developer can fix .env values
  throw new Error(
    `FIREBASE FATAL ERROR: Cannot parse Firebase url. Please set VITE_FIREBASE_DATABASE_URL in .env.local to your Realtime Database URL, e.g. https://<your-project>.firebaseio.com or https://<your-project>-default-rtdb.firebaseio.com`
  );
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get database reference
export const database = getDatabase(app);

// Get auth reference
export const auth = getAuth(app);

export default app;
