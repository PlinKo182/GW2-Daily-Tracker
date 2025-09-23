// components/EventsSection.jsx
import React, { useState, useMemo, useCallback } from 'react';
import { Eye, EyeOff, Undo, Calendar } from 'lucide-react';
import { mockData } from '../../utils/mockData';
import { useCurrentTime } from '../../hooks/useCurrentTime';
import { useEvents } from '../../hooks/useEvents';
import { useItemPrices } from '../../hooks/useItemPrices';
import EventCard from './EventCard';
import CompletedEventTypeCard from './CompletedEventTypeCard';

const EventsSection = ({ completedEvents, completedEventTypes, onEventToggle }) => {
  const [showCompleted, setShowCompleted] = useState(false);
  const currentTime = useCurrentTime();
  const { allEvents, eventsData } = useEvents(mockData, currentTime);
  const itemPrices = useItemPrices(allEvents);

  const filteredEvents = useMemo(() => {
    return eventsData.filter(event => {
      const isManuallyCompleted = completedEventTypes[event.eventKey] || completedEvents[event.id];
      return !isManuallyCompleted;
    });
  }, [eventsData, completedEvents, completedEventTypes]);

  const completedEventsByType = useMemo(() => {
    const eventsByType = {};
    
    allEvents.forEach(event => {
      const isManuallyCompleted = completedEventTypes[event.eventKey] || completedEvents[event.id];
      
      if (isManuallyCompleted) {
        if (!eventsByType[event.eventKey]) {
          eventsByType[event.eventKey] = {
            eventKey: event.eventKey,
            name: event.name,
            instances: []
          };
        }
        
        eventsByType[event.eventKey].instances.push(event);
      }
    });
    
    return Object.values(eventsByType);
  }, [allEvents, completedEvents, completedEventTypes]);

  const handleEventToggle = useCallback((eventId, eventKey) => {
    onEventToggle(eventId, eventKey);
  }, [onEventToggle]);

  const activeEventsCount = filteredEvents.filter(event => 
    currentTime >= event.startTime && currentTime <= event.endTime
  ).length;

  const upcomingEventsCount = filteredEvents.filter(event => 
    currentTime < event.startTime
  ).length;

  return (
    <div className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <Calendar className="w-8 h-8 text-emerald-400" />
        <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          Events & World Bosses
        </h2>
      </div>

      <div className="mb-8 p-6 bg-gray-800 rounded-xl border border-gray-700">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="text-sm text-gray-400 italic mb-2">
              Showing events within the next 2 hours
            </div>
            <div className="flex gap-4 text-sm">
              <span className="text-emerald-400">● {activeEventsCount} Active</span>
              <span className="text-amber-400">● {upcomingEventsCount} Upcoming</span>
              <span className="text-gray-400">● {completedEventsByType.length} Completed</span>
            </div>
          </div>
          
          {completedEventsByType.length > 0 && (
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-gray-300 px-4 py-2 rounded-lg transition-colors"
            >
              {showCompleted ? (
                <>
                  <EyeOff className="w-4 h-4" />
                  Hide Completed
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  Show Completed ({completedEventsByType.length})
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map(event => (
            <EventCard 
              key={event.id} 
              event={event} 
              isCompleted={false}
              onToggle={handleEventToggle}
              itemPrices={itemPrices}
              currentTime={currentTime}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-800 rounded-xl border border-gray-700">
          <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-400 mb-2">No events scheduled</h3>
          <p className="text-gray-500">Check back later for upcoming events in the next 2 hours.</p>
        </div>
      )}

      {showCompleted && completedEventsByType.length > 0 && (
        <div className="mt-12 pt-8 border-t border-gray-700">
          <div className="flex items-center gap-3 mb-6">
            <h3 className="text-2xl font-bold text-emerald-400">Completed Events</h3>
            <button
              onClick={() => setShowCompleted(false)}
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-300 transition-colors"
            >
              <Undo className="w-4 h-4" />
              Hide
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedEventsByType.map(eventType => (
              <CompletedEventTypeCard 
                key={eventType.eventKey} 
                eventType={eventType}
                onToggle={handleEventToggle}
                itemPrices={itemPrices}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(EventsSection);