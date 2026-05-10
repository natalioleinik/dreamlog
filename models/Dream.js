const mongoose = require('mongoose');

const dreamSchema = new mongoose.Schema(
  {
    userId: { type: String, default: 'default' },
    title: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, required: true, trim: true },
    imageUrl: { type: String, default: null },
    imagePrompt: { type: String, default: null },
    generatedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Dream', dreamSchema);
