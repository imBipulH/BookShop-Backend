const jwt = require('jsonwebtoken')
const User = require('../models/userSchema')

const optionalProtect = async (req, res, next) => {
  let token
  console.log('req.headers.authorization', req.headers.authorization)

  // Check if token is provided in the header
  if (req.cookies.token) {
    token = req.cookies.token
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1]
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findById(decoded.user._id)
    if (!req.user) {
      return res.status(401).json({ message: 'User not found' })
    }
  } catch (error) {
    // If token is invalid, do not block the request, just proceed as guest
    console.log('Invalid token:', error.message)
  }

  // If no user is logged in, fall back to using session ID for cart
  if (!req.user) {
    req.sessionID // Use session ID as the cart identifier
  }

  next()
}

module.exports = optionalProtect
