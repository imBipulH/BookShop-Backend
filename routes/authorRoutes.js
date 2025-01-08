const express = require('express')
const router = express.Router()
const { addAuthor, getAllAuthors } = require('../controllers/author')
// Routes
router.post('/', addAuthor)
router.get('/', getAllAuthors)

module.exports = router
