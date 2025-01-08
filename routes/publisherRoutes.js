const express = require('express')
const router = express.Router()
const { addPublisher, getPublishers } = require('../controllers/publisher')
// Routes
router.post('/', addPublisher)
router.get('/', getPublishers)

module.exports = router
