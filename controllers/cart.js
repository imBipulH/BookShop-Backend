const express = require('express')
const router = express.Router()
const Cart = require('../models/cart')

// Add item to cart
exports.addToCart = async (req, res) => {
  const { productId, quantity = 1, price } = req.body
  const cartId = req.cartId
  const query = req.user ? { userId: cartId } : { sessionId: cartId }

  try {
    let cart = await Cart.findOne(query)

    if (!cart) {
      cart = new Cart({ ...query, items: [] })
    }

    // Check if the item is already in the cart
    const itemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId
    )

    if (itemIndex > -1) {
      // Item exists in cart, update the quantity
      cart.items[itemIndex].quantity = Number(
        cart.items[itemIndex].quantity + Number(quantity || 1)
      )
    } else {
      // New item, push to cart
      cart.items.push({ productId, quantity: Number(quantity || 1), price })
    }

    await cart.save()
    res.json(cart)
  } catch (error) {
    res.status(500).json({ error: 'Error adding item to cart', messege: error })
  }
}

// View cart
exports.cart = async (req, res) => {
  const cartId = req.cartId
  const query = req.user ? { userId: cartId } : { sessionId: cartId }
  try {
    const cart = await Cart.findOne(query).populate(
      'items.productId',
      'title author price'
    )
    res.json(cart || { items: [] })
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving cart' })
  }
}

// Remove item from cart
exports.deleteCart = async (req, res) => {
  const { productId } = req.body
  const cartId = req.cartId
  const query = req.user ? { userId: cartId } : { sessionId: cartId }

  try {
    const cart = await Cart.findOne(query)
    if (cart) {
      cart.items = cart.items.filter(
        item => item.productId.toString() !== productId
      )
      await cart.save()
    }
    res.json(cart || { items: [] })
  } catch (error) {
    res.status(500).json({ error: 'Error removing item from cart' })
  }
}
