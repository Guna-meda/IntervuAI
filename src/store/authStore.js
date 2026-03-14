import { create } from "zustand";
import { auth } from "../firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { getCurrentUserWithToken } from "../firebase/auth";

const useAuthStore = create((set) => ({
  user: null,
  mongoUser: null,
  loading: true,
  setUser: (firebaseUser, mongoUser) => {
    set({ user: firebaseUser, mongoUser, loading: false });
  },
  setLoading: (loading) => set({ loading }),
}));

// authStore.js - Add debugging
onAuthStateChanged(auth, async (firebaseUser) => {
  console.log('Auth state changed:', firebaseUser ? 'User logged in' : 'User logged out');
  if (firebaseUser) {
    try {
      const result = await getCurrentUserWithToken();
      console.log('Fetched user data:', result);
      if (result) {
        useAuthStore.getState().setUser(result.firebaseUser, result.mongoUser);
      } else {
        useAuthStore.getState().setUser(null, null);
      }
    } catch (error) {
      console.error('Error in auth state change:', error);
      useAuthStore.getState().setUser(null, null);
    }
  } else {
    useAuthStore.getState().setUser(null, null);
  }
});

export default useAuthStore;