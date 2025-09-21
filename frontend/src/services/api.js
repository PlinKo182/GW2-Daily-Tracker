import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// User session management
const getUserId = () => {
  let userId = localStorage.getItem('tyriaTracker_userId');
  if (!userId) {
    userId = generateUUID();
    localStorage.setItem('tyriaTracker_userId', userId);
  }
  return userId;
};

const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Simple API service class (localStorage only)
class TyriaTrackerAPI {
  constructor() {
    this.userId = getUserId();
  }

  // Health check endpoint
  async healthCheck() {
    try {
      const response = await axios.get(`${API}/`);
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error);
      return null;
    }
  }

  // All data operations use localStorage
  async getProgress() {
    return Promise.resolve(localStorageAPI.getProgress());
  }

  async updateProgress(dailyProgress) {
    localStorageAPI.saveProgress(dailyProgress);
    return Promise.resolve({ dailyProgress });
  }

  async getEvents() {
    return Promise.resolve(localStorageAPI.getEvents());
  }

  async updateEvents(completedEvents, completedEventTypes) {
    localStorageAPI.saveEvents(completedEvents, completedEventTypes);
    return Promise.resolve({ completedEvents, completedEventTypes });
  }
}

// Local storage API - now the primary data layer
export const localStorageAPI = {
  getProgress: () => {
    const saved = localStorage.getItem('tyriaTracker_dailyProgress');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // If it's already in the correct format, return it
        if (parsed.gathering) {
          return { dailyProgress: parsed };
        }
        // If it has dailyProgress wrapper, return as is
        if (parsed.dailyProgress) {
          return parsed;
        }
      } catch (e) {
        console.error('Error parsing saved progress:', e);
      }
    }
    
    // Return default structure
    return {
      dailyProgress: {
        gathering: {
          vine_bridge: false,
          prosperity: false,
          destinys_gorge: false
        },
        crafting: {
          mithrillium: false,
          elonian_cord: false,
          spirit_residue: false,
          gossamer: false
        },
        specials: {
          psna: false,
          home_instance: false
        }
      }
    };
  },

  saveProgress: (progress) => {
    localStorage.setItem('tyriaTracker_dailyProgress', JSON.stringify(progress));
  },

  getEvents: () => {
    const savedEvents = localStorage.getItem('tyriaTracker_completedEvents');
    const savedEventTypes = localStorage.getItem('tyriaTracker_completedEventTypes');
    
    return {
      completedEvents: savedEvents ? JSON.parse(savedEvents) : {},
      completedEventTypes: savedEventTypes ? JSON.parse(savedEventTypes) : {}
    };
  },

  saveEvents: (completedEvents, completedEventTypes) => {
    localStorage.setItem('tyriaTracker_completedEvents', JSON.stringify(completedEvents));
    localStorage.setItem('tyriaTracker_completedEventTypes', JSON.stringify(completedEventTypes));
  },

  // Clear all data (for daily reset)
  clearAll: () => {
    localStorage.removeItem('tyriaTracker_dailyProgress');
    localStorage.removeItem('tyriaTracker_completedEvents');
    localStorage.removeItem('tyriaTracker_completedEventTypes');
  }
};

// Export singleton instance
export const api = new TyriaTrackerAPI();
export default api;