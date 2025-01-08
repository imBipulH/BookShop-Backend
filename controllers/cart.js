const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const Cart = require('../models/cart')

// Add item to cart
exports.addToCart = async (req, res) => {
  console.log('req.user of cart', req.user)

  const { productId, quantity = 1, price } = req.body
  const cartId = req.user ? req.user._id : req.sessionID
  const query = req.user ? { userId: cartId } : { sessionId: cartId }

  try {
    let cart = await Cart.findOne(query)

    if (!cart) {
      cart = new Cart({ ...query, items: [] })
      await cart.save()

      if (req.user) {
        req.user.cart.push({ cart: cart._id })
        await req.user.save()
      }
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
      // New item, add it to the cart
      if (quantity > 0) {
        cart.items.push({ productId, quantity: Number(quantity), price })
      } else {
        return res
          .status(400)
          .json({ error: 'Quantity must be greater than 0' })
      }
    }

    await cart.save()

    // Optionally, if user is logged in, update their cart array in User document
    if (req.user) {
      const userCartItemIndex = req.user.cart.findIndex(
        item => item.product && productId && item.product.equals(productId)
      )
      if (userCartItemIndex > -1) {
        // req.user.cart[userCartItemIndex].quantity += Number(quantity)
        if (quantity <= 0) {
          // Remove from user's cart if quantity is 0 or less
          req.user.cart.splice(userCartItemIndex, 1)
        } else {
          req.user.cart[userCartItemIndex].quantity = Number(quantity)
        }
      } else {
        if (quantity > 0) {
          req.user.cart.push({
            product: new mongoose.Types.ObjectId(productId),
            quantity: Number(quantity)
          })
        }
      }
      await req.user.save()
    }
    await cart.populate('items.productId')
    res.json(cart)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error adding item to cart', messege: error })
  }
}

// Update item quantity in cart
exports.updateCartItemQty = async (req, res) => {
  const { productId, quantity } = req.body
  const cartId = req.user ? req.user._id : req.sessionID
  const query = req.user ? { userId: cartId } : { sessionId: cartId }
  try {
    if (!productId || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid data provided!'
      })
    }

    const cart = await Cart.findOne(query)

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found!'
      })
    }
    const findCurrentProductIndex = cart.items.findIndex(
      item => item.productId.toString() === productId
    )

    if (findCurrentProductIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not present !'
      })
    }

    cart.items[findCurrentProductIndex].quantity = quantity
    await cart.save()

    // Populate the cart items
    await cart.populate({
      path: 'items.productId'
      // select: 'title author price'
    })
    // console.log(cart)

    res.status(200).json(cart)
  } catch (error) {
    console.log(error)
    res.status(500).json({
      success: false,
      message: 'Error'
    })
  }
}

exports.cartItemSelect = async (req, res) => {
  const { productId, selected } = req.body
  const cartId = req.user ? req.user._id : req.sessionID
  const query = req.user ? { userId: cartId } : { sessionId: cartId }

  try {
    const cart = await Cart.findOneAndUpdate(
      { ...query, 'items.productId': productId },
      { $set: { 'items.$.isMarked': selected } },
      { new: true }
    )
    if (!cart) return res.status(404).json({ message: 'Cart not found' })

    // Populate the cart items
    await cart.populate({
      path: 'items.productId'
      // select: 'title author price'
    })
    const allSelected = cart.items.every(item => item.isMarked === true)
    cart.selectAll = allSelected

    await cart.save()

    res.status(200).json(cart)
  } catch (error) {
    res.status(500).json({ message: 'Error updating item selection', error })
  }
}

exports.selectAll = async (req, res) => {
  const { selected } = req.body
  const cartId = req.user ? req.user._id : req.sessionID
  const query = req.user ? { userId: cartId } : { sessionId: cartId }
  try {
    const cart = await Cart.findOneAndUpdate(
      { ...query },
      { $set: { 'items.$[].isMarked': selected, selectAll: selected } },
      { new: true }
    )
    if (!cart) return res.status(404).json({ message: 'Cart not found' })

    // Populate the cart items
    await cart.populate({
      path: 'items.productId'
      // select: 'title author price'
    })
    res.status(200).json(cart)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error selecting all items', error })
  }
}

// View cart
exports.cart = async (req, res) => {
  const query = req.user
    ? { userId: req.user._id }
    : { sessionId: req.sessionID }
  console.log('query', query)

  try {
    const cart = await Cart.findOne(query).populate(
      'items.productId'
      // 'title author price'
    )
    res.json(cart || { items: [] })
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving cart' })
  }
}

// Remove item from cart
exports.deleteCart = async (req, res) => {
  const { productId } = req.params

  const query = req.user
    ? { userId: req.user._id }
    : { sessionId: req.sessionID }

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

// Mark the product as selected
exports.selectProduct = async (req, res) => {
  const queryId = req.user ? req.user._id : req.sessionID
  const { productId, isMarked } = req.body
  try {
    // Find the cart by userId or sessionId
    const cart = await Cart.findOne({
      $or: [{ userId: queryId }, { sessionId: queryId }]
    })
    if (cart) {
      // Find the item to update
      const item = cart.items.find(
        item => item.productId.toString() === productId
      )
      if (item) {
        item.isMarked = isMarked
        await cart.save()
        res.send('Item marked status updated')
      } else {
        res.status(404).send('Item not found')
      }
    } else {
      res.status(404).send('Cart not found')
    }
  } catch (error) {
    res.status(500).send('An error occurred')
  }
}
