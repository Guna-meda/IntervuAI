import { create } from "zustand";
import { auth } from "../firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { getCurrentUserWithToken } from "./auth";

const useAuthStore = create((set) => ({
  user: null,
  mongoUser: null,
  loading: true,
  setUser: (firebaseUser, mongoUser) => {
    console.log("AuthStore - Setting user:", firebaseUser?.email);
    console.log("AuthStore - Setting MongoDB user:", mongoUser);
    set({ user: firebaseUser, mongoUser, loading: false });
  },
  setLoading: (loading) => set({ loading }),
}));

// Initialize auth state for returning users
onAuthStateChanged(auth, async (firebaseUser) => {
  console.log("AuthStateChanged - User:", firebaseUser?.email);
  if (firebaseUser) {
    // Fetch MongoDB user data for returning user
    const result = await getCurrentUserWithToken();
    if (result) {
      useAuthStore.getState().setUser(result.firebaseUser, result.mongoUser);
    } else {
      useAuthStore.getState().setUser(null, null);
    }
  } else {
    useAuthStore.getState().setUser(null, null);
  }
});

export default useAuthStore;