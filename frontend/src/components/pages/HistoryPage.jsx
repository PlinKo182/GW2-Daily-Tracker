import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import useStore from '../../store/useStore';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';

const fetchUserProgress = async (userName) => {
  const { data } = await axios.get(`https://gw-2-daily-tracker.vercel.app/api/progress/${userName}`);
  if (!data.success) {
    throw new Error(data.error || 'User not found');
  }
  return data.data;
};

const HistoryPage = () => {
  const userName = useStore((state) => state.userName);

  const { data: progressData, isLoading, error, isError } = useQuery({
    queryKey: ['userProgress', userName],
    queryFn: () => fetchUserProgress(userName),
    enabled: !!userName, // Only run the query if a userName is available
  });

  const sortedDates = progressData ? Object.keys(progressData).sort((a, b) => new Date(b) - new Date(a)) : [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="bg-card/95 border-b border-border sticky top-0 z-40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link to="/" className="p-2 rounded-full hover:bg-muted transition-colors">
            <ArrowLeftIcon className="h-6 w-6 text-primary" />
            <span className="sr-only">Back to Dashboard</span>
          </Link>
          <h1 className="text-2xl font-bold">Progress History</h1>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-8 px-6">
        {isLoading && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading history...</p>
          </div>
        )}
        {isError && (
          <div className="text-center text-destructive">
            <p>Error loading history: {error.message}</p>
          </div>
        )}
        {progressData && sortedDates.length > 0 ? (
          <div className="space-y-4">
            {sortedDates.map((date) => {
              const dayData = progressData[date];
              const allTasks = [
                ...Object.values(dayData.dailyProgress.gathering),
                ...Object.values(dayData.dailyProgress.crafting),
                ...Object.values(dayData.dailyProgress.specials),
              ];
              const completedTasks = allTasks.filter(Boolean).length;
              const totalTasks = allTasks.length;
              const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

              return (
                <div key={date} className="bg-card border border-border rounded-lg p-4 shadow-sm">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-lg">{new Date(date).toLocaleDateString()}</h3>
                    <div className="text-right">
                      <p className="font-semibold">{completedTasks} / {totalTasks} tasks</p>
                      <p className="text-sm text-primary">{percentage}% complete</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          !isLoading && <p className="text-center text-muted-foreground">No history found for user: {userName}</p>
        )}
      </main>
    </div>
  );
};

export default HistoryPage;