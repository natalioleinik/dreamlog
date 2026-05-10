const express = require('express');
const router = express.Router();
const { generateImage, getUsageStatus } = require('../controllers/imageController');

router.post('/generate', generateImage);
router.get('/status', getUsageStatus);

module.exports = router;
