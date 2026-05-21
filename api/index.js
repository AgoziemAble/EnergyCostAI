const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Groq = require('groq-sdk');
const Record = require('./models/Record');
const Settings = require('./models/Settings');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
let dbConnected = false;
let localRecords = [];
let localSettings = { monthly_budget: 50000 };

const connectDB = async () => {
  if (dbConnected) return;
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    dbConnected = true;
    console.log('MongoDB Connected');
  } catch (err) {
    console.warn('DB Connection failed, using memory fallback');
    dbConnected = false;
  }
};

// Groq Config
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const formatCurrency = (amount) => `₦${amount.toLocaleString()}`;

// API Routes
app.post('/api/calculate', (req, res) => {
  const { fuelPrice, litresUsed, usageHours } = req.body;
  const totalCost = fuelPrice * litresUsed;
  const costPerHour = usageHours > 0 ? totalCost / usageHours : 0;
  const monthlyCost = totalCost * 30;

  res.json({
    totalCost, costPerHour, monthlyCost, usageHours,
    formatted: {
      totalCost: formatCurrency(totalCost),
      costPerHour: formatCurrency(costPerHour),
      monthlyCost: formatCurrency(monthlyCost),
    }
  });
});

app.post('/api/save-record', async (req, res) => {
  await connectDB();
  const { fuelPrice, litresUsed, usageHours, isBusiness, profitImpact, date } = req.body;
  const fuel = Number(fuelPrice) || 0;
  const litres = Number(litresUsed) || 0;
  const hours = Number(usageHours) || 0;
  const totalCost = fuel * litres;

  const recordData = {
    _id: Date.now().toString(),
    date: date ? new Date(date) : new Date(),
    fuelPrice: fuel, litresUsed: litres, usageHours: hours,
    totalCost, costPerHour: hours > 0 ? totalCost / hours : 0,
    isBusiness: !!isBusiness, profitImpact: Number(profitImpact) || 0
  };

  if (!dbConnected) {
    localRecords.unshift(recordData);
    return res.status(201).json(recordData);
  }

  try {
    const newRecord = new Record(recordData);
    await newRecord.save();
    res.status(201).json(newRecord);
  } catch (err) {
    localRecords.unshift(recordData);
    res.status(201).json(recordData);
  }
});

app.get('/api/analytics', async (req, res) => {
  await connectDB();
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  if (!dbConnected) {
    const weekly = localRecords.filter(r => new Date(r.date) >= weekAgo)
      .reduce((acc, r) => ({ total: acc.total + r.totalCost, hours: acc.hours + r.usageHours }), { total: 0, hours: 0 });
    const monthly = localRecords.filter(r => new Date(r.date).getMonth() === now.getMonth())
      .reduce((acc, r) => ({ total: acc.total + r.totalCost, hours: acc.hours + r.usageHours }), { total: 0, hours: 0 });
    return res.json({ weekly, monthly, totalHours: localRecords.reduce((acc, r) => acc + r.usageHours, 0) });
  }

  try {
    const [weeklyData, monthlyData, totalData] = await Promise.all([
      Record.aggregate([{ $match: { date: { $gte: weekAgo } } }, { $group: { _id: null, total: { $sum: "$totalCost" }, hours: { $sum: "$usageHours" } } }]),
      Record.aggregate([{ $match: { date: { $gte: new Date(now.getFullYear(), now.getMonth(), 1) } } }, { $group: { _id: null, total: { $sum: "$totalCost" }, hours: { $sum: "$usageHours" } } }]),
      Record.aggregate([{ $group: { _id: null, totalHours: { $sum: "$usageHours" } } }])
    ]);
    res.json({
      weekly: weeklyData[0] || { total: 0, hours: 0 },
      monthly: monthlyData[0] || { total: 0, hours: 0 },
      totalHours: totalData[0]?.totalHours || 0
    });
  } catch (err) {
    res.json({ weekly: { total: 0, hours: 0 }, monthly: { total: 0, hours: 0 }, totalHours: 0 });
  }
});

app.get('/api/history', async (req, res) => {
  await connectDB();
  if (!dbConnected) return res.json(localRecords.slice(0, 30));
  try {
    const records = await Record.find().sort({ date: -1 }).limit(30);
    res.json(records);
  } catch (err) {
    res.json(localRecords.slice(0, 30));
  }
});

app.post('/api/ai-advice', async (req, res) => {
  const { userData } = req.body;
  try {
    const prompt = `Energy advisor Nigeria. User: Daily ₦${userData.totalCost}, ${userData.usageHours}h, Business: ${userData.isBusiness}. Provide 3 short practical tips.`;
    const chat = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
    });
    res.json({ advice: chat.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ advice: "AI Error. Try again." });
  }
});

app.get('/api/settings/budget', async (req, res) => {
  await connectDB();
  if (!dbConnected) return res.json({ value: localSettings.monthly_budget });
  try {
    const s = await Settings.findOne({ key: 'monthly_budget' });
    res.json({ value: s ? s.value : 50000 });
  } catch (err) { res.json({ value: 50000 }); }
});

app.post('/api/settings/budget', async (req, res) => {
  await connectDB();
  const val = Number(req.body.value);
  if (!dbConnected) { localSettings.monthly_budget = val; return res.json({ value: val }); }
  try {
    const s = await Settings.findOneAndUpdate({ key: 'monthly_budget' }, { value: val }, { upsert: true, new: true });
    res.json(s);
  } catch (err) { res.json({ value: val }); }
});

module.exports = app;
