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
  const { setUser, setLoading } = useAuthStore.getState();

  if (firebaseUser) {
    try {

      const result = await getCurrentUserWithToken();

      setUser(result?.firebaseUser || firebaseUser, result?.mongoUser || null);

      // 🔥 ONLY reload once after login
      const justLoggedIn = sessionStorage.getItem("justLoggedIn");
      if (justLoggedIn) {
        sessionStorage.removeItem("justLoggedIn");
        window.location.href = "/overview";
        return;
      }

    } catch (error) {
      setUser(firebaseUser, null);
    } finally {
      setLoading(false);
    }
  } else {
    setUser(null, null);
    setLoading(false);
  }
});

export default useAuthStore;