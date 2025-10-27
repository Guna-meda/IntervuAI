// userStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getAnalytics, getUserInterviews } from '../services/interviewService';

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
      
      // Fetch dashboard data using existing endpoints
      fetchDashboardData: async () => {
        set({ isLoading: true });
        try {
          const analytics = await getAnalytics();
          const recentResponse = await getUserInterviews({ limit: 5, status: 'completed' });
          const recentInterviews = recentResponse.interviews || []; // Assuming response structure { interviews: [...] }

          const completedInterviews = analytics.overview?.completedSessions || 0;
          let currentLevel = 1;
          if (completedInterviews >= 75) currentLevel = 5;
          else if (completedInterviews >= 50) currentLevel = 4;
          else if (completedInterviews >= 20) currentLevel = 3;
          else if (completedInterviews >= 5) currentLevel = 2;

          const userLevel = { currentLevel, completedInterviews };

          const readinessScore = Math.round(analytics.overview?.averageScore * 10) || 0; // Assuming averageScore is 0-10

          const badges = []; // Can be expanded if badges are added to backend

          const stats = {
            totalInterviews: analytics.overview?.totalSessions || 0,
            averageScore: analytics.overview?.averageScore || 0,
            completionRate: analytics.overview?.totalSessions > 0 
              ? Math.round((analytics.overview.completedSessions / analytics.overview.totalSessions) * 100) 
              : 0,
            currentStreak: analytics.overview?.currentStreak || 0,
          };

          const dashboardData = {
            userLevel,
            recentInterviews,
            readinessScore,
            badges,
            stats
          };

          set({ dashboardData });
          return dashboardData;
        } catch (error) {
          console.error('Error fetching dashboard data:', error);
          throw error;
        } finally {
          set({ isLoading: false });
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