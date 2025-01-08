require('dotenv').config()
const jwt = require('jsonwebtoken')
const User = require('../models/userSchema')
const session = require('express-session')
const { v4: uuidv4 } = require('uuid')

// Middleware to verify the token
const protect = async (req, res, next) => {
  let token
  try {
    if (req.cookies.token) {
      // Get token from cookie
      token = req.cookies.token
    } else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      // Get token from header
      token = req.headers.authorization.split(' ')[1]

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      req.user = await User.findById(decoded.id).select('-password')

      return next()
    }

    if (!req.user) {
      if (!req.session.cartId) {
        req.session.cartId = uuidv4()
      }
      req.cartId = req.session.cartId
      return next()
    }

    res.status(401).json({ message: 'Not authorized, no token or session' })
  } catch (error) {
    console.error(error)
    res.status(401).json({ message: 'Not authorized, token failed' })
  }
}

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role '${req.user.role}' is not authorized to access this route`,
          403
        )
      )
    }
    next()
  }
}

module.exports = { protect, authorize }
