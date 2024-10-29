const express = require('express')
const {
  getAllReviews,
  getBookWithApprovedReviews,
  approveReview,
  rejectReview,
  addReview
} = require('../controllers/review')
const router = express.Router()

router.post('/:bookId', addReview)
router.get('/books/:bookId', getBookWithApprovedReviews)
router.post('/approve', approveReview)
router.post('/reject', rejectReview)
router.get('/admin', getAllReviews)

module.exports = router
