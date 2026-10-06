const express = require('express');
const eventController = require('../controllers/eventController');

const router = express.Router();

router.get('/example', eventController.getExampleEvent);

module.exports = router;