const express = require('express')
const router = express.Router()
const {
  addToCart,
  cart,
  deleteCart,
  selectProduct,
  updateCartItemQty,
  cartItemSelect,
  selectAll
} = require('../controllers/cart')
const checkUserAndMergeCart = require('../middleware/cartMiddleware')
const optionalProtect = require('../middleware/cartProtect')
// Routes
router.post('/', optionalProtect, checkUserAndMergeCart, addToCart)
router.get('/', optionalProtect, cart)
router.delete('/:productId', optionalProtect, deleteCart)
router.put('/update', optionalProtect, updateCartItemQty)
router.put('/', optionalProtect, selectProduct)
router.put('/select-item', optionalProtect, cartItemSelect)
router.put('/select-all', optionalProtect, selectAll)

module.exports = router
