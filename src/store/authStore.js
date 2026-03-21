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

onAuthStateChanged(auth, async (firebaseUser) => {
  console.log('Auth state changed:', firebaseUser ? 'User logged in' : 'User logged out');

  const { setUser, setLoading } = useAuthStore.getState();

  if (firebaseUser) {
    try {
      setLoading(true); // 🔥 IMPORTANT

      const result = await getCurrentUserWithToken();

      if (result) {
        setUser(result.firebaseUser, result.mongoUser);
      } else {
        setUser(null, null);
      }
    } catch (error) {
      console.error('Error in auth state change:', error);
      setUser(null, null);
    } finally {
      setLoading(false); // 🔥 only here
    }
  } else {
    setUser(null, null);
    setLoading(false);
  }
});

export default useAuthStore;