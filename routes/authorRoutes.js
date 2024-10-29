const express = require('express')
const router = express.Router()
const { addAuthor } = require('../controllers/author')
// Routes
router.post('/', addAuthor)

module.exports = router
