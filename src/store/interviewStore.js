// stores/userInterviewStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useUserInterviewStore = create(
  persist(
    (set, get) => ({
      // UI state only
      currentInterviewId: null,
      mediaSettings: {
        video: true,
        audio: true,
        videoDeviceId: null,
        audioDeviceId: null
      },
      
      // Cache for interviews (optional, for quick access)
      interviewsCache: new Map(),
      
      // Available roles (static data)
      availableRoles: [
        { value: 'frontend', label: 'Frontend Developer', icon: '🎨' },
        { value: 'backend', label: 'Backend Developer', icon: '⚙️' },
        { value: 'fullstack', label: 'Full Stack Developer', icon: '🔧' },
        { value: 'app', label: 'App Developer', icon: '📱' }
      ],
      
      // Actions
      setCurrentInterviewId: (interviewId) => set({ currentInterviewId: interviewId }),

  setCurrentInterviewId: (id) => set({ currentInterviewId: id }),
  cacheInterview: (interview) => set((state) => {
    const newCache = new Map(state.interviewsCache); // Create a new Map to ensure immutability
    newCache.set(interview.interviewId, interview);
    return { interviewsCache: newCache };
  }),
  getCachedInterview: (interviewId) => get().interviewsCache.get(interviewId),

      setMediaSettings: (settings) => set((state) => ({
        mediaSettings: { ...state.mediaSettings, ...settings }
      })),
      
      // Cache management (optional)
      cacheInterview: (interview) => {
        const { interviewsCache } = get();
        interviewsCache.set(interview.interviewId, interview);
        set({ interviewsCache: new Map(interviewsCache) });
      },
      
      getCachedInterview: (interviewId) => {
        return get().interviewsCache.get(interviewId);
      },
      
      clearCache: () => set({ interviewsCache: new Map() })
    }),
    {
      name: 'user-interview-store',
    }
  )
);