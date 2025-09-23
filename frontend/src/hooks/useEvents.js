import { useState, useEffect, useMemo } from 'react';
import { convertUTCTimeToLocal } from '../utils/timeUtils';

export const useEvents = (mockData, currentTime) => {
  const [allEvents, setAllEvents] = useState([]);

  // Carregar todos os eventos
  useEffect(() => {
    const loadAllEvents = () => {
      const events = [];
      const now = new Date();

      Object.entries(mockData.eventConfig.events).forEach(([key, event]) => {
        if (event.locations) {
          event.locations.forEach(location => {
            location.utc_times.forEach(utcTimeStr => {
              const eventTime = convertUTCTimeToLocal(utcTimeStr);
              let endTime = new Date(eventTime.getTime() + event.duration_minutes * 60000);

              if (endTime < now) {
                eventTime.setDate(eventTime.getDate() + 1);
                endTime = new Date(eventTime.getTime() + event.duration_minutes * 60000);
              }

              events.push({
                id: `${key}_${location.map}`,
                eventKey: key,
                name: event.event_name,
                location: location.map,
                waypoint: location.waypoint,
                startTime: eventTime,
                endTime: endTime,
                duration: event.duration_minutes,
                reward: location.reward || event.reward
              });
            });
          });
        } else {
          event.utc_times.forEach(utcTimeStr => {
            const eventTime = convertUTCTimeToLocal(utcTimeStr);
            let endTime = new Date(eventTime.getTime() + event.duration_minutes * 60000);

            if (endTime < now) {
              eventTime.setDate(eventTime.getDate() + 1);
              endTime = new Date(eventTime.getTime() + event.duration_minutes * 60000);
            }

            events.push({
              id: key,
              eventKey: key,
              name: event.event_name,
              location: event.location,
              waypoint: event.waypoint,
              startTime: eventTime,
              endTime: endTime,
              duration: event.duration_minutes,
              reward: event.reward
            });
          });
        }
      });

      events.sort((a, b) => a.startTime - b.startTime);
      setAllEvents(events);
    };

    loadAllEvents();
  }, [mockData]);

  // Filtrar eventos visíveis
  const eventsData = useMemo(() => {
    const now = currentTime;
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    
    return allEvents.filter(event => {
      if (event.endTime <= now) {
        return false;
      }
      
      return event.startTime <= twoHoursFromNow;
    });
  }, [allEvents, currentTime]);

  return { allEvents, eventsData };
};