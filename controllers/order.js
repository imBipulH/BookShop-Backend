const Order = require('../models/order')
const Cart = require('../models/cart') // Assuming you have a Cart model

// Create a new order
exports.createOrder = async (req, res) => {
  const { userId, paymentMethod, shippingAddress } = req.body

  try {
    // Fetch user's cart
    const cart = await Cart.findOne({ userId }).populate('items.productId')

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' })
    }

    // Calculate total price
    const totalPrice = cart.items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    )

    // Prepare order items
    const orderItems = cart.items.map(item => ({
      productId: item.productId._id,
      quantity: item.quantity,
      price: item.price
    }))

    // Create new order
    const newOrder = new Order({
      userId,
      items: orderItems,
      totalPrice,
      paymentMethod,
      shippingAddress
    })

    await newOrder.save()

    // Clear the user's cart after placing order
    await Cart.deleteOne({ userId })

    res.status(201).json(newOrder)
  } catch (error) {
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
    const order = await Order.findById(orderId).populate(
      'items.productId',
      'title author price'
    )

    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
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
