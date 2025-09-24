import React from 'react';
import { formatTimeWithSeconds } from '../utils/timeUtils';

const Header = ({ currentTime, apiStatus, isOnline }) => {
  const getStatusDisplay = () => {
    if (!isOnline) {
      return {
        text: 'Offline',
        className: 'bg-red-500/20 text-red-300'
      };
    }
    
    switch (apiStatus) {
      case 'online':
        return {
          text: 'Online',
          className: 'bg-emerald-500/20 text-emerald-300'
        };
      case 'unavailable':
        return {
          text: 'Online (API Unavailable)',
          className: 'bg-amber-500/20 text-amber-300'
        };
      case 'checking':
        return {
          text: 'Checking...',
          className: 'bg-gray-500/20 text-gray-300'
        };
      default:
        return {
          text: 'Unknown',
          className: 'bg-gray-500/20 text-gray-300'
        };
    }
  };

  const status = getStatusDisplay();

  return (
    <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-40 backdrop-blur-sm bg-gray-800/95">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
              Guild Wars 2 Daily Tracker
            </h1>
            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${status.className}`}>
              {status.text}
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-gray-400">Current Time</div>
            <div className="text-lg font-mono text-emerald-400">
              {formatTimeWithSeconds(currentTime)}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default React.memo(Header);