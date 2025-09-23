// hooks/useCurrentTime.js
import { useState, useEffect } from 'react';

export const useCurrentTime = () => {
  const [currentTime, setCurrentTime] = useState(() => {
    const now = new Date();
    now.setMilliseconds(0);
    return now;
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      now.setMilliseconds(0);
      setCurrentTime(now);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return currentTime;
};