const Cart = require('../models/cart')

exports.mergeCartAfterLogin = async (user, sessionID) => {
  try {
    const guestCart = await Cart.findOne({ sessionId: sessionID })
    const userCart = await Cart.findOne({ userId: user._id })

    if (guestCart && guestCart.items.length > 0) {
      if (userCart) {
        // Merge logic
        guestCart.items.forEach(guestItem => {
          const existingItemIndex = userCart.items.findIndex(
            userItem =>
              userItem.productId.toString() === guestItem.productId.toString()
          )

          if (existingItemIndex > -1) {
            userCart.items[existingItemIndex].quantity += guestItem.quantity
          } else {
            userCart.items.push(guestItem)
          }
        })
        await userCart.save()
      } else {
        guestCart.userId = user._id
        guestCart.sessionId = null
        await guestCart.save()
      }
      await Cart.deleteOne({ sessionId: sessionID })
    }

    return { success: true, message: 'Cart merged successfully' }
  } catch (error) {
    console.error(error)
    return { success: false, message: 'Error merging carts', error }
  }
}
