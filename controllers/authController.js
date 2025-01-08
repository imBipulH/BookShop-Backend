require('dotenv').config()
const User = require('../models/userSchema')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const bcrypt = require('bcrypt')
const JWT_SECRET = process.env.JWT_SECRET
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
  const { firstName, lastName, email, phone, password } = req.body

  try {
    if (!email && !phone) {
      return res
        .status(400)
        .json({ message: 'Email or phone number is required' })
    }

    // Check if user exists
    const query = []
    if (email) query.push({ email })
    if (phone) query.push({ phone })
    const userExists = await User.findOne({ $or: query })
    console.log(userExists)

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' })
    }

    // Create the user
    const newUser = new User({
      firstName,
      lastName,
      phone,
      email,
      password
    })
    await newUser.save()
    // if (email) {
    //   await sendEmailOTP(email, otp)
    // } else if (phone) {
    //   await sendSMSOTP(phone)
    // }

    const token = jwt.sign(
      { user: newUser, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    )

    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'bipulh62@gmail.com',
        pass: 'bpywkymyrbaczyca'
      }
    })

    const mailOptions = {
      from: 'no-reply@bookshopbd.com',
      to: email,
      subject: 'Verify Your Email Address',
      html: `<p>Hi ${firstName},</p>
             <p>Click the link below to verify your email address:</p>
             <a href="${verifyUrl}">${verifyUrl}</a>
             <p>This link will expire in 1 hour.</p>`
    }

    await transporter.sendMail(mailOptions)

    res.status(201).json({
      _id: newUser._id,
      name: newUser.firstName + ' ' + newUser.lastName,
      email: User.email,
      phone: User.phone,
      token: generateToken(User)
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.verifyEmail = async (req, res) => {
  const { token } = req.query
  if (!token)
    return res.status(400).json({ message: 'Verification token is missing' })

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Find the user by ID from the token payload
    const user = await User.findById(decoded.userId)

    if (!user) {
      return res.status(404).json({ error: 'User not found.' })
    }

    if (user.isVerified === true) {
      return res.status(400).json({ message: 'User is already verified.' })
    }

    user.isVerified = true
    // user.verifyToken = null  Optionally clear the verifyToken field
    await user.save()

    res.status(200).json({ message: 'Email verification successful.' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Invalid or expired token.' })
  }
}

// Verify OTP
const twilio = require('twilio')
const ErrorResponse = require('../utils/errorResponse')
const { mergeCartAfterLogin } = require('../utils/mergeCart')
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

    const mergeResult = await mergeCartAfterLogin(user, req.sessionID)
    if (!mergeResult.success) {
      return res.status(500).json({ message: mergeResult.message })
    }

    // Generate token
    sendTokenResponse(user, 200, res)
  } catch (error) {
    next(new ErrorResponse('Server Error', 500))
  }
}

// Send JWT token response
const sendTokenResponse = (user, statusCode, res) => {
  const token = jwt.sign({ user: user }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  })
  res.cookie('token', token, {
    httpOnly: true, // Make the cookie inaccessible to JavaScript
    secure: false, // Set to true in production to use HTTPS
    // maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days (in milliseconds)
    sameSite: 'lax' // Prevents cross-site request forgery
  })

  res.status(statusCode).json({ success: true, user: user, token })
}

exports.verifyUser = (req, res) => {
  console.log('Req cookies.user', req.Cookie)

  const token = req.cookies.token // Get token from cookies
  if (!token) {
    return res.status(401).json({ message: 'Not authenticated' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    res.status(200).json({ user: decoded })
  } catch (error) {
    res.status(403).json({ message: 'Invalid or expired token' })
  }
}

exports.logout = (req, res) => {
  try {
    // Clear the authentication cookie
    res.clearCookie('token', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax'
    })

    res.status(200).json({ message: 'Logout successful' })
  } catch (error) {
    res.status(500).json({ message: 'Server error during logout' })
  }
}
