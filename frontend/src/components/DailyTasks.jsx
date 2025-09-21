import React, { useState } from 'react';
import { Pickaxe, Hammer, Star, ExternalLink } from 'lucide-react';
import { mockData } from '../utils/mockData';

const ProgressBar = ({ progress }) => (
  <div className="px-6 pb-4">
    <div className="flex justify-between items-center mb-1 text-sm font-medium">
      <span className="text-gray-400">Progress</span>
      <span className="text-emerald-400">{progress.completed}/{progress.total}</span>
    </div>
    <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
      <div 
        className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500 ease-out"
        style={{ width: `${progress.percentage}%` }}
      />
    </div>
  </div>
);

const DailyTasks = ({ dailyProgress, onTaskToggle, calculateCategoryProgress }) => {
  const [hoveredCard, setHoveredCard] = useState(null);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text.trim()).then(() => {
      // Could add toast notification here
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text.trim();
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    });
  };

  const TaskCard = React.memo(({ title, icon: Icon, description, tasks, category, progress, cardId }) => {
    return (
      <div 
        className={`bg-gray-800 rounded-xl overflow-hidden border border-gray-700 flex flex-col transition-all duration-300 ${
          hoveredCard === cardId ? 'shadow-xl -translate-y-1' : 'shadow-lg'
        }`}
        onMouseEnter={() => setHoveredCard(cardId)}
        onMouseLeave={() => setHoveredCard(null)}
      >
        <div className="p-6 flex-grow">
          <div className="flex items-center gap-2 mb-2">
            <Icon className="w-5 h-5 text-emerald-400" />
            <h3 className="text-xl font-bold text-emerald-400">{title}</h3>
          </div>
          <p className="text-sm text-gray-400 mb-4">{description}</p>
          <div className="space-y-3">
            {tasks.map((task) => (
              <label key={task.id} className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={dailyProgress[category][task.id]}
                  onChange={() => onTaskToggle(category, task.id)}
                  className="rounded bg-gray-700 border-gray-600 text-emerald-400 focus:ring-emerald-400/50 focus:ring-2"
                />
                <div className="flex-1 flex items-center justify-between">
                  <span className={`text-gray-300 transition-colors ${dailyProgress[category][task.id] ? 'line-through text-gray-500' : ''}`}>
                    {task.name}
                  </span>
                  {task.waypoint && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        copyToClipboard(task.waypoint);
                      }}
                      className="text-emerald-400 text-xs font-mono hover:bg-gray-700 px-2 py-1 rounded transition-colors group-hover:bg-gray-700"
                      title="Click to copy waypoint"
                    >
                      {task.waypoint}
                      <ExternalLink className="w-3 h-3 inline ml-1" />
                    </button>
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>
        <ProgressBar progress={progress} />
      </div>
    );
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      <TaskCard
        title="Daily Gathering"
        icon={Pickaxe}
        description="Visit these waypoints for daily gathering"
        tasks={mockData.gatheringTasks}
        category="gathering"
        progress={calculateCategoryProgress('gathering')}
        cardId="gathering"
      />
      
      <TaskCard
        title="Daily Crafting"
        icon={Hammer}
        description="Craft these items daily"
        tasks={mockData.craftingTasks}
        category="crafting"
        progress={calculateCategoryProgress('crafting')}
        cardId="crafting"
      />
      
      <TaskCard
        title="Daily Specials"
        icon={Star}
        description="PSNA and Home Instance tasks"
        tasks={mockData.specialTasks}
        category="specials"
        progress={calculateCategoryProgress('specials')}
        cardId="specials"
      />
    </div>
  );
};

export default DailyTasks;