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
      ],
      skills: [],
      // Actions
      setCurrentInterviewId: (id) => set({ currentInterviewId: id }),
  clearInterviewData: () => set({ currentInterviewId: null }),
      setMediaSettings: (settings) =>
        set((state) => ({
          mediaSettings: { ...state.mediaSettings, ...settings },
        })),
        setSkills: (skills) => set({ skills }),
        
    }),
    {
      name: 'user-interview-store',
      storage: createJSONStorage(() => localStorage), // Explicitly specify localStorage
    }
  )
);