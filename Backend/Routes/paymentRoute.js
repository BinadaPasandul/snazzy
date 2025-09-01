const express = require('express');
const router = express.Router();
const { createPayment, addCard, getCards, updateCard, deleteCard, getCard } = require('../Controllers/paymentController');

router.post('/pay', createPayment);
router.post('/add', addCard);
router.get('/cards/:userId', getCards);
router.get('/card/:cardId', getCard);
router.put('/card/:cardId', updateCard);
router.delete('/card/:userId/:cardId', deleteCard);
router.get('/test', (req, res) => res.send('Payment route works!'));

module.exports = router;
