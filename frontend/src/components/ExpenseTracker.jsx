import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { History, Calendar, Trash2, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ExpenseTracker = ({ refreshTrigger }) => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchHistory();
  }, [refreshTrigger]);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/history');
      setHistory(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteRecord = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      await api.delete(`/history/${id}`);
      fetchHistory();
    } catch (err) {
      console.error(err);
    }
  };

  const exportToCSV = () => {
    if (history.length === 0) return;
    const headers = ["Date", "Fuel Price (NGN)", "Litres Used", "Usage Hours", "Total Cost (NGN)", "Business Mode"];
    const csvRows = [
      headers.join(','),
      ...history.map(r => [
        new Date(r.date).toLocaleDateString(),
        r.fuelPrice,
        r.litresUsed,
        r.usageHours,
        r.totalCost,
        r.isBusiness ? 'Yes' : 'No'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvRows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `EnergyCost_Report_${new Date().toLocaleDateString()}.csv`);
    a.click();
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
            <History size={20} />
          </div>
          <h2 className="text-lg font-bold text-gray-800 tracking-tight">Recent Records</h2>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={exportToCSV}
            className="p-2 text-gray-400 hover:text-green-600 transition-colors"
            title="Export to CSV"
          >
            <Download size={18} />
          </button>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded-full border border-gray-100">
            Last 30 days
          </span>
        </div>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {history.length === 0 ? (
          <div className="text-center py-12 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
            <Calendar className="mx-auto text-gray-300 mb-3" size={32} />
            <p className="text-sm text-gray-400 font-medium">No records found yet.</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {history.map((record, index) => (
              <motion.div 
                key={record._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className="group p-4 bg-white border border-gray-50 rounded-2xl shadow-sm hover:shadow-md hover:border-green-100 transition-all relative"
              >
                <button 
                  onClick={() => deleteRecord(record._id)}
                  className="absolute top-4 right-4 p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={14} />
                </button>
                <div className="flex justify-between items-start mb-3">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">
                      {new Date(record.date).toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </p>
                    <p className="text-lg font-black text-gray-900">₦{record.totalCost.toLocaleString()}</p>
                  </div>
                  {record.isBusiness && (
                    <span className="text-[9px] font-black bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200 uppercase tracking-widest mr-6">
                      Business
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-gray-50 rounded-lg p-2 text-center">
                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Litres</p>
                    <p className="text-xs font-black text-gray-700">{record.litresUsed}L</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2 text-center">
                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Hours</p>
                    <p className="text-xs font-black text-gray-700">{record.usageHours}h</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2 text-center">
                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Rate</p>
                    <p className="text-xs font-black text-green-600">₦{Math.round(record.costPerHour)}/h</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default ExpenseTracker;
