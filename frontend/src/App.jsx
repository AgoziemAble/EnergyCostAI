import React, { useState, useEffect } from 'react';
import api from './utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import Calculator from './components/Calculator';
import ExpenseTracker from './components/ExpenseTracker';
import LoadEstimator from './components/LoadEstimator';
import AIAdvisor from './components/AIAdvisor';
import CostComparison from './components/CostComparison';
import BusinessMode from './components/BusinessMode';
import SolarCalculator from './components/SolarCalculator';
import MaintenanceTracker from './components/MaintenanceTracker';
import BudgetTracker from './components/BudgetTracker';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: 'spring', stiffness: 100 }
  }
};

function App() {
  const [results, setResults] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isBusiness, setIsBusiness] = useState(false);
  const [revenue, setRevenue] = useState('');
  const [analytics, setAnalytics] = useState({ weekly: { total: 0, hours: 0 }, monthly: { total: 0, hours: 0 }, totalHours: 0 });
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    fetchAnalytics();
    fetchChartData();
  }, [refreshTrigger]);

  const fetchAnalytics = async () => {
    try {
      console.log('[FRONTEND] Fetching analytics...');
      const res = await api.get('/analytics');
      console.log('[FRONTEND] Analytics response:', res.data);
      if (res.data) {
        setAnalytics(res.data);
      }
    } catch (err) {
      console.warn('Could not fetch analytics:', err);
      setAnalytics({ weekly: { total: 0, hours: 0 }, monthly: { total: 0, hours: 0 }, totalHours: 0 });
    }
  };

  const fetchChartData = async () => {
    try {
      const res = await api.get('/history');
      if (Array.isArray(res.data)) {
        const data = [...res.data].reverse().map(r => ({
          date: new Date(r.date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' }),
          cost: r.totalCost
        }));
        setChartData(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCalculation = async (data) => {
    setResults(data);
    const totalCost = data.totalCost;
    const profitImpact = (isBusiness && revenue > 0) ? (totalCost / Number(revenue)) * 100 : 0;

    try {
      console.log('[FRONTEND] Saving record with data:', data);
      const saveRes = await api.post('/save-record', {
        fuelPrice: data.inputs.fuelPrice,
        litresUsed: data.inputs.litresUsed,
        usageHours: data.inputs.usageHours,
        isBusiness,
        profitImpact,
        date: new Date().toISOString() // Explicitly send current date
      });
      console.log('[FRONTEND] Save response:', saveRes.data);
      
      // Force a refresh of analytics
      await fetchAnalytics();
      await fetchChartData();
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error('Failed to save record:', err);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Reset all local data? This cannot be undone.')) return;
    try {
      await api.post('/settings/reset');
      window.location.reload();
    } catch (err) {
      console.error('Reset failed:', err);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning 🌅";
    if (hour < 17) return "Good Afternoon ☀️";
    return "Good Evening 🌙";
  };

  return (
    <div className="min-h-screen pb-12 overflow-x-hidden bg-[#f8fafc]">
      {/* Background Decor */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-500/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-amber-500/5 rounded-full blur-[100px]"></div>
      </div>

      {/* Premium Header */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', damping: 20 }}
        className="bg-white/70 backdrop-blur-xl sticky top-0 z-50 border-b border-gray-100 py-4 px-6 mb-8 shadow-sm"
      >
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-green-500 to-green-700 rounded-2xl flex items-center justify-center shadow-lg shadow-green-200">
              <span className="text-white text-xl font-bold">E</span>
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-gray-900 leading-none">EnergyCost AI</h1>
              <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest mt-1">Professional Edition 🇳🇬</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleReset}
              className="p-2.5 bg-red-50 text-red-600 rounded-xl border border-red-100 hover:bg-red-100 transition-colors"
              title="Reset All Data"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="p-2.5 bg-green-50 text-green-700 rounded-xl border border-green-100 hover:bg-green-100 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
            </button>
          </div>
        </div>
      </motion.header>

      <motion.main 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-md mx-auto px-4 space-y-8"
      >
        {/* Welcome Section */}
        <motion.div variants={itemVariants} className="px-2">
          <p className="text-sm font-bold text-green-600 mb-1">{getGreeting()}</p>
          <h2 className="text-3xl font-black text-gray-900 leading-tight">Track your energy costs today.</h2>
        </motion.div>

        {/* Trend Chart */}
        {chartData.length > 1 && (
          <motion.div variants={itemVariants} className="glass-card rounded-3xl p-6 overflow-hidden">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">Spending Trend</h3>
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#008751" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#008751" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{fill: '#9ca3af'}} 
                  />
                  <Tooltip 
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                    labelStyle={{fontWeight: 'bold', fontSize: '12px'}}
                  />
                  <Area type="monotone" dataKey="cost" stroke="#008751" strokeWidth={3} fillOpacity={1} fill="url(#colorCost)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {/* Analytics Summary */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
          <div className="glass-card p-5 rounded-3xl">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Weekly Spend</p>
            <p className="text-xl font-black text-gray-900">₦{(analytics?.weekly?.total || 0).toLocaleString()}</p>
            <p className="text-[9px] font-bold text-green-600 mt-1">{(analytics?.weekly?.hours || 0)}h usage</p>
          </div>
          <div className="glass-card p-5 rounded-3xl">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Monthly Spend</p>
            <p className="text-xl font-black text-gray-900">₦{(analytics?.monthly?.total || 0).toLocaleString()}</p>
            <p className="text-[9px] font-bold text-green-600 mt-1">{(analytics?.monthly?.hours || 0)}h usage</p>
          </div>
        </motion.div>

        {/* Animated Summary Card */}
        <AnimatePresence>
          {results && (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative overflow-hidden bg-gradient-to-br from-green-600 to-green-700 text-white p-6 rounded-3xl shadow-2xl shadow-green-200"
            >
              <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
              <h3 className="text-sm font-bold mb-6 flex items-center gap-2 opacity-90 uppercase tracking-wider">
                <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>
                Instant Analysis
              </h3>
              <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                <div>
                  <p className="text-[10px] text-green-100 font-bold uppercase tracking-widest mb-1">Total Cost</p>
                  <p className="text-3xl font-extrabold">{results.formatted.totalCost}</p>
                </div>
                <div>
                  <p className="text-[10px] text-green-100 font-bold uppercase tracking-widest mb-1">Cost / Hour</p>
                  <p className="text-3xl font-extrabold">{results.formatted.costPerHour}</p>
                </div>
                <div className="col-span-2 pt-4 border-t border-white/10">
                  <p className="text-[10px] text-green-100 font-bold uppercase tracking-widest mb-1">Monthly Forecast</p>
                  <p className="text-3xl font-extrabold text-brand-amber">{results.formatted.monthlyCost}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div 
          key={`budget-${analytics.monthly.total}`}
          variants={itemVariants} 
          className="glass-card rounded-3xl overflow-hidden border-2 border-green-100 shadow-xl shadow-green-50"
        >
          <BudgetTracker 
            currentSpending={analytics?.monthly?.total || 0} 
            onBudgetChange={fetchAnalytics}
          />
        </motion.div>

        <motion.div variants={itemVariants} className="glass-card rounded-3xl overflow-hidden">
          <Calculator onResult={handleCalculation} />
        </motion.div>

        <motion.div variants={itemVariants} className="glass-card rounded-3xl overflow-hidden">
          <MaintenanceTracker totalHours={analytics.totalHours} />
        </motion.div>
        
        <motion.div variants={itemVariants} className="glass-card rounded-3xl overflow-hidden">
          <BusinessMode 
            totalCost={results ? results.totalCost : 0} 
            isBusiness={isBusiness}
            setIsBusiness={setIsBusiness}
            revenue={revenue}
            setRevenue={setRevenue}
          />
        </motion.div>

        <motion.div variants={itemVariants} className="rounded-3xl overflow-hidden">
          <AIAdvisor userData={results} />
        </motion.div>

        <motion.div variants={itemVariants} className="glass-card rounded-3xl overflow-hidden">
          <SolarCalculator monthlyFuelCost={results ? results.monthlyCost : analytics.monthly.total} />
        </motion.div>

        <motion.div variants={itemVariants} className="glass-card rounded-3xl overflow-hidden">
          <LoadEstimator />
        </motion.div>

        <motion.div variants={itemVariants} className="glass-card rounded-3xl overflow-hidden">
          <CostComparison genMonthlyCost={results ? results.monthlyCost : analytics.monthly.total} />
        </motion.div>

        <motion.div variants={itemVariants} className="glass-card rounded-3xl overflow-hidden">
          <ExpenseTracker refreshTrigger={refreshTrigger} />
        </motion.div>

        <footer className="text-center py-8">
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">EnergyCost AI Professional</p>
          <div className="flex justify-center gap-4 text-gray-300">
             <span className="text-xs">Built for Nigeria © 2026</span>
          </div>
        </footer>
      </motion.main>
    </div>
  );
}

export default App;
