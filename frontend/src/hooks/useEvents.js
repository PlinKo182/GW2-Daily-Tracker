// hooks/useEvents.js
import { useMemo } from 'react';
import { generateEvents } from '../utils/mockData';

export const useEvents = (mockData, currentTime) => {
  const eventsData = useMemo(() => {
    return generateEvents().filter(event => {
      return event.startTime <= currentTime + 2 * 60 * 60 * 1000;
    });
  }, [currentTime]);

  const allEvents = useMemo(() => generateEvents(), []);

  return { eventsData, allEvents };
};