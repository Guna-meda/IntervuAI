import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
};

console.log("Firebase Config:", {
  apiKey: import.meta.env.VITE_API_KEY ? "✓ Set" : "✗ Missing",
  authDomain: import.meta.env.VITE_AUTH_DOMAIN ? "✓ Set" : "✗ Missing",
  projectId: import.meta.env.VITE_PROJECT_ID ? "✓ Set" : "✗ Missing",
});

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();

// Set custom parameters for Google Auth
provider.setCustomParameters({
  prompt: "select_account",
});