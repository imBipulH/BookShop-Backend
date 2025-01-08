const express = require('express')
const {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus
} = require('../controllers/order')
const { protect } = require('../middleware/auth')
const router = express.Router()

router.post('/create', protect, createOrder)
router.get('/user/:userId', getUserOrders)
router.get('/:orderId', getOrderById)
router.patch('/:orderId/status', updateOrderStatus)

module.exports = router
