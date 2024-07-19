const express = require('express');
const history = require('./history');
const sensors = require('./sensors');

const router = express.Router();

// Subroutes
router.use('/history', history);
router.use('/sensors', sensors);

module.exports = router;