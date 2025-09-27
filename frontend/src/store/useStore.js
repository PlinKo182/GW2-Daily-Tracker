import { create } from 'zustand';
import { localStorageAPI } from '../services/api';

const useStore = create((set) => ({
  // State
  dailyProgress: {
    gathering: { vine_bridge: false, prosperity: false, destinys_gorge: false },
    crafting: { mithrillium: false, elonian_cord: false, spirit_residue: false, gossamer: false },
    specials: { psna: false, home_instance: false },
  },
  completedEventTypes: {},
  userName: localStorage.getItem('tyriaTracker_userName') || 'PlinKo',
  notification: null,

  // Actions
  loadInitialData: () => {
    const savedProgressData = localStorageAPI.getProgress();
    const savedEventsData = localStorageAPI.getEvents();
    if (savedProgressData && savedProgressData.dailyProgress) {
      set({ dailyProgress: savedProgressData.dailyProgress });
    }
    if (savedEventsData && savedEventsData.completedEventTypes) {
      set({ completedEventTypes: savedEventsData.completedEventTypes });
    }
  },

  handleTaskToggle: (category, task) =>
    set((state) => {
      const newProgress = {
        ...state.dailyProgress,
        [category]: {
          ...state.dailyProgress[category],
          [task]: !state.dailyProgress[category][task],
        },
      };
      localStorageAPI.saveProgress(newProgress);
      return { dailyProgress: newProgress };
    }),

  handleEventToggle: (eventKey) =>
    set((state) => {
      const newCompletedEventTypes = { ...state.completedEventTypes };
      if (newCompletedEventTypes[eventKey]) {
        delete newCompletedEventTypes[eventKey];
      } else {
        newCompletedEventTypes[eventKey] = true;
      }
      localStorageAPI.saveEvents({}, newCompletedEventTypes);
      return { completedEventTypes: newCompletedEventTypes };
    }),

  setUserName: (newUserName) => {
    set({ userName: newUserName });
    localStorage.setItem('tyriaTracker_userName', newUserName);
  },

  setNotification: (notification) => set({ notification }),

  checkAndResetDailyProgress: () => {
    const now = new Date();
    const currentUTCDate = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    const lastResetDate = parseInt(localStorage.getItem('lastResetDate') || '0', 10);

    if (currentUTCDate !== lastResetDate) {
      const resetProgress = {
        gathering: { vine_bridge: false, prosperity: false, destinys_gorge: false },
        crafting: { mithrillium: false, elonian_cord: false, spirit_residue: false, gossamer: false },
        specials: { psna: false, home_instance: false },
      };
      set({ dailyProgress: resetProgress, completedEventTypes: {} });
      localStorageAPI.clearAll();
      localStorage.setItem('lastResetDate', currentUTCDate.toString());
    }
  },
}));

export default useStore;