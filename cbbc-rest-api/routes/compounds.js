const express = require('express');
const router = express.Router();
const controller = require('../api/controllers/compoundController');

router.post('/save', controller.save);
router.post('/find', controller.find);

module.exports = router;
