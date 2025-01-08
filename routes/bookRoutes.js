const express = require('express')
const multer = require('multer')
const {
  addBook,
  getAllBooks,
  getBookById,
  updateBook,
  searchBook,
  deleteBook
} = require('../controllers/book')
const { uploadBooks } = require('../controllers/csvUpload')
const router = express.Router()

const upload = multer({ dest: 'uploads/' })

router.post('/create', addBook)
router.get('/', getAllBooks)
router.get('/search', searchBook)
router.get('/:id', getBookById)
router.put('/:id', updateBook)
router.delete('/:id', deleteBook)
router.post('/upload-csv', upload.single('file'), uploadBooks)

module.exports = router
