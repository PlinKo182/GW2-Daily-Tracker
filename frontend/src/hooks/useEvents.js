import { useState, useEffect, useMemo } from 'react';
import { convertUTCTimeToLocal } from '../utils/timeUtils';

export const useEvents = (mockData, currentTime) => {
  const [allEvents, setAllEvents] = useState([]);

  useEffect(() => {
    const loadAllEvents = () => {
      const events = [];
      const now = new Date();

      Object.entries(mockData.eventConfig.events).forEach(([key, event]) => {
        if (event.locations) {
          event.locations.forEach(location => {
            location.utc_times.forEach(utcTimeStr => {
              const eventTime = convertUTCTimeToLocal(utcTimeStr);
              
              for (let dayOffset = 0; dayOffset <= 1; dayOffset++) {
                const adjustedEventTime = new Date(eventTime);
                adjustedEventTime.setDate(adjustedEventTime.getDate() + dayOffset);
                
                const endTime = new Date(adjustedEventTime.getTime() + event.duration_minutes * 60000);
                
                if (endTime > now) {
                  // SUPORTE PARA MÚLTIPLAS RECOMPENSAS
                  const rewards = location.rewards || 
                                 (location.reward ? [location.reward] : 
                                 event.rewards || 
                                 (event.reward ? [event.reward] : []));
                  
                  events.push({
                    id: `${key}_${location.map}_${utcTimeStr}_${dayOffset}`,
                    eventKey: key,
                    name: event.event_name,
                    location: location.map,
                    waypoint: location.waypoint,
                    startTime: new Date(adjustedEventTime),
                    endTime: endTime,
                    duration: event.duration_minutes,
                    rewards: rewards // SEMPRE UM ARRAY
                  });
                }
              }
            });
          });
        } else {
          event.utc_times.forEach(utcTimeStr => {
            const eventTime = convertUTCTimeToLocal(utcTimeStr);
            
            for (let dayOffset = 0; dayOffset <= 1; dayOffset++) {
              const adjustedEventTime = new Date(eventTime);
              adjustedEventTime.setDate(adjustedEventTime.getDate() + dayOffset);
              
              const endTime = new Date(adjustedEventTime.getTime() + event.duration_minutes * 60000);
              
              if (endTime > now) {
                // SUPORTE PARA MÚLTIPLAS RECOMPENSAS
                const rewards = event.rewards || (event.reward ? [event.reward] : []);
                
                events.push({
                  id: `${key}_${utcTimeStr}_${dayOffset}`,
                  eventKey: key,
                  name: event.event_name,
                  location: event.location,
                  waypoint: event.waypoint,
                  startTime: new Date(adjustedEventTime),
                  endTime: endTime,
                  duration: event.duration_minutes,
                  rewards: rewards // SEMPRE UM ARRAY
                });
              }
            }
          });
        }
      });

      events.sort((a, b) => a.startTime - b.startTime);
      setAllEvents(events);
    };

    loadAllEvents();
  }, [mockData]);

  const eventsData = useMemo(() => {
    const now = currentTime;
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    
    return allEvents.filter(event => {
      const startsWithinTwoHours = event.startTime <= twoHoursFromNow;
      const isOngoing = event.startTime <= now && event.endTime > now;
      const notEnded = event.endTime > now;
      
      return (startsWithinTwoHours || isOngoing) && notEnded;
    });
  }, [allEvents, currentTime]);

  return { allEvents, eventsData };
};