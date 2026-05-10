const express = require('express');
const router = express.Router();
const {
  getAllDreams,
  getDream,
  createDream,
  updateDream,
  deleteDream,
} = require('../controllers/dreamController');

router.get('/', getAllDreams);
router.get('/:id', getDream);
router.post('/', createDream);
router.put('/:id', updateDream);
router.delete('/:id', deleteDream);

module.exports = router;
