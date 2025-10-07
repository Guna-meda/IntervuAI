import {
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  getAuth,
} from "firebase/auth";
import { auth, provider } from "./config";

export const loginWithGoogle = async () => {
  try {
    console.log("Starting Google popup...");
    const result = await signInWithPopup(auth, provider);

    // Get Firebase ID token
    const idToken = await result.user.getIdToken();

    // Send token and user data to backend
  // Make sure this points to the backend server and correct route
  const response = await fetch("http://localhost:3001/api/v1/users/createOrFetchUser", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to create/fetch user in MongoDB");
    }

    // Receive MongoDB user data
    const mongoUser = await response.json();
    return { firebaseUser: result.user, mongoUser };
  } catch (error) {
    console.error("Popup or MongoDB error:", error);
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

export const getCurrentUserWithToken = async () => {
  try {
    const currentUser = getAuth().currentUser;
    if (!currentUser) {
      console.log("No current user found");
      return null;
    }

    // Get fresh ID token (forces refresh if expired)
    const idToken = await currentUser.getIdToken(true);

    // Fetch MongoDB user data
  const response = await fetch("http://localhost:3001/api/v1/users/createOrFetchUser", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch MongoDB user data");
    }

    const mongoUser = await response.json();
    console.log("MongoDB user for current user:", mongoUser);
    return { firebaseUser: currentUser, mongoUser };
  } catch (error) {
    console.error("Error fetching current user or MongoDB data:", error);
    return null;
  }
};