import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const APP_DATA_KEY = 'tyriaTracker_appData';

const defaultProgress = {
  gathering: { vine_bridge: false, prosperity: false, destinys_gorge: false },
  crafting: { mithrillium: false, elonian_cord: false, spirit_residue: false, gossamer: false },
  specials: { psna: false, home_instance: false },
};

const initialData = {
  profiles: ['Default'],
  activeProfile: 'Default',
  profileData: {
    Default: {
      dailyProgress: defaultProgress,
      completedEventTypes: {},
    },
  },
};

// User session management (can be deprecated if not used elsewhere)
const getUserId = () => {
  let userId = localStorage.getItem('tyriaTracker_userId');
  if (!userId) {
    userId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    localStorage.setItem('tyriaTracker_userId', userId);
  }
  return userId;
};

// API service class (mostly for backend interaction, not localStorage)
class TyriaTrackerAPI {
  constructor() {
    this.userId = getUserId();
  }

  async healthCheck() {
    try {
      const response = await axios.get(`${API}/`);
      return response.data;
    } catch (error) {
      return null;
    }
  }
}

// New simplified localStorage API for multi-profile support
export const localStorageAPI = {
  getAppData: () => {
    const saved = localStorage.getItem(APP_DATA_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Basic validation to ensure it has the expected structure
        if (parsed.profiles && parsed.activeProfile && parsed.profileData) {
          return parsed;
        }
      } catch (e) {
        console.error("Failed to parse app data from localStorage", e);
        return initialData; // Return default on error
      }
    }
    return initialData; // Return default if nothing is saved
  },

  saveAppData: (data) => {
    try {
      const stringifiedData = JSON.stringify(data);
      localStorage.setItem(APP_DATA_KEY, stringifiedData);
    } catch (e) {
      console.error("Failed to save app data to localStorage", e);
    }
  },
};

// Export singleton instance
export const api = new TyriaTrackerAPI();
export default api;