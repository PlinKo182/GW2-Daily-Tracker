// utils/timeUtils.js
export const convertUTCTimeToLocal = (utcTimeString) => {
  const now = new Date();
  const [hours, minutes] = utcTimeString.split(':').map(Number);
  
  const utcDate = new Date(Date.UTC(
    now.getUTCFullYear(), 
    now.getUTCMonth(), 
    now.getUTCDate(), 
    hours, 
    minutes
  ));

  const localDate = new Date(utcDate);
  localDate.setMilliseconds(0); // ← Garante precisão de segundos
  return localDate;
};

export const formatTime = (date) => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};