import React, { useState, useEffect } from 'react';
import { Clock, MapPin, RefreshCw } from 'lucide-react';
import { mockData } from '../utils/mockData';

const EventsSection = ({ completedEvents, completedEventTypes, onEventToggle, currentTime }) => {
  const [eventsData, setEventsData] = useState([]);
  const [currentFilter, setCurrentFilter] = useState('upcoming');

  useEffect(() => {
    processEventsData();
  }, [currentTime, completedEvents, completedEventTypes]);

  const processEventsData = () => {
    const events = [];
    const now = new Date();

    Object.entries(mockData.eventConfig.events).forEach(([key, event]) => {
      // Skip if event type is completed for special events
      if (key === "lla" && completedEventTypes["lla"]) {
        return;
      }

      if (event.locations) {
        // Multi-location events (like Ley-Line Anomaly)
        event.locations.forEach(location => {
          location.utc_times.forEach(utcTimeStr => {
            const eventTime = convertUTCTimeToLocal(utcTimeStr);
            const endTime = new Date(eventTime.getTime() + event.duration_minutes * 60000);

            if (endTime < now) {
              eventTime.setDate(eventTime.getDate() + 1);
              endTime.setDate(endTime.getDate() + 1);
            }

            if (completedEventTypes[key]) return;

            events.push({
              id: `${key}_${location.map}`,
              eventKey: key,
              name: event.event_name,
              location: location.map,
              waypoint: location.waypoint,
              startTime: eventTime,
              endTime: endTime,
              duration: event.duration_minutes
            });
          });
        });
      } else {
        // Single location events
        event.utc_times.forEach(utcTimeStr => {
          const eventTime = convertUTCTimeToLocal(utcTimeStr);
          const endTime = new Date(eventTime.getTime() + event.duration_minutes * 60000);

          if (endTime < now) {
            eventTime.setDate(eventTime.getDate() + 1);
            endTime.setDate(endTime.getDate() + 1);
          }

          if (completedEventTypes[key]) return;

          events.push({
            id: key,
            eventKey: key,
            name: event.event_name,
            location: event.location,
            waypoint: event.waypoint,
            startTime: eventTime,
            endTime: endTime,
            duration: event.duration_minutes
          });
        });
      }
    });

    events.sort((a, b) => a.startTime - b.startTime);
    setEventsData(events);
  };

  const convertUTCTimeToLocal = (utcTimeString) => {
    const now = new Date();
    const [hours, minutes] = utcTimeString.split(':').map(Number);
    
    const utcDate = new Date(Date.UTC(
      now.getUTCFullYear(), 
      now.getUTCMonth(), 
      now.getUTCDate(), 
      hours, 
      minutes
    ));
    
    return new Date(utcDate);
  };

  const getTimeRemaining = (endTime) => {
    const difference = endTime - currentTime;
    
    if (difference <= 0) {
      return { total: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    
    const hours = Math.floor(difference / (1000 * 60 * 60));
    const minutes = Math.floor((difference / 1000 / 60) % 60);
    const seconds = Math.floor((difference / 1000) % 60);
    
    return { total: difference, hours, minutes, seconds };
  };

  const formatTimeRemaining = (timeObj) => {
    return `${timeObj.hours.toString().padStart(2, '0')}:${timeObj.minutes.toString().padStart(2, '0')}:${timeObj.seconds.toString().padStart(2, '0')}`;
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text.trim()).catch(() => {
      const textArea = document.createElement('textarea');
      textArea.value = text.trim();
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    });
  };

  const getFilteredEvents = () => {
    const now = new Date();
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    return eventsData.filter(event => {
      const isCompleted = completedEvents[event.id] || completedEventTypes[event.eventKey];
      
      switch (currentFilter) {
        case 'completed':
          return isCompleted;
        case 'upcoming':
          return event.startTime <= twoHoursFromNow;
        case 'all':
        default:
          return true;
      }
    });
  };

  const EventCard = ({ event }) => {
    const now = new Date();
    const timeRemaining = getTimeRemaining(event.startTime);
    const eventActive = event.startTime <= now && event.endTime >= now;
    const eventUpcoming = event.startTime > now;
    const isCompleted = completedEvents[event.id] || completedEventTypes[event.eventKey];

    let statusClass = '';
    let statusText = '';
    let countdownText = '';

    if (eventActive) {
      statusClass = 'bg-emerald-500/20 text-emerald-300';
      statusText = 'Active';
      const remaining = getTimeRemaining(event.endTime);
      countdownText = `Ends in: ${formatTimeRemaining(remaining)}`;
    } else if (eventUpcoming) {
      statusClass = 'bg-amber-500/20 text-amber-300';
      statusText = 'Upcoming';
      countdownText = `Starts in: ${formatTimeRemaining(timeRemaining)}`;
    } else {
      statusClass = 'bg-gray-500/20 text-gray-300';
      statusText = 'Completed';
      countdownText = 'Event completed';
    }

    return (
  <div className={`bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-700 flex flex-col relative hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${isCompleted ? 'opacity-70 border-l-4 border-l-emerald-400' : ''}`}>
        {isCompleted && (
          <div className="absolute top-3 left-3 bg-emerald-400 text-gray-900 px-2 py-1 rounded-full text-xs font-bold">
            Completed
          </div>
        )}
        
        <input
          type="checkbox"
          checked={isCompleted}
          onChange={() => onEventToggle(event.id, event.eventKey)}
          className="absolute top-3 right-3 rounded bg-gray-700 border-gray-600 text-emerald-400 focus:ring-emerald-400/50"
        />

        <div className="p-6 flex-grow pt-12">
          <h3 className="text-xl font-bold text-emerald-400 mb-2">{event.name}</h3>
          <div className="flex items-center gap-1 text-sm text-gray-400 mb-4">
            <MapPin className="w-4 h-4" />
            {event.location}
          </div>
          
          <div className={`font-mono mb-4 flex items-center gap-2 ${eventActive ? 'text-emerald-300 animate-pulse' : eventUpcoming ? 'text-amber-300' : 'text-gray-400'}`}>
            <Clock className="w-4 h-4" />
            {countdownText}
          </div>
          
          <div className="text-xs text-gray-400 mb-2">
            {formatTime(event.startTime)} - {formatTime(event.endTime)}
          </div>
        </div>
        
        <div className="px-6 pb-4">
          <div className="flex justify-between items-center">
            <button
              onClick={() => copyToClipboard(event.waypoint)}
              className="text-emerald-400 hover:underline text-sm font-mono hover:bg-gray-700 px-2 py-1 rounded transition-colors"
              title="Click to copy waypoint"
            >
              {event.waypoint}
            </button>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${statusClass}`}>
              {statusText}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const filteredEvents = getFilteredEvents();

  return (
    <div className="mb-12">
      <h2 className="text-3xl font-bold mb-6">Events & World Bosses</h2>
      
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex gap-2">
          {['upcoming', 'all', 'completed'].map(filter => (
            <button
              key={filter}
              onClick={() => setCurrentFilter(filter)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                currentFilter === filter
                  ? 'bg-emerald-400 text-gray-900'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {filter === 'upcoming' ? 'Upcoming (2h)' : filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
        
        <button
          onClick={processEventsData}
          className="bg-emerald-500 text-gray-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-400 transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Events
        </button>
      </div>
      
      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400">
          <p>No events found with the current filter.</p>
          <p className="mt-2">Try changing the filter or refreshing the page.</p>
        </div>
      )}
    </div>
  );
};

export default EventsSection;