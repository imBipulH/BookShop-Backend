const express = require('express')
const router = express.Router()
const { addToCart, cart, deleteCart } = require('../controllers/cart')
// Routes
router.post('/', addToCart)
router.get('/', cart)
router.delete('/', deleteCart)

module.exports = router
