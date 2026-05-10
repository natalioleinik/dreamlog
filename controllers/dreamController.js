const Dream = require('../models/Dream');

const getAllDreams = async (req, res) => {
  try {
    const dreams = await Dream.find().sort({ createdAt: -1 });
    res.json(dreams);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch dreams' });
  }
};

const getDream = async (req, res) => {
  try {
    const dream = await Dream.findById(req.params.id);
    if (!dream) return res.status(404).json({ error: 'Dream not found' });
    res.json(dream);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch dream' });
  }
};

const createDream = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }
    const dream = new Dream({ title: title.trim(), description: description.trim() });
    await dream.save();
    res.status(201).json(dream);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create dream' });
  }
};

const updateDream = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }
    const dream = await Dream.findByIdAndUpdate(
      req.params.id,
      { title: title.trim(), description: description.trim() },
      { new: true, runValidators: true }
    );
    if (!dream) return res.status(404).json({ error: 'Dream not found' });
    res.json(dream);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update dream' });
  }
};

const deleteDream = async (req, res) => {
  try {
    const dream = await Dream.findByIdAndDelete(req.params.id);
    if (!dream) return res.status(404).json({ error: 'Dream not found' });
    res.json({ message: 'Dream deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete dream' });
  }
};

module.exports = { getAllDreams, getDream, createDream, updateDream, deleteDream };
