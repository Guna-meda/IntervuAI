// stores/userStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useUserStore = create(
  persist(
    (set, get) => ({
      user: null,
      userStats: null,
      isLoading: false,
      
      // Actions
      setUser: (userData) => set({ user: userData }),
      setUserStats: (stats) => set({ userStats: stats }),
      setLoading: (loading) => set({ isLoading: loading }),
      
      // Fetch user data from backend
      fetchUserData: async () => {
        set({ isLoading: true });
        try {
          const response = await fetch('http://localhost:3001/api/v1/users/me');
          const userData = await response.json();
          set({ user: userData, isLoading: false });
          return userData;
        } catch (error) {
          console.error('Error fetching user data:', error);
          set({ isLoading: false });
          throw error;
        }
      },
      
      // Fetch user stats
      fetchUserStats: async () => {
        try {
          const response = await fetch('http://localhost:3001/api/v1/users/stats');
          const stats = await response.json();
          set({ userStats: stats });
          return stats;
        } catch (error) {
          console.error('Error fetching user stats:', error);
          throw error;
        }
      }
    }),
    {
      name: 'user-store',
    }
  )
);