import { create } from "zustand";
import { auth } from "../firebase/config";
import { onAuthStateChanged } from "firebase/auth";

const useAuthStore = create((set) => ({
  user: null,
  loading: true,
  setUser: (user) => {
    console.log("AuthStore - Setting user:", user?.email);
    set({ user, loading: false });
  },
  setLoading: (loading) => set({ loading }),
}));

// This runs once when the store is created
onAuthStateChanged(auth, (user) => {
  console.log("AuthStateChanged - User:", user?.email);
  useAuthStore.getState().setUser(user);
});

export default useAuthStore;