const express = require('express');
const reportController = require('../controllers/reportController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticateToken);

router.get('/daily', reportController.getDailyReport);
router.get('/month-to-date', reportController.getMonthToDateReport);
router.get('/monthly', reportController.getMonthlyReport);

module.exports = router;
