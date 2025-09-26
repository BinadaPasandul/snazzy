// Routes/refundRoute.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../Middleware/authMiddleware');
const {
  createRefundRequest,
  handleRefund,
  getUserRefunds,
  getAllRefunds
} = require('../Controllers/refundController');

// User routes
router.post('/request/:paymentId', authMiddleware('customer'), createRefundRequest);
router.get('/my-requests', authMiddleware('customer'), getUserRefunds);

// Admin routes
router.get('/all', authMiddleware('admin'), getAllRefunds);
router.put('/handle/:requestId', authMiddleware('admin'), handleRefund);

//Test
router.get('/test',(req, res) => {
  res.status(200).json({ message: 'refund route', user: req.user });
});

module.exports = router;
