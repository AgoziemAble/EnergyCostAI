import React from 'react';
import { Briefcase, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';

const BusinessMode = ({ totalCost, isBusiness, setIsBusiness, revenue, setRevenue }) => {
  const handleToggle = () => {
    setIsBusiness(!isBusiness);
  };

  const costRatio = revenue > 0 ? (totalCost / Number(revenue)) * 100 : 0;
  const isHigh = costRatio > 30;

  return (
    <div className={`p-6 transition-all duration-500 ${isBusiness ? 'bg-amber-50/50' : 'bg-transparent'}`}>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl transition-colors duration-300 ${isBusiness ? 'bg-amber-500 text-white shadow-lg shadow-amber-200' : 'bg-gray-100 text-gray-500'}`}>
            <Briefcase size={20} />
          </div>
          <h2 className="text-lg font-bold text-gray-800 tracking-tight">Business Mode</h2>
        </div>
        
        <button
          onClick={handleToggle}
          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${
            isBusiness ? 'bg-amber-500' : 'bg-gray-200'
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm ${
              isBusiness ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {isBusiness && (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-500">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-amber-700 uppercase tracking-wider ml-1">
              Daily Revenue (₦)
            </label>
            <div className="relative">
              <input
                type="number"
                value={revenue}
                onChange={(e) => setRevenue(e.target.value)}
                className="w-full p-3 bg-white border border-amber-200 rounded-xl text-gray-900 font-bold focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all shadow-sm"
                placeholder="Total sales for today"
              />
              <TrendingUp className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-300" size={18} />
            </div>
          </div>

          {totalCost > 0 && revenue > 0 && (
            <div className="p-5 bg-white rounded-2xl border border-amber-100 shadow-sm relative overflow-hidden group">
              <div className="flex justify-between items-end mb-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Profit Impact</p>
                  <p className={`text-3xl font-black ${isHigh ? 'text-red-500' : 'text-green-500'}`}>
                    {costRatio.toFixed(1)}%
                  </p>
                </div>
                {isHigh ? (
                  <AlertCircle className="text-red-400 mb-1" size={24} />
                ) : (
                  <CheckCircle2 className="text-green-400 mb-1" size={24} />
                )}
              </div>
              
              <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden mb-4">
                <div 
                  className={`h-full transition-all duration-1000 ease-out rounded-full ${isHigh ? 'bg-red-500' : 'bg-green-500'}`}
                  style={{ width: `${Math.min(costRatio, 100)}%` }}
                ></div>
              </div>

              <div className={`text-center p-2.5 rounded-xl border font-bold text-xs tracking-tight ${
                isHigh 
                  ? 'bg-red-50 border-red-100 text-red-600' 
                  : 'bg-green-50 border-green-100 text-green-600'
              }`}>
                {isHigh 
                  ? '⚠️ Alert: Energy costs are eating too much profit!' 
                  : '✅ Healthy: Your energy overhead is safe.'}
              </div>
            </div>
          )}
          
          {totalCost === 0 && (
            <div className="text-center p-4 border-2 border-dashed border-amber-100 rounded-2xl">
               <p className="text-[11px] text-amber-600 font-medium">
                * Enter fuel details above to see business health
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BusinessMode;
