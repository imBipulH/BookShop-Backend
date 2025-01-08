const Order = require('../models/order')
const Cart = require('../models/cart')
const Address = require('../models/address')

// Create a new order
exports.createOrder = async (req, res) => {
  const {
    paymentMethod,
    shippingAddressId,
    discount = 0,
    deliveryCharge
  } = req.body
  const userId = req.user._id
  try {
    let cart = await Cart.findOne({ userId: req.user._id }).populate(
      'items.productId',
      'title price'
    )

    if (!cart || !cart.items.some(item => item.isMarked)) {
      return res.status(400).json({ message: 'No items marked for ordering.' })
    }
    const markedItems = cart.items.filter(item => item.isMarked)
    const orderItems = markedItems.map(item => ({
      productId: item.productId._id,
      title: item.productId.title,
      quantity: item.quantity,
      price: item.productId.price
    }))
    const totalAmount = markedItems.reduce((total, item) => {
      return total + item.quantity * item.productId.price
    }, 0)

    const discountPrice = Math.max(totalAmount - discount, 0)
    const vat = (discountPrice * 5) / 100
    const charge = deliveryCharge || 60
    const totalPrice = discountPrice + vat + charge

    // Check if the shipping address exists and belongs to the user
    const shippingAddress = await Address.findOne({
      _id: shippingAddressId
    })
    if (!shippingAddress) {
      return res.status(404).json({
        error: 'Shipping address not found or does not belong to the user'
      })
    }

    const newOrder = new Order({
      userId,
      items: orderItems,
      discount,
      vat,
      shippingCharge: charge,
      totalPrice,
      paymentMethod,
      shippingAddress: shippingAddressId
    })

    await newOrder.save()

    // Remove marked items from the cart
    cart.items = cart.items.filter(item => !item.isMarked)
    await cart.save()

    res.status(201).json(newOrder)
  } catch (error) {
    console.error('Error creating order:', error)
    res.status(500).json({ error: 'Error creating order' })
  }
}

// Get all orders for a specific user
exports.getUserOrders = async (req, res) => {
  const userId = req.params.userId

  try {
    const orders = await Order.find({ userId })
      .populate('items.productId', 'title price')
      .sort({ createdAt: -1 })

    res.status(200).json(orders)
  } catch (error) {
    res.status(500).json({ error: 'Error fetching user orders' })
  }
}

// Get a specific order by ID
exports.getOrderById = async (req, res) => {
  const orderId = req.params.orderId

  try {
    const order = await Order.findById(orderId)
      .populate('items.productId', 'title author price')
      .populate('shippingAddress')

    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    if (
      order.userId.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ error: 'Access denied' })
    }

    res.status(200).json(order)
  } catch (error) {
    res.status(500).json({ error: 'Error fetching order details' })
  }
}

// Update order status
exports.updateOrderStatus = async (req, res) => {
  const orderId = req.params.orderId
  const { status } = req.body

  // Check for valid status
  const validStatuses = [
    'pending',
    'processing',
    'shipped',
    'delivered',
    'canceled'
  ]
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' })
  }

  try {
    const order = await Order.findById(orderId)

    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    order.status = status
    await order.save()

    res.status(200).json(order)
  } catch (error) {
    res.status(500).json({ error: 'Error updating order status' })
  }
}
