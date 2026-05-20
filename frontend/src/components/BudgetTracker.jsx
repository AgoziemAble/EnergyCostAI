import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Target, Settings, AlertCircle, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

const BudgetTracker = ({ currentSpending, onBudgetChange }) => {
  const [budget, setBudget] = useState(50000);
  const [isEditing, setIsBusiness] = useState(false);
  const [inputValue, setInputValue] = useState('50000');

  useEffect(() => {
    fetchBudget();
  }, []);

  const fetchBudget = async () => {
    try {
      const res = await api.get('/settings/budget');
      if (res.data && typeof res.data.value === 'number') {
        setBudget(res.data.value);
        setInputValue(res.data.value.toString());
      }
    } catch (err) {
      console.warn('Could not fetch budget, using default.', err);
      setBudget(50000);
    }
  };

  const handleSave = async () => {
    try {
      const val = Number(inputValue);
      await api.post('/settings/budget', { value: val });
      setBudget(val);
      setIsBusiness(false);
      if (onBudgetChange) onBudgetChange();
    } catch (err) {
      console.error(err);
    }
  };

  const progress = Math.min((currentSpending / budget) * 100, 100);
  const isOverBudget = currentSpending > budget;
  const isWarning = currentSpending > budget * 0.8 && !isOverBudget;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isOverBudget ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
            <Target size={20} />
          </div>
          <h2 className="text-lg font-bold text-gray-800 tracking-tight">Monthly Budget</h2>
        </div>
        
        <button 
          onClick={() => setIsBusiness(!isEditing)}
          className="p-2 text-gray-400 hover:text-green-600 transition-colors"
        >
          <Settings size={18} />
        </button>
      </div>

      <div className="space-y-6">
        {isEditing ? (
          <div className="flex gap-2 animate-in fade-in slide-in-from-top-1 duration-300">
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 p-3 bg-white border border-green-200 rounded-xl text-gray-900 font-bold focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="Set monthly budget"
            />
            <button
              onClick={handleSave}
              className="px-6 bg-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-100 hover:bg-green-700 transition-all"
            >
              SAVE
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Spent so far</p>
                <p className="text-3xl font-black text-gray-900">
                  ₦{currentSpending.toLocaleString()} 
                  <span className="text-sm font-bold text-gray-300 ml-2">/ ₦{budget.toLocaleString()}</span>
                </p>
              </div>
              <div className={`text-right ${isOverBudget ? 'text-red-500' : isWarning ? 'text-amber-500' : 'text-green-500'}`}>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-1">Used</p>
                <p className="text-lg font-black">{progress.toFixed(0)}%</p>
              </div>
            </div>

            <div className="w-full bg-gray-100 h-4 rounded-full overflow-hidden relative shadow-inner">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1.5, ease: "circOut" }}
                className={`h-full rounded-full shadow-lg ${
                  isOverBudget ? 'bg-gradient-to-r from-red-500 to-red-600' : 
                  isWarning ? 'bg-gradient-to-r from-amber-400 to-amber-500' : 
                  'bg-gradient-to-r from-green-500 to-green-600'
                }`}
              ></motion.div>
            </div>

            {currentSpending === 0 && (
              <p className="text-[10px] text-gray-400 text-center italic">
                No spending recorded this month yet. Use the calculator to start!
              </p>
            )}

            {isOverBudget && (
              <div className="bg-red-50 p-3 rounded-xl border border-red-100 flex items-center gap-3 text-red-700 animate-pulse">
                <AlertCircle size={18} />
                <p className="text-xs font-bold leading-tight">
                  BUDGET EXCEEDED: You've spent ₦{(currentSpending - budget).toLocaleString()} more than planned!
                </p>
              </div>
            )}

            {isWarning && (
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-100 flex items-center gap-3 text-amber-700">
                <TrendingDown size={18} />
                <p className="text-xs font-bold leading-tight">
                  WARNING: You are close to your limit. Reduce generator hours!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetTracker;
