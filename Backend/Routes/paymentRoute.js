const express = require('express');
const router = express.Router();
const authMiddleware = require('../Middleware/authMiddleware');
const {
  createPayment, addCard, getCards, getCard, updateCard, deleteCard, getPayments
} = require('../Controllers/paymentController');

router.post('/pay', authMiddleware(), createPayment);
router.post('/add', authMiddleware(), addCard);
router.get('/payments', authMiddleware(), getPayments);
router.get('/cards', authMiddleware(), getCards);
router.get('/card/:cardId', authMiddleware(), getCard);
router.put('/card/:cardId', authMiddleware(), updateCard);
router.delete('/card/:cardId', authMiddleware(), deleteCard);
//test route
router.get('/test',(req, res) => {
  res.status(200).json({ message: 'Payment route', user: req.user });
});

module.exports = router;
