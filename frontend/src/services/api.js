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

// API service class
class TyriaTrackerAPI {
  constructor() {
    this.userId = getUserId();
  }

  // Progress endpoints
  async getProgress() {
    try {
      const response = await axios.get(`${API}/progress/${this.userId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch progress:', error);
      throw error;
    }
  }

  async updateProgress(dailyProgress) {
    try {
      const response = await axios.put(`${API}/progress/${this.userId}`, {
        dailyProgress
      });
      return response.data;
    } catch (error) {
      console.error('Failed to update progress:', error);
      throw error;
    }
  }

  // Events endpoints
  async getEvents() {
    try {
      const response = await axios.get(`${API}/events/${this.userId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch events:', error);
      throw error;
    }
  }

  async updateEvents(completedEvents, completedEventTypes) {
    try {
      const response = await axios.put(`${API}/events/${this.userId}`, {
        completedEvents,
        completedEventTypes
      });
      return response.data;
    } catch (error) {
      console.error('Failed to update events:', error);
      throw error;
    }
  }

  // Health check
  async healthCheck() {
    try {
      const response = await axios.get(`${API}/`);
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error);
      return null;
    }
  }
}

// Local storage fallback functions
export const localStorageAPI = {
  getProgress: () => {
    const saved = localStorage.getItem('tyriaTracker_dailyProgress');
    return saved ? JSON.parse(saved) : null;
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
  }
};

// Export singleton instance
export const api = new TyriaTrackerAPI();
export default api;