const express = require('express');
const router = express.Router();
const { submitContactForm } = require('../Controllers/ContactController');

// POST /contact/submit - Submit contact form
router.post('/submit', submitContactForm);

module.exports = router;
