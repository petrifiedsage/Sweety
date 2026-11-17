const express = require('express');
const jobController = require('../controllers/jobController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticateToken);

router.get('/reminders', jobController.getDailyReminderStatus);
router.post('/reminders/trigger', jobController.triggerDailyReminderJob);

module.exports = router;
