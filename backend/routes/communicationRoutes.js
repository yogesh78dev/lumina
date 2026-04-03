
const express = require('express');
const router = express.Router();
const commController = require('../controllers/communicationController');

router.get('/emails/:leadId', commController.getEmails);
router.post('/emails', commController.sendEmail);
router.get('/whatsapp/:leadId', commController.getWhatsApp);
router.post('/whatsapp', commController.sendWhatsApp);

module.exports = router;
