import React from 'react';
import { Wrench, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const MaintenanceTracker = ({ totalHours }) => {
  const serviceInterval = 100; // Change oil every 100 hours
  const hoursUntilService = serviceInterval - (totalHours % serviceInterval);
  const progress = ((serviceInterval - hoursUntilService) / serviceInterval) * 100;
  
  const isUrgent = hoursUntilService < 10;

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-2 rounded-lg ${isUrgent ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
          <Wrench size={20} />
        </div>
        <h2 className="text-lg font-bold text-gray-800 tracking-tight">Generator Health</h2>
      </div>

      <div className="space-y-6">
        <div className="bg-gray-50/50 rounded-2xl p-5 border border-gray-100 relative overflow-hidden">
          <div className="flex justify-between items-end mb-4">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Next Oil Change</p>
              <p className={`text-3xl font-black ${isUrgent ? 'text-red-500' : 'text-gray-900'}`}>
                {hoursUntilService.toFixed(0)} <span className="text-sm font-bold opacity-50">Hours</span>
              </p>
            </div>
            <Clock className={isUrgent ? 'text-red-400' : 'text-gray-300'} size={24} />
          </div>

          <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden mb-4">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full rounded-full ${isUrgent ? 'bg-red-500' : 'bg-green-500'}`}
            ></motion.div>
          </div>

          <div className={`flex items-center gap-2 p-3 rounded-xl border text-[11px] font-bold ${
            isUrgent 
              ? 'bg-red-50 border-red-100 text-red-700' 
              : 'bg-green-50 border-green-100 text-green-700'
          }`}>
            {isUrgent ? (
              <>
                <AlertTriangle size={14} />
                <span>URGENT: Service your generator now to avoid damage!</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={14} />
                <span>Your generator is in good health. Keep it up!</span>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
            <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">Total Runtime</p>
            <p className="text-lg font-black text-gray-800">{totalHours.toFixed(0)}h</p>
          </div>
          <div className="p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
            <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">Est. Life Left</p>
            <p className="text-lg font-black text-gray-800">4,200h</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceTracker;
