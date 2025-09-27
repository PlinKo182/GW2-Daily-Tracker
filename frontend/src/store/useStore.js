import { create } from 'zustand';
import { localStorageAPI } from '../services/api';

const defaultProgress = {
  gathering: { vine_bridge: false, prosperity: false, destinys_gorge: false },
  crafting: { mithrillium: false, elonian_cord: false, spirit_residue: false, gossamer: false },
  specials: { psna: false, home_instance: false },
};

const useStore = create((set, get) => ({
  // --- STATE ---
  profiles: [],
  activeProfile: null,
  profileData: {},
  notification: null,
  lastResetDate: 0,

  // --- ACTIONS ---

  // Helper to save the entire state to localStorage
  _saveState: () => {
    const { profiles, activeProfile, profileData, lastResetDate } = get();
    localStorageAPI.saveAppData({ profiles, activeProfile, profileData, lastResetDate });
  },

  // Load initial data from localStorage
  loadInitialData: () => {
    const appData = localStorageAPI.getAppData();
    set(appData);
  },

  // Add a new profile
  addProfile: (profileName) => {
    if (!profileName || get().profiles.includes(profileName)) {
      get().setNotification({ type: 'error', message: 'Profile name already exists or is invalid.' });
      setTimeout(() => get().setNotification(null), 4000);
      return;
    }
    set((state) => ({
      profiles: [...state.profiles, profileName],
      profileData: {
        ...state.profileData,
        [profileName]: {
          dailyProgress: defaultProgress,
          completedEventTypes: {},
        },
      },
    }));
    get().switchProfile(profileName); // Switch to the new profile
    get()._saveState();
  },

  // Switch the active profile
  switchProfile: (profileName) => {
    if (get().profiles.includes(profileName)) {
      set({ activeProfile: profileName });
      get()._saveState();
    }
  },

  // Delete a profile
  deleteProfile: (profileName) => {
    if (get().profiles.length <= 1) {
      get().setNotification({ type: 'error', message: 'Cannot delete the last profile.' });
      setTimeout(() => get().setNotification(null), 4000);
      return;
    }
    set((state) => {
      const newProfiles = state.profiles.filter(p => p !== profileName);
      const newProfileData = { ...state.profileData };
      delete newProfileData[profileName];

      return {
        profiles: newProfiles,
        profileData: newProfileData,
        // If deleting the active profile, switch to the first available one
        activeProfile: state.activeProfile === profileName ? newProfiles[0] : state.activeProfile,
      };
    });
    get()._saveState();
  },

  // Update task progress for the active profile
  handleTaskToggle: (category, task) => {
    const { activeProfile } = get();
    if (!activeProfile) return;

    set((state) => {
      const newProfileData = { ...state.profileData };
      const currentProfileTasks = newProfileData[activeProfile].dailyProgress;
      newProfileData[activeProfile].dailyProgress = {
        ...currentProfileTasks,
        [category]: {
          ...currentProfileTasks[category],
          [task]: !currentProfileTasks[category][task],
        },
      };
      return { profileData: newProfileData };
    });
    get()._saveState();
  },

  // Update event completion for the active profile
  handleEventToggle: (eventKey) => {
    const { activeProfile } = get();
    if (!activeProfile) return;

    set((state) => {
        const newProfileData = { ...state.profileData };
        const currentEventTypes = newProfileData[activeProfile].completedEventTypes;
        const newCompletedEventTypes = { ...currentEventTypes };

        if (newCompletedEventTypes[eventKey]) {
            delete newCompletedEventTypes[eventKey];
        } else {
            newCompletedEventTypes[eventKey] = true;
        }
        newProfileData[activeProfile].completedEventTypes = newCompletedEventTypes;
        return { profileData: newProfileData };
    });
    get()._saveState();
  },

  setNotification: (notification) => set({ notification }),

  // Reset progress for ALL profiles
  checkAndResetDailyProgress: () => {
    const now = new Date();
    const currentUTCDate = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());

    if (currentUTCDate !== get().lastResetDate) {
      set((state) => {
        const resetProfileData = {};
        state.profiles.forEach(profileName => {
          resetProfileData[profileName] = {
            dailyProgress: defaultProgress,
            completedEventTypes: {},
          };
        });
        return { profileData: resetProfileData, lastResetDate: currentUTCDate };
      });
      get()._saveState();
    }
  },

  // --- SELECTORS ---
  // These selectors derive state for the active profile
  getActiveDailyProgress: () => {
    const { activeProfile, profileData } = get();
    return profileData[activeProfile]?.dailyProgress || defaultProgress;
  },
  getActiveCompletedEventTypes: () => {
    const { activeProfile, profileData } = get();
    return profileData[activeProfile]?.completedEventTypes || {};
  },
}));

// Initialize the store with data from localStorage
useStore.getState().loadInitialData();

export default useStore;