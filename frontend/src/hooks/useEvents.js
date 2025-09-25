import { useState, useEffect, useMemo } from 'react';
import { convertUTCTimeToLocal } from '../utils/timeUtils';
import { eventsData } from '../utils/eventsData';

export const useEvents = (_, currentTime) => {
  const [allEvents, setAllEvents] = useState([]);

  useEffect(() => {
    const loadAllEvents = () => {
      const events = [];
      const now = new Date();

      Object.entries(eventsData).forEach(([category, subcategories]) => {
        Object.entries(subcategories).forEach(([subcategory, eventTypes]) => {
          Object.entries(eventTypes).forEach(([eventName, eventData]) => {
            const eventKey = `${category}_${subcategory}_${eventName}`.replace(/\s+/g, '_').toLowerCase().replace(/[^\w]/g, '_');
            
            // Skip if no UTC times or duration
            if (!eventData.utc_times || !eventData.duration_minutes) {
              return;
            }

            eventData.utc_times.forEach(utcTimeStr => {
              const eventTime = convertUTCTimeToLocal(utcTimeStr);
              
              for (let dayOffset = 0; dayOffset <= 1; dayOffset++) {
                const adjustedEventTime = new Date(eventTime);
                adjustedEventTime.setDate(adjustedEventTime.getDate() + dayOffset);
                
                const endTime = new Date(adjustedEventTime.getTime() + eventData.duration_minutes * 60000);
                
                if (endTime > now) {
                  // Convert rewards to consistent format
                  const rewards = processRewards(eventData.rewards);
                  
                  events.push({
                    id: `${eventKey}_${utcTimeStr}_${dayOffset}`,
                    eventKey: eventKey,
                    name: eventName,
                    location: subcategory,
                    waypoint: eventData.waypoint || '',
                    startTime: new Date(adjustedEventTime),
                    endTime: endTime,
                    duration: eventData.duration_minutes,
                    rewards: rewards
                  });
                }
              }
            });
          });
        });
      });

      events.sort((a, b) => a.startTime - b.startTime);
      setAllEvents(events);
    };

    loadAllEvents();
  }, []);

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

// Helper function to process rewards into consistent format
const processRewards = (rawRewards) => {
  if (!rawRewards) return [];
  
  const rewards = [];
  
  // Handle item reward
  if (rawRewards.item && rawRewards.item.name) {
    rewards.push({
      type: 'item',
      name: rawRewards.item.name,
      link: rawRewards.item.link || '',
      itemId: rawRewards.item.itemId || null
    });
  }
  
  // Handle currency reward
  if (rawRewards.currency && rawRewards.currency.amount) {
    rewards.push({
      type: 'currency',
      amount: rawRewards.currency.amount,
      currency: rawRewards.currency.type === 'mystic_coin' ? 'mystic' : rawRewards.currency.type
    });
  }
  
  return rewards;
};