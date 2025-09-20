import React from 'react';
import { MapPin } from 'lucide-react';

const Header = ({ currentTime }) => {
  const formatTime = (date) => {
    const timeString = date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
    
    const dateString = date.toLocaleDateString([], {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    return `${dateString} - ${timeString}`;
  };

  return (
    <header className="bg-gray-800 border-b border-gray-700 py-4 px-6">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="text-emerald-400">
            <MapPin className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold">Tyria Tracker</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-400">
            {formatTime(currentTime)}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;