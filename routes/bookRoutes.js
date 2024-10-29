const express = require('express')
const {
  addBook,
  getAllBooks,
  getBookById,
  updateBook,
  searchBook
} = require('../controllers/book')
const router = express.Router()

router.post('/create', addBook)
router.get('/', getAllBooks)
router.get('/:id', getBookById)
router.put('/:id', updateBook)
router.get('/search', searchBook)

module.exports = router
