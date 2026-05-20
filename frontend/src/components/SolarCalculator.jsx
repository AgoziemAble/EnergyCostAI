import React, { useState } from 'react';
import { Sun, ArrowRight, DollarSign, Timer } from 'lucide-react';
import { motion } from 'framer-motion';

const SolarCalculator = ({ monthlyFuelCost }) => {
  const [solarCost, setSolarCost] = useState('850000'); // Typical basic solar cost in ₦
  const [showResult, setShowResult] = useState(false);

  const paybackMonths = monthlyFuelCost > 0 ? Number(solarCost) / monthlyFuelCost : 0;
  const paybackYears = (paybackMonths / 12).toFixed(1);

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-yellow-100 rounded-lg text-yellow-600">
          <Sun size={20} />
        </div>
        <h2 className="text-lg font-bold text-gray-800 tracking-tight">Solar ROI Calculator</h2>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">
            Estimated Solar System Cost (₦)
          </label>
          <input
            type="number"
            value={solarCost}
            onChange={(e) => setSolarCost(e.target.value)}
            className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-gray-900 font-bold focus:bg-white transition-all shadow-sm"
            placeholder="e.g. 850,000"
          />
        </div>

        <button
          onClick={() => setShowResult(true)}
          className="w-full py-4 bg-yellow-500 text-white rounded-2xl font-bold shadow-lg shadow-yellow-100 hover:bg-yellow-600 hover:-translate-y-0.5 transition-all active:scale-95"
        >
          Calculate Payback Period
        </button>

        {showResult && monthlyFuelCost > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 bg-yellow-50 rounded-2xl border border-yellow-100 relative overflow-hidden"
          >
            <div className="relative z-10 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-yellow-700 uppercase tracking-widest">Payback Time</span>
                <span className="text-2xl font-black text-yellow-900">{paybackYears} Years</span>
              </div>
              
              <div className="bg-white/50 p-3 rounded-xl">
                <p className="text-xs text-yellow-800 leading-relaxed">
                  By switching to solar, you will save <span className="font-bold">₦{monthlyFuelCost.toLocaleString()}</span> every month. Your investment pays for itself in <span className="font-bold">{paybackYears} years</span>, after which your electricity is practically <span className="font-bold">FREE</span>.
                </p>
              </div>

              <div className="flex items-center gap-2 text-[10px] font-bold text-yellow-600 bg-white/30 p-2 rounded-lg">
                <Timer size={14} />
                <span>SOLAR PANELS TYPICALLY LAST 25+ YEARS</span>
              </div>
            </div>
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl"></div>
          </motion.div>
        )}

        {showResult && !monthlyFuelCost && (
          <p className="text-xs text-center text-gray-400 italic">
            * Calculate your fuel cost first to see ROI.
          </p>
        )}
      </div>
    </div>
  );
};

export default SolarCalculator;
