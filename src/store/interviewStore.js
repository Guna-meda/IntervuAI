// stores/userInterviewStore.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useUserInterviewStore = create(
  persist(
    (set) => ({
      // UI state
      currentInterviewId: null,
      mediaSettings: {
        video: true,
        audio: true,
        videoDeviceId: null,
        audioDeviceId: null,
      },
      // Available roles (static data)
      availableRoles: [
        { value: 'frontend', label: 'Frontend Developer', icon: '🎨' },
        { value: 'backend', label: 'Backend Developer', icon: '⚙️' },
        { value: 'fullstack', label: 'Full Stack Developer', icon: '🔧' },
        { value: 'app', label: 'App Developer', icon: '📱' },
      ],
      // Actions
      setCurrentInterviewId: (id) => set({ currentInterviewId: id }),
      resetInterview: () => set({ currentInterviewId: null }),
      setMediaSettings: (settings) =>
        set((state) => ({
          mediaSettings: { ...state.mediaSettings, ...settings },
        })),
    }),
    {
      name: 'user-interview-store',
      storage: createJSONStorage(() => localStorage), // Explicitly specify localStorage
    }
  )
);