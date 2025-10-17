// userStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useUserStore = create(
  persist(
    (set, get) => ({
      user: null,
      userStats: null,
      dashboardData: null,
      isLoading: false,
      
      // Actions
      setUser: (userData) => set({ user: userData }),
      setUserStats: (stats) => set({ userStats: stats }),
      setDashboardData: (data) => set({ dashboardData: data }),
      setLoading: (loading) => set({ isLoading: loading }),
      
      // Fetch user data from backend
      fetchUserData: async () => {
        set({ isLoading: true });
        try {
          const token = localStorage.getItem('token');
          const response = await fetch('http://localhost:3001/api/v1/users/me', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (!response.ok) {
            throw new Error('Failed to fetch user data');
          }
          
          const userData = await response.json();
          set({ user: userData, isLoading: false });
          return userData;
        } catch (error) {
          console.error('Error fetching user data:', error);
          set({ isLoading: false });
          throw error;
        }
      },
      
      // Fetch dashboard data
      fetchDashboardData: async () => {
        set({ isLoading: true });
        try {
          const token = localStorage.getItem('token');
          const response = await fetch('http://localhost:3001/api/v1/dashboard', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (!response.ok) {
            throw new Error('Failed to fetch dashboard data');
          }
          
          const dashboardData = await response.json();
          set({ dashboardData, isLoading: false });
          return dashboardData;
        } catch (error) {
          console.error('Error fetching dashboard data:', error);
          set({ isLoading: false });
          throw error;
        }
      },
      
      // Fetch user stats
      fetchUserStats: async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch('http://localhost:3001/api/v1/users/stats', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (!response.ok) {
            throw new Error('Failed to fetch user stats');
          }
          
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