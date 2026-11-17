const express = require('express');
const readingController = require('../controllers/readingController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticateToken);

router.post('/', readingController.createReading);
router.get('/', readingController.getReadings);
router.get('/:id', readingController.getReadingById);
router.put('/:id', readingController.updateReading);
router.delete('/:id', readingController.deleteReading);

module.exports = router;
