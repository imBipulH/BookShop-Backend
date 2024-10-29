const express = require('express')
const router = express.Router()
const { addPublisher } = require('../controllers/publisher')
// Routes
router.post('/', addPublisher)

module.exports = router
