// components/EventsFilter/EventsFilter.js
import React, { useState, useEffect } from 'react';
import { Filter, X, Save, Loader } from 'lucide-react';
import { eventsData } from '../../utils/eventsData';

const EventsFilter = ({ onFilterChange, currentFilters }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState(currentFilters || {});
  const [isSaving, setIsSaving] = useState(false);

  // Contar eventos por categoria
  const countEventsInCategory = (categoryData) => {
    let count = 0;
    
    const countRecursive = (data) => {
      if (data.utc_times && Array.isArray(data.utc_times)) {
        count++;
        return;
      }
      
      if (typeof data === 'object' && data !== null) {
        Object.values(data).forEach(value => {
          if (typeof value === 'object' && value !== null) {
            countRecursive(value);
          }
        });
      }
    };
    
    if (typeof categoryData === 'object' && categoryData !== null) {
      countRecursive(categoryData);
    }
    
    return count;
  };

  // Inicializar filtros quando currentFilters mudar
  useEffect(() => {
    if (currentFilters && Object.keys(currentFilters).length > 0) {
      setSelectedFilters(currentFilters);
    } else {
      // Inicializar com todas as categorias selecionadas
      const initialFilters = {};
      Object.keys(eventsData).forEach(category => {
        initialFilters[category] = true;
      });
      setSelectedFilters(initialFilters);
    }
  }, [currentFilters]);

  const handleCategoryToggle = (category) => {
    const newFilters = {
      ...selectedFilters,
      [category]: !selectedFilters[category]
    };
    setSelectedFilters(newFilters);
  };

  const handleSelectAll = () => {
    const allSelected = {};
    Object.keys(eventsData).forEach(category => {
      allSelected[category] = true;
    });
    setSelectedFilters(allSelected);
  };

  const handleSelectNone = () => {
    const noneSelected = {};
    Object.keys(eventsData).forEach(category => {
      noneSelected[category] = false;
    });
    setSelectedFilters(noneSelected);
  };

  const saveFilters = () => {
    setIsSaving(true);
    
    setTimeout(() => {
      setIsSaving(false);
      setIsOpen(false);
      onFilterChange(selectedFilters);
    }, 500);
  };

  const selectedCount = Object.values(selectedFilters).filter(Boolean).length;
  const totalCount = Object.keys(eventsData).length;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-gray-700 text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400"
      >
        <Filter className="w-4 h-4" />
        Event Filters ({selectedCount}/{totalCount})
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden border border-gray-700">
            <div className="p-6 border-b border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-emerald-400">Event Filters</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <p className="text-gray-400 text-sm">
                Select which event categories you want to see in the Events & World Bosses section.
              </p>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="flex gap-2 mb-4">
                <button
                  onClick={handleSelectAll}
                  className="px-3 py-1 text-xs bg-emerald-600 hover:bg-emerald-700 rounded transition-colors"
                >
                  Select All
                </button>
                <button
                  onClick={handleSelectNone}
                  className="px-3 py-1 text-xs bg-gray-600 hover:bg-gray-700 rounded transition-colors"
                >
                  Select None
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.keys(eventsData).map(category => {
                  const eventCount = countEventsInCategory(eventsData[category]);
                  return (
                    <label key={category} className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!selectedFilters[category]}
                        onChange={() => handleCategoryToggle(category)}
                        className="rounded bg-gray-600 border-gray-500 text-emerald-400 focus:ring-emerald-400"
                      />
                      <span className="text-gray-200 flex-1">{category}</span>
                      <span className="text-xs text-gray-400 bg-gray-600 px-2 py-1 rounded">
                        {eventCount} events
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="p-6 border-t border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveFilters}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Filters
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EventsFilter;