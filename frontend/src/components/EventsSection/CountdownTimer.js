// components/CountdownTimer.jsx
import React from 'react';
import { Clock } from 'lucide-react';

const CountdownTimer = ({ startTime, endTime, currentTime }) => {
  const calculateTimeLeft = () => {
    const now = currentTime;
    
    if (now >= endTime) {
      return { active: false, upcoming: false, text: 'Event completed', time: '00:00:00' };
    }
    
    if (now >= startTime) {
      // Evento ativo - contar para o fim
      const diff = endTime - now;
      const seconds = Math.floor(diff / 1000);
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      
      return {
        active: true,
        upcoming: false,
        text: 'Ends in:',
        time: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      };
    } else {
      // Evento futuro - contar para o início
      const diff = startTime - now;
      const seconds = Math.floor(diff / 1000);
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      
      return {
        active: false,
        upcoming: true,
        text: 'Starts in:',
        time: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      };
    }
  };

  const timeInfo = calculateTimeLeft();

  return (
    <div className={`font-mono mb-4 flex items-center gap-2 ${
      timeInfo.active ? 'text-emerald-300 animate-pulse' : 
      timeInfo.upcoming ? 'text-amber-300' : 'text-gray-400'
    }`}>
      <Clock className="w-4 h-4" />
      <span>{timeInfo.text}</span>
      <span>{timeInfo.time}</span>
    </div>
  );
};

export default React.memo(CountdownTimer);