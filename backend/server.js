require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Groq = require('groq-sdk');
const Record = require('./models/Record');
const Settings = require('./models/Settings');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// MongoDB Connection (Handle errors gracefully for MVP)
let dbConnected = false;
let localRecords = []; // Temporary storage if DB is down
let localSettings = { monthly_budget: 50000 };

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/energycostai')
  .then(() => {
    console.log('MongoDB connected');
    dbConnected = true;
  })
  .catch(err => {
    console.warn('⚠️ MongoDB connection failed. History will not be saved, but Calculator and AI will work.');
    dbConnected = false;
  });

// Groq Config
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Helper for currency formatting
const formatCurrency = (amount) => `₦${amount.toLocaleString()}`;

// 1. Fuel Cost Calculation
app.post('/api/calculate', (req, res) => {
  const { fuelPrice, litresUsed, usageHours } = req.body;
  
  const totalCost = fuelPrice * litresUsed;
  const costPerHour = usageHours > 0 ? totalCost / usageHours : 0;
  const dailyCost = totalCost; // Assuming the input is for a day
  const monthlyCost = dailyCost * 30;

  res.json({
    totalCost,
    costPerHour,
    dailyCost,
    monthlyCost,
    usageHours,
    formatted: {
      totalCost: formatCurrency(totalCost),
      costPerHour: formatCurrency(costPerHour),
      dailyCost: formatCurrency(dailyCost),
      monthlyCost: formatCurrency(monthlyCost),
    }
  });
});

// 2. Save Record
app.post('/api/save-record', async (req, res) => {
  console.log('[BACKEND] Received save-record request:', req.body);
  const { fuelPrice, litresUsed, usageHours, isBusiness, profitImpact, date } = req.body;
  
  const fuel = Number(fuelPrice) || 0;
  const litres = Number(litresUsed) || 0;
  const hours = Number(usageHours) || 0;
  const totalCost = fuel * litres;
  const costPerHour = hours > 0 ? totalCost / hours : 0;

  const recordData = {
    _id: Date.now().toString(),
    date: date ? new Date(date) : new Date(),
    fuelPrice: fuel,
    litresUsed: litres,
    usageHours: hours,
    totalCost,
    costPerHour,
    isBusiness: !!isBusiness,
    profitImpact: Number(profitImpact) || 0
  };

  console.log(`[BACKEND] Processed Record: ₦${totalCost} | DB Connected: ${dbConnected}`);

  if (!dbConnected) {
    localRecords.unshift(recordData);
    console.log(`[BACKEND] Saved to local memory. Total records: ${localRecords.length}`);
    return res.status(201).json(recordData);
  }

  try {
    const newRecord = new Record(recordData);
    await newRecord.save();
    console.log(`[BACKEND] Saved to MongoDB.`);
    res.status(201).json(newRecord);
  } catch (err) {
    console.error(`[BACKEND] MongoDB save failed, falling back to memory.`, err);
    localRecords.unshift(recordData);
    res.status(201).json(recordData);
  }
});

// 3. Fetch History
app.get('/api/history', async (req, res) => {
  console.log(`[BACKEND] Fetching History. DB Connected: ${dbConnected}`);
  if (!dbConnected) {
    return res.json(localRecords.slice(0, 30));
  }
  try {
    const records = await Record.find().sort({ date: -1 }).limit(30);
    res.json(records);
  } catch (err) {
    res.json(localRecords.slice(0, 30));
  }
});

// 3a. Delete Record
app.delete('/api/history/:id', async (req, res) => {
  console.log(`[BACKEND] Deleting Record: ${req.params.id}`);
  if (!dbConnected) {
    localRecords = localRecords.filter(r => r._id !== req.params.id);
    return res.json({ message: "Record deleted from memory" });
  }
  try {
    await Record.findByIdAndDelete(req.params.id);
    res.json({ message: "Record deleted" });
  } catch (err) {
    localRecords = localRecords.filter(r => r._id !== req.params.id);
    res.json({ message: "Record deleted from memory" });
  }
});

// 3b. Analytics Summary
app.get('/api/analytics', async (req, res) => {
  console.log(`[BACKEND] Fetching Analytics. DB Connected: ${dbConnected} | Local Records: ${localRecords.length}`);
  if (!dbConnected) {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const weekly = localRecords
      .filter(r => {
        const recordDate = new Date(r.date);
        return recordDate >= weekAgo;
      })
      .reduce((acc, r) => ({ total: acc.total + r.totalCost, hours: acc.hours + r.usageHours }), { total: 0, hours: 0 });

    const monthly = localRecords
      .filter(r => {
        const recordDate = new Date(r.date);
        const isThisMonth = recordDate.getMonth() === now.getMonth() && recordDate.getFullYear() === now.getFullYear();
        console.log(`[BACKEND] Filtering record date: ${recordDate.toISOString()} | Is This Month: ${isThisMonth}`);
        return isThisMonth;
      })
      .reduce((acc, r) => ({ total: acc.total + r.totalCost, hours: acc.hours + r.usageHours }), { total: 0, hours: 0 });

    const totalHours = localRecords.reduce((acc, r) => acc + r.usageHours, 0);

    console.log(`[BACKEND] Memory Analytics: Weekly ₦${weekly.total} | Monthly ₦${monthly.total}`);
    return res.json({ weekly, monthly, totalHours });
  }

  try {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [weeklyData, monthlyData, totalData] = await Promise.all([
      Record.aggregate([
        { $match: { date: { $gte: weekAgo } } },
        { $group: { _id: null, total: { $sum: "$totalCost" }, hours: { $sum: "$usageHours" } } }
      ]),
      Record.aggregate([
        { 
          $match: { 
            date: { 
              $gte: new Date(now.getFullYear(), now.getMonth(), 1),
              $lte: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
            } 
          } 
        },
        { $group: { _id: null, total: { $sum: "$totalCost" }, hours: { $sum: "$usageHours" } } }
      ]),
      Record.aggregate([
        { $group: { _id: null, totalHours: { $sum: "$usageHours" } } }
      ])
    ]);

    const result = {
      weekly: weeklyData[0] || { total: 0, hours: 0 },
      monthly: monthlyData[0] || { total: 0, hours: 0 },
      totalHours: totalData[0]?.totalHours || 0
    };
    console.log(`[BACKEND] DB Analytics: Weekly ₦${result.weekly.total} | Monthly ₦${result.monthly.total}`);
    res.json(result);
  } catch (err) {
    res.json({ 
      weekly: { total: 0, hours: 0 }, 
      monthly: { total: 0, hours: 0 }, 
      totalHours: 0 
    });
  }
});

// 4. AI Savings Advice (Groq)
app.post('/api/ai-advice', async (req, res) => {
  const { userData } = req.body;
  const apiKey = process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.trim() : '';
  
  // Smart fallback if API key is not set or is the placeholder
  if (!apiKey || apiKey === 'your_groq_api_key_here') {
    let fallbackAdvice = "🇳🇬 Your Groq API key is not set yet. Here is your Energy Saving Plan:\n\n";
    
    if (userData.isBusiness && userData.inputs) {
      const revenue = userData.revenue || 1;
      const impact = (userData.totalCost / revenue) * 100;
      fallbackAdvice += `💼 BUSINESS TIP: Your fuel costs are consuming ${impact.toFixed(1)}% of your revenue. Consider switching to a gas-powered generator, as it is more cost-effective for long operations.\n\n`;
    }
    
    if (userData.usageHours > 8) {
      fallbackAdvice += `🔋 STORAGE TIP: You are running your generator for ${userData.usageHours} hours. Investing in a small inverter system with batteries could power your essentials and allow you to turn off the generator by 10 PM.\n\n`;
    }

    fallbackAdvice += "💡 GENERAL TIP: Use rechargeable fans instead of standard ones. They provide cooling for several hours even after the generator is turned off.";
    
    return res.json({ advice: fallbackAdvice });
  }

  try {
    const prompt = `
      User Energy Data:
      - Daily fuel cost: ₦${userData.dailyCost || userData.totalCost}
      - Generator usage: ${userData.usageHours || (userData.inputs && userData.inputs.usageHours)} hours
      - Is Business: ${userData.isBusiness ? 'Yes' : 'No'}

      Instruction:
      You are an energy cost advisor for Nigeria. Help users reduce generator and electricity costs. 
      Provide 3-4 BRIEF, practical, bullet-point tips in clear, professional English. 
      KEEP IT SHORT and direct. DO NOT write a long letter.
      Always focus on cost reduction and real-world Nigerian conditions.
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.3-70b-versatile",
    });

    res.json({ advice: chatCompletion.choices[0].message.content });
  } catch (err) {
    console.error('Groq Error:', err);
    res.status(500).json({ advice: `AI Error: ${err.message}. Please check your API key and internet connection.` });
  }
});

// 5. Comparison Tool
app.post('/api/compare', (req, res) => {
  const { genCost, gridCost } = req.body;
  const difference = Math.abs(genCost - gridCost);
  const cheaper = genCost < gridCost ? 'Generator' : 'Grid (Electricity)';
  
  res.json({
    cheaper,
    difference,
    message: `${cheaper} is cheaper by ₦${difference.toLocaleString()} per month.`
  });
});

// 6. Settings & Budget
app.get('/api/settings/budget', async (req, res) => {
  if (!dbConnected) return res.json({ value: localSettings.monthly_budget });
  try {
    const setting = await Settings.findOne({ key: 'monthly_budget' });
    res.json({ value: setting ? setting.value : localSettings.monthly_budget });
  } catch (err) {
    res.status(200).json({ value: localSettings.monthly_budget });
  }
});

app.post('/api/settings/budget', async (req, res) => {
  const { value } = req.body;
  const numValue = Number(value);
  
  if (!dbConnected) {
    localSettings.monthly_budget = numValue;
    return res.json({ key: 'monthly_budget', value: numValue, note: "Saved to memory only" });
  }

  try {
    const setting = await Settings.findOneAndUpdate(
      { key: 'monthly_budget' },
      { value: numValue },
      { upsert: true, new: true }
    );
    res.json(setting);
  } catch (err) {
    localSettings.monthly_budget = numValue;
    res.status(200).json({ value: numValue, error: "DB Error, saved to memory" });
  }
});

app.post('/api/settings/reset', (req, res) => {
  localRecords = [];
  localSettings = { monthly_budget: 50000 };
  console.log('[BACKEND] All local data has been reset.');
  res.json({ message: "All local data has been reset." });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  const key = process.env.GROQ_API_KEY || '';
  console.log(`API Key detected: ${key.substring(0, 7)}...`);
});
