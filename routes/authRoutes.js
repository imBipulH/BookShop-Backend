const express = require('express')
const router = express.Router()
const {
  registerUser,
  verifyOTP,
  login
} = require('../controllers/authController')

// Routes
router.post('/register', registerUser) // User registration
router.post('/verify', verifyOTP)
router.post('/login', login) // User login

module.exports = router
