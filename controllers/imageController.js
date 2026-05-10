const axios = require('axios');
const Dream = require('../models/Dream');
const ApiUsage = require('../models/ApiUsage');

const getTodayKey = () => new Date().toISOString().slice(0, 10);

const getUsageStatus = async (req, res) => {
  try {
    const today = getTodayKey();
    const usage = await ApiUsage.findOne({ date: today });
    const count = usage ? usage.count : 0;
    const limit = 20;
    res.json({ date: today, used: count, limit, remaining: limit - count });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch usage status' });
  }
};

const generateImage = async (req, res) => {
  try {
    const { dreamId } = req.body;
    if (!dreamId) return res.status(400).json({ error: 'dreamId is required' });

    const dream = await Dream.findById(dreamId);
    if (!dream) return res.status(404).json({ error: 'Dream not found' });

    // Check daily limit
    const today = getTodayKey();
    let usage = await ApiUsage.findOne({ date: today });
    if (!usage) usage = new ApiUsage({ date: today, count: 0 });

    if (usage.count >= usage.limit) {
      return res.status(429).json({
        error: 'Daily image generation limit reached (20/day). Try again tomorrow.',
      });
    }

    const prompt = `Dream scene: ${dream.title}. ${dream.description.slice(0, 300)}. Surreal, ethereal, dreamlike artwork.`;
    const encodedPrompt = encodeURIComponent(prompt);

    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=500&height=500&nologo=true&model=flux`;

    const response = await axios.get(pollinationsUrl, {
      responseType: 'arraybuffer',
      timeout: 90000,
    });

    const base64 = Buffer.from(response.data, 'binary').toString('base64');
    const mimeType = response.headers['content-type'] || 'image/jpeg';
    const imageUrl = `data:${mimeType};base64,${base64}`;

    dream.imageUrl = imageUrl;
    dream.imagePrompt = prompt;
    dream.generatedAt = new Date();
    await dream.save();

    usage.count += 1;
    await usage.save();

    res.json({ imageUrl, prompt, remaining: usage.limit - usage.count });
  } catch (err) {
    if (err.code === 'ECONNABORTED') {
      return res.status(504).json({ error: 'Image generation timed out. Please try again.' });
    }
    res.status(500).json({ error: 'Image generation failed' });
  }
};

module.exports = { generateImage, getUsageStatus };
