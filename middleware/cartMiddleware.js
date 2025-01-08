const Cart = require('../models/cart')

const checkUserAndMergeCart = async (req, res, next) => {
  try {
    // Check if the user is logged in
    if (req.user) {
      const sessionCart = await Cart.findOne({ sessionId: req.sessionID })
      const userCart = await Cart.findOne({ userId: req.user._id })

      // If a guest cart exists, merge it with the user's cart
      if (sessionCart) {
        if (userCart) {
          // Logic to merge sessionCart items into userCart
          sessionCart.items.forEach(sessionItem => {
            const existingItemIndex = userCart.items.findIndex(
              userItem =>
                userItem.productId.toString() ===
                sessionItem.productId.toString()
            )

            if (existingItemIndex > -1) {
              // Update the quantity of the existing item
              userCart.items[existingItemIndex].quantity += sessionItem.quantity
            } else {
              // Add new item from sessionCart to userCart
              userCart.items.push(sessionItem)
            }
          })
          await userCart.save()
        } else {
          // Assign the session cart to the logged-in user if no user cart exists
          sessionCart.userId = req.user._id
          // sessionCart.sessionId = null // Clear session association
          await sessionCart.save()
        }

        // Remove the session cart after merging
        await Cart.deleteOne({ sessionId: req.sessionID })
      }
    }
    next()
  } catch (error) {
    console.log('Error merging carts:', error)
    res
      .status(500)
      .json({ message: 'Error merging carts', error: error.message })
  }
}

module.exports = checkUserAndMergeCart
