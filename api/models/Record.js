const mongoose = require('mongoose');

const RecordSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  fuelPrice: { type: Number, required: true },
  litresUsed: { type: Number, required: true },
  usageHours: { type: Number, required: true },
  totalCost: { type: Number, required: true },
  costPerHour: { type: Number, required: true },
  isBusiness: { type: Boolean, default: false },
  profitImpact: { type: Number, default: 0 },
});

module.exports = mongoose.model('Record', RecordSchema);
