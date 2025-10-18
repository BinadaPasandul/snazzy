const express = require('express');
const router = express.Router();
const auth = require('../Middleware/authMiddleware');
const { getMonthlyFinancialReport } = require('../Controllers/reportController');

// Admin-only monthly report
router.get('/monthly', auth('order_manager'), getMonthlyFinancialReport);

module.exports = router;


