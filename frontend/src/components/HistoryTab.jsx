import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import useStore from '../store/useStore';

const API_URL = process.env.REACT_APP_API_URL || 'https://gw-2-daily-tracker.vercel.app/api';

const fetchUserProgress = async (userName) => {
  const { data } = await axios.get(`${API_URL}/progress/${userName}`);
  if (!data.success) {
    throw new Error(data.error || 'User not found');
  }
  return data.data;
};

const HistoryTab = () => {
  const activeProfile = useStore((state) => state.activeProfile);

  const { data: progressData, isLoading, error, isError } = useQuery({
    queryKey: ['userProgress', activeProfile],
    queryFn: () => fetchUserProgress(activeProfile),
    enabled: !!activeProfile, // Only run the query if a profile is active
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const sortedDates = progressData ? Object.keys(progressData).sort((a, b) => new Date(b) - new Date(a)) : [];

  if (isLoading) {
    return (
      <div className="text-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading history...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-10 text-destructive">
        <p>Error loading history: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sortedDates.length > 0 ? (
        sortedDates.map((date) => {
          const dayData = progressData[date];
          if (!dayData || !dayData.dailyProgress) return null; // Add a check for valid dayData

          const allTasks = [
            ...Object.values(dayData.dailyProgress.gathering || {}),
            ...Object.values(dayData.dailyProgress.crafting || {}),
            ...Object.values(dayData.dailyProgress.specials || {}),
          ];
          const completedTasks = allTasks.filter(Boolean).length;
          const totalTasks = allTasks.length;
          const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

          return (
            <div key={date} className="bg-card border border-border rounded-lg p-4 shadow-sm transition-all hover:shadow-md">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg">{new Date(date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</h3>
                <div className="text-right">
                  <p className="font-semibold">{completedTasks} / {totalTasks} tasks</p>
                  <p className="text-sm text-primary">{percentage}% complete</p>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <p className="text-center py-10 text-muted-foreground">No history found for profile: {activeProfile}</p>
      )}
    </div>
  );
};

export default HistoryTab;