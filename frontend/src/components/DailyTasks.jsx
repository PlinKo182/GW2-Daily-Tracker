import React, { useCallback } from 'react';
import { Pickaxe, Hammer, Star } from 'lucide-react';
import { mockData } from '../utils/mockData';
import TaskTimer from './Tasks/TaskTimer';

const ProgressBar = React.memo(({ progress }) => (
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
));

// Componente TaskCard memoizado individualmente
const TaskCard = React.memo(({ 
  title, 
  icon: Icon, 
  description, 
  tasks, 
  category, 
  progress,
  dailyProgress,
  onTaskToggle,
  copyToClipboard,
  currentTime
}) => (
  <div className="bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-700 flex flex-col hover:shadow-xl transition-all duration-300 hover:-translate-y-1 transform-gpu">
    <div className="p-6 flex-grow">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-5 h-5 text-emerald-400" />
        <h3 className="text-xl font-bold text-emerald-400">{title}</h3>
      </div>
      <p className="text-sm text-gray-400 mb-4">{description}</p>
      <div className="space-y-4">
        {tasks.map((task) => (
          <div key={task.id} className="group">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={dailyProgress[category]?.[task.id] || false}
                onChange={() => onTaskToggle(category, task.id)}
                className="rounded bg-gray-700 border-gray-600 text-emerald-400 focus:ring-emerald-400/50 focus:ring-2"
                disabled={task.availability && !dailyProgress[category]?.[task.id]}
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className={`text-gray-300 transition-colors ${dailyProgress[category]?.[task.id] ? 'line-through text-gray-500' : ''}`}>
                    {task.name}
                  </span>
                  {task.waypoint && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        copyToClipboard(task.waypoint);
                      }}
                      className="text-emerald-400 text-xs font-mono hover:bg-gray-700 px-2 py-1 rounded transition-colors duration-150"
                      title="Click to copy waypoint"
                    >
                      {task.waypoint}
                    </button>
                  )}
                </div>
                
                {/* Timer para tarefas com disponibilidade específica */}
                {task.availability && (
                  <TaskTimer 
                    availability={task.availability} 
                    currentTime={currentTime}
                  />
                )}
              </div>
            </label>
          </div>
        ))}
      </div>
    </div>
    <ProgressBar progress={progress} />
  </div>
));

const DailyTasks = ({ dailyProgress, onTaskToggle, calculateCategoryProgress, currentTime }) => {
  const copyToClipboard = useCallback((text) => {
    navigator.clipboard.writeText(text.trim()).then(() => {
      // Poderia adicionar notificação toast aqui
    }).catch(() => {
      // Fallback para navegadores antigos
      const textArea = document.createElement('textarea');
      textArea.value = text.trim();
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    });
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      <TaskCard
        title="Daily Gathering"
        icon={Pickaxe}
        description="Visit these waypoints for daily gathering"
        tasks={mockData.gatheringTasks}
        category="gathering"
        progress={calculateCategoryProgress('gathering')}
        dailyProgress={dailyProgress}
        onTaskToggle={onTaskToggle}
        copyToClipboard={copyToClipboard}
        currentTime={currentTime}
      />
      
      <TaskCard
        title="Daily Crafting"
        icon={Hammer}
        description="Craft these items daily"
        tasks={mockData.craftingTasks}
        category="crafting"
        progress={calculateCategoryProgress('crafting')}
        dailyProgress={dailyProgress}
        onTaskToggle={onTaskToggle}
        copyToClipboard={copyToClipboard}
        currentTime={currentTime}
      />
      
      <TaskCard
        title="Daily Specials"
        icon={Star}
        description="PSNA and Home Instance tasks"
        tasks={mockData.specialTasks}
        category="specials"
        progress={calculateCategoryProgress('specials')}
        dailyProgress={dailyProgress}
        onTaskToggle={onTaskToggle}
        copyToClipboard={copyToClipboard}
        currentTime={currentTime}
      />
    </div>
  );
};

export default React.memo(DailyTasks);