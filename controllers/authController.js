require('dotenv').config()
const User = require('../models/userSchema')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const {
  generateOTP,
  setOTPExpiration,
  sendEmailOTP,
  sendSMSOTP,
  verifyCode
} = require('../utils/helper')

// Generate JWT
const generateToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  })
}

// Register a new user
exports.registerUser = async (req, res) => {
  const { firstName, email, phone, password } = req.body

  try {
    if (!email && !phone) {
      return res
        .status(400)
        .json({ message: 'Email or phone number is required' })
    }

    // Check if user exists
    const userExists = await User.findOne({ $or: [{ email }, { phone }] })
    console.log(userExists)

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' })
    }

    // Create the user
    const newUser = new User({
      firstName,
      phone,
      email,
      password
    })
    newUser.save()
    // if (email) {
    //   await sendEmailOTP(email, otp)
    // } else if (phone) {
    //   await sendSMSOTP(phone)
    // }

    res.status(201).json({
      _id: User._id,
      name: User.name,
      email: User.email,
      phone: User.phone,
      token: generateToken(User._id)
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Verify OTP
const twilio = require('twilio')
const ErrorResponse = require('../utils/errorResponse')
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN)

exports.verifyOTP = async (req, res) => {
  const { phone, otp } = req.body
  try {
    const verification_check = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SID)
      .verificationChecks.create({ to: phone, code: otp })

    console.log('Verification status:', verification_check.status)
    return res.status(200).json({ status: verification_check.status })
  } catch (error) {
    console.error('Error verifying code:', error.message)
    throw error
  }
}

// Login with email or phone and password
exports.login = async (req, res, next) => {
  const { identifier, password } = req.body

  try {
    // Check if the identifier is an email or phone number
    let user
    const isEmail = identifier.includes('@')

    if (isEmail) {
      user = await User.findOne({ email: identifier }).select('+password')
    } else {
      user = await User.findOne({ phone: identifier }).select('+password')
    }

    if (!user) {
      return next(new ErrorResponse('Invalid credentials', 401))
    }

    // Check if the password matches
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return next(new ErrorResponse('Invalid credentials', 401))
    }

    // Generate token
    sendTokenResponse(user, 200, res)
  } catch (error) {
    next(new ErrorResponse('Server Error', 500))
  }
}

// Send JWT token response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken()
  res.status(statusCode).json({ success: true, token })
}
