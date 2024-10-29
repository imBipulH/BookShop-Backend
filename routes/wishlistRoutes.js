const express = require('express')
const {
  addToWishlist,
  removeFromWishlist,
  getWishlist
} = require('../controllers/wishlist')
const router = express.Router()

router.post('/add', addToWishlist)
router.post('/remove', removeFromWishlist)
router.get('/', getWishlist)

module.exports = router
