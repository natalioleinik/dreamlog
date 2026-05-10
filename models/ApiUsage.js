const mongoose = require('mongoose');

const apiUsageSchema = new mongoose.Schema({
  date: { type: String, required: true, unique: true }, // YYYY-MM-DD
  count: { type: Number, default: 0 },
  limit: { type: Number, default: 20 },
});

module.exports = mongoose.model('ApiUsage', apiUsageSchema);
