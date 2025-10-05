import {
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth, provider } from "./config";

// Note: Removed handleRedirectResult since it's not needed for popup
// Removed loginWithGoogle redirect version

export const loginWithGoogle = async () => {
  try {
    console.log("Starting Google popup...");
    const result = await signInWithPopup(auth, provider);
    console.log("Popup result:", result);
    return result;
  } catch (error) {
    console.error("Popup error:", error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
    console.log("Logout successful");
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
};