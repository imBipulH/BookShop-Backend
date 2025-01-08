const express = require('express')
const router = express.Router()
const {
  registerUser,
  verifyOTP,
  login,
  verifyEmail,
  verifyUser,
  logout
} = require('../controllers/authController')

// Routes
router.post('/register', registerUser)
router.post('/verify', verifyOTP)
router.get('/verify-email', verifyEmail)
router.post('/login', login)
router.get('/verify', verifyUser)
router.post('/logout', logout)

module.exports = router
