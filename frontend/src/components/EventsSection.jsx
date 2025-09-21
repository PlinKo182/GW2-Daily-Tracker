import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Clock, MapPin, RefreshCw } from 'lucide-react';
import { mockData } from '../utils/mockData';

// Componente isolado para o timer
const CountdownTimer = React.memo(({ startTime, endTime, currentTime }) => {
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

  const now = new Date();
  const eventActive = startTime <= now && endTime >= now;
  const eventUpcoming = startTime > now;

  let countdownText = '';
  if (eventActive) {
    const remaining = getTimeRemaining(endTime);
    countdownText = `Ends in: ${formatTimeRemaining(remaining)}`;
  } else if (eventUpcoming) {
    const remaining = getTimeRemaining(startTime);
    countdownText = `Starts in: ${formatTimeRemaining(remaining)}`;
  } else {
    countdownText = 'Event completed';
  }

  return (
    <div className={`font-mono mb-4 flex items-center gap-2 ${eventActive ? 'text-emerald-300 animate-pulse' : eventUpcoming ? 'text-amber-300' : 'text-gray-400'}`}>
      <Clock className="w-4 h-4" />
      {countdownText}
    </div>
  );
});

const EventsSection = ({ completedEvents, completedEventTypes, onEventToggle, currentTime }) => {
  const [eventsData, setEventsData] = useState([]);
  const [currentFilter, setCurrentFilter] = useState('upcoming');
  const [internalTime, setInternalTime] = useState(currentTime);

  // Atualizar o tempo interno apenas quando a prop currentTime mudar significativamente
  useEffect(() => {
    const timer = setTimeout(() => {
      setInternalTime(currentTime);
    }, 100); // Debounce para evitar atualizações muito frequentes
    
    return () => clearTimeout(timer);
  }, [currentTime]);

  useEffect(() => {
    processEventsData();
  }, [internalTime, completedEvents, completedEventTypes]);

  // ... (resto do código do EventsSection permanece o mesmo)

  // Componente de cartão de evento com memoização
  const EventCard = useMemo(() => React.memo(({ event }) => {
    // ... (código do EventCard)
  }), [completedEvents, completedEventTypes, internalTime]);

  // ... (resto do código do EventsSection)
};

export default React.memo(EventsSection);