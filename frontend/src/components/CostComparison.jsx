import React, { useState } from 'react';
import api from '../utils/api';
import { Scale, Lightbulb, ZapOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CostComparison = ({ genMonthlyCost }) => {
  const [gridBill, setGridBill] = useState('');
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCompare = async () => {
    if (!genMonthlyCost) {
      alert('Please calculate generator cost first!');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/compare', {
        genCost: genMonthlyCost,
        gridCost: Number(gridBill)
      });
      setComparison(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
          <Scale size={20} />
        </div>
        <h2 className="text-lg font-bold text-gray-800 tracking-tight">Gen vs Grid</h2>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">
            Monthly Electricity Bill (₦)
          </label>
          <input
            type="number"
            value={gridBill}
            onChange={(e) => setGridBill(e.target.value)}
            className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-gray-900 font-bold focus:bg-white transition-all shadow-sm"
            placeholder="Enter average NEPA/PHCN bill"
          />
        </div>

        <button
          onClick={handleCompare}
          disabled={loading || !gridBill}
          className="w-full py-4 bg-orange-500 text-white rounded-2xl font-bold shadow-lg shadow-orange-100 hover:bg-orange-600 hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-50"
        >
          {loading ? 'Comparing...' : 'Compare Costs'}
        </button>

        <AnimatePresence>
          {comparison && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-5 rounded-2xl border relative overflow-hidden ${
                comparison.cheaper === 'Generator' 
                  ? 'bg-red-50 border-red-100 text-red-900' 
                  : 'bg-green-50 border-green-100 text-green-900'
              }`}
            >
              <div className="flex items-start gap-4 relative z-10">
                <div className={`p-2 rounded-xl ${comparison.cheaper === 'Generator' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                  {comparison.cheaper === 'Generator' ? <ZapOff size={20} /> : <Lightbulb size={20} />}
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">Recommended Choice</p>
                  <p className="text-sm font-black leading-tight">{comparison.message}</p>
                  <p className="text-[11px] font-bold opacity-70">
                    Difference: ₦{comparison.difference.toLocaleString()} / month
                  </p>
                </div>
              </div>
              <div className={`absolute top-0 right-0 w-24 h-24 rounded-full -mr-12 -mt-12 blur-2xl ${comparison.cheaper === 'Generator' ? 'bg-red-500/10' : 'bg-green-500/10'}`}></div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CostComparison;
