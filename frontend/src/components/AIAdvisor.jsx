import React, { useState } from 'react';
import api from '../utils/api';
import { Brain, Sparkles, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AIAdvisor = ({ userData }) => {
  const [advice, setAdvice] = useState('');
  const [loading, setLoading] = useState(false);

  const getAdvice = async () => {
    if (!userData || !userData.totalCost) {
      alert('Please calculate your cost first to get personalized advice!');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/ai-advice', { userData });
      setAdvice(res.data.advice);
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.advice || "I'm having trouble connecting to the advisor. Please try again in a moment!";
      setAdvice(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative overflow-hidden bg-white rounded-3xl shadow-xl shadow-indigo-100 border border-indigo-50">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/5 rounded-full -ml-12 -mb-12 blur-2xl"></div>

      <div className="p-6 relative">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-200">
              <Brain size={20} />
            </div>
            <h2 className="text-lg font-bold text-gray-800">AI Savings Advisor</h2>
          </div>
          <Sparkles className="text-indigo-400 animate-pulse" size={18} />
        </div>
        
        <AnimatePresence mode="wait">
          {advice ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-indigo-50/50 rounded-2xl p-5 mb-6 border border-indigo-100"
            >
              <div className="text-sm leading-relaxed text-indigo-900 font-medium whitespace-pre-line">
                {advice}
              </div>
            </motion.div>
          ) : (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-gray-500 mb-8 leading-relaxed italic"
            >
              "Get smart, data-driven tips to reduce your generator spending and optimize energy use in Nigeria."
            </motion.p>
          )}
        </AnimatePresence>

        <button
          onClick={getAdvice}
          disabled={loading}
          className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Analyzing Energy Data...</span>
            </>
          ) : (
            <>
              <Send size={18} />
              <span>Get AI Advice</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AIAdvisor;
