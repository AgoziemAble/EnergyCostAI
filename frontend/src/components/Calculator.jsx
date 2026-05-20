import React, { useState } from 'react';
import api from '../utils/api';
import { Fuel, Clock, Zap } from 'lucide-react';

const Calculator = ({ onResult }) => {
  const [fuelPrice, setFuelPrice] = useState('');
  const [litres, setLitres] = useState('');
  const [amountSpent, setAmountSpent] = useState('');
  const [hours, setHours] = useState('');
  const [loading, setLoading] = useState(false);
  const [inputMode, setInputMode] = useState('litres'); // 'litres' or 'amount'

  const handleCalculate = async (e) => {
    e.preventDefault();
    setLoading(true);

    const fPrice = Number(fuelPrice);
    const hUsage = Number(hours);
    let lUsed = 0;

    if (inputMode === 'litres') {
      lUsed = Number(litres);
    } else {
      lUsed = fPrice > 0 ? Number(amountSpent) / fPrice : 0;
    }

    try {
      const res = await api.post('/calculate', {
        fuelPrice: fPrice,
        litresUsed: lUsed,
        usageHours: hUsage,
      });
      onResult({
        ...res.data,
        inputs: {
          fuelPrice: fPrice,
          litresUsed: lUsed,
          usageHours: hUsage,
        }
      });
    } catch (err) {
      console.error(err);
      alert('Error calculating costs');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg text-green-600">
            <Fuel size={20} />
          </div>
          <h2 className="text-lg font-bold text-gray-800">Fuel Calculator</h2>
        </div>
        
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setInputMode('litres')}
            className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
              inputMode === 'litres' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500'
            }`}
          >
            LITRES
          </button>
          <button
            onClick={() => setInputMode('amount')}
            className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
              inputMode === 'amount' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500'
            }`}
          >
            AMOUNT
          </button>
        </div>
      </div>

      <form onSubmit={handleCalculate} className="space-y-5">
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">
            Fuel Price (₦/Litre)
          </label>
          <div className="relative">
            <input
              type="number"
              value={fuelPrice}
              onChange={(e) => setFuelPrice(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-gray-900 font-semibold focus:bg-white transition-all"
              placeholder="e.g. 700"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">
              {inputMode === 'litres' ? 'Litres Used' : 'Amount Spent (₦)'}
            </label>
            <input
              type="number"
              value={inputMode === 'litres' ? litres : amountSpent}
              onChange={(e) => inputMode === 'litres' ? setLitres(e.target.value) : setAmountSpent(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-gray-900 font-semibold focus:bg-white transition-all"
              placeholder={inputMode === 'litres' ? "e.g. 10" : "e.g. 5000"}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">
              Usage Hours
            </label>
            <input
              type="number"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-gray-900 font-semibold focus:bg-white transition-all"
              placeholder="e.g. 5"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-green-600 text-white rounded-2xl font-bold shadow-lg shadow-green-100 hover:bg-green-700 hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-50"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Calculating...
            </div>
          ) : (
            'Calculate Daily Cost'
          )}
        </button>
      </form>
    </div>
  );
};

export default Calculator;
