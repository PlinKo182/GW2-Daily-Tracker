import React from 'react';
import { MapPin, Wifi, WifiOff, CheckCircle, AlertCircle } from 'lucide-react';

const Header = ({ currentTime, apiStatus, isOnline }) => {
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

  const getStatusDisplay = () => {
    if (!isOnline) {
      return (
        <div className="flex items-center gap-2 text-amber-400">
          <WifiOff className="w-4 h-4" />
          <span className="text-xs">Offline Mode</span>
        </div>
      );
    }

    switch (apiStatus) {
      case 'checking':
        return (
          <div className="flex items-center gap-2 text-blue-400">
            <AlertCircle className="w-4 h-4" />
            <span className="text-xs">Checking...</span>
          </div>
        );
      case 'online':
        return (
          <div className="flex items-center gap-2 text-emerald-400">
            <CheckCircle className="w-4 h-4" />
            <span className="text-xs">Online</span>
          </div>
        );
      case 'offline':
      default:
        return (
          <div className="flex items-center gap-2 text-amber-400">
            <AlertCircle className="w-4 h-4" />
            <span className="text-xs">Local Only</span>
          </div>
        );
    }
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
          {getStatusDisplay()}
          <div className="text-sm text-gray-400">
            {formatTime(currentTime)}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;