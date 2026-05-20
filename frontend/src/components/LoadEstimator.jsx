import React, { useState } from 'react';
import { Zap, Plus, Minus } from 'lucide-react';
import { motion } from 'framer-motion';

const APPLIANCES = [
  { name: 'Fan', watts: 75, icon: '🌀' },
  { name: 'TV', watts: 150, icon: '📺' },
  { name: 'Fridge', watts: 300, icon: '❄️' },
  { name: 'AC (1.5HP)', watts: 1500, icon: '💨' },
  { name: 'Lights', watts: 50, icon: '💡' },
  { name: 'Laptop', watts: 65, icon: '💻' },
  { name: 'Iron', watts: 1000, icon: '🔌' },
  { name: 'Microwave', watts: 800, icon: '🔥' },
  { name: 'Sound Sys', watts: 100, icon: '🔊' },
  { name: 'Deep Freezer', watts: 400, icon: '🧊' },
];

const LoadEstimator = () => {
  const [selected, setSelected] = useState([]);

  const toggleAppliance = (name) => {
    setSelected(prev => 
      prev.includes(name) ? prev.filter(a => a !== name) : [...prev, name]
    );
  };

  const totalWatts = selected.reduce((sum, name) => {
    const app = APPLIANCES.find(a => a.name === name);
    return sum + (app ? app.watts : 0);
  }, 0);

  const estimatedFuelInc = (totalWatts / 1000) * 0.5;

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
          <Zap size={20} />
        </div>
        <h2 className="text-lg font-bold text-gray-800">Load Estimator</h2>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-8">
        {APPLIANCES.map(app => {
          const isActive = selected.includes(app.name);
          return (
            <motion.button
              key={app.name}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleAppliance(app.name)}
              className={`p-3 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden group ${
                isActive 
                  ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100' 
                  : 'bg-white border-gray-100 text-gray-600 hover:border-blue-200'
              }`}
            >
              <div className="flex flex-col gap-2 relative z-10">
                <span className="text-xl">{app.icon}</span>
                <div>
                  <p className="text-xs font-bold leading-none mb-1">{app.name}</p>
                  <p className={`text-[10px] font-bold ${isActive ? 'text-blue-100' : 'text-gray-400'}`}>
                    {app.watts}W
                  </p>
                </div>
              </div>
              {isActive && (
                <div className="absolute top-2 right-2">
                  <Minus size={12} className="text-blue-200" />
                </div>
              )}
              {!isActive && (
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Plus size={12} className="text-blue-400" />
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      <div className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100 relative overflow-hidden">
        <div className="flex justify-between items-center mb-3">
          <span className="text-[10px] font-bold text-blue-700 uppercase tracking-widest">Total Load</span>
          <span className="text-2xl font-black text-blue-900">{totalWatts}W</span>
        </div>
        <div className="flex justify-between items-center pt-3 border-t border-blue-100">
          <span className="text-[10px] font-bold text-blue-700 uppercase tracking-widest">Fuel Impact</span>
          <span className="text-lg font-black text-blue-600">+{estimatedFuelInc.toFixed(2)} L/hr</span>
        </div>
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -mr-12 -mt-12 blur-xl"></div>
      </div>
    </div>
  );
};

export default LoadEstimator;
