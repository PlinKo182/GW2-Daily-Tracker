// hooks/useCurrentTime.js
import { useState, useEffect } from 'react';

export const useCurrentTime = () => {
  const [currentTime, setCurrentTime] = useState(() => {
    const now = new Date();
    now.setMilliseconds(0); // ← Normaliza para o início do segundo
    return now;
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      now.setMilliseconds(0); // ← Sempre no início do segundo
      setCurrentTime(now);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return currentTime;
};