require('dotenv').config()

const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString()
}

const setOTPExpiration = () => {
  return new Date(Date.now() + 2 * 60 * 1000) // OTP valid for 2 minutes
}

// Sent Email OTP
const nodemailer = require('nodemailer')
const sendEmailOTP = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // Your email address
      pass: process.env.EMAIL_PASS // Your email password
    }
  })

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP code is ${otp}. It is valid for 10 minutes.`
  }

  await transporter.sendMail(mailOptions)
}

// Sent SMS OTP
const twilio = require('twilio')
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN)

const sendSMSOTP = async phone => {
  client.verify.v2
    .services('VA06978146af5d242ac339278b2b8da4f2')
    .verifications.create({ to: phone, channel: 'sms' })
    .then(verification_check => console.log(verification_check.status))
    .catch(err => console.log(err))
}

const verifyCode = (phoneNumber, code) => {
  client.verify.v2
    .services(process.env.TWILIO_VERIFY_SID)
    .verificationChecks.create({ to: phoneNumber, code: code })
    .then(verification_check => res.json(verification_check.status))
    .catch(err => console.log(err))
}

module.exports = {
  generateOTP,
  setOTPExpiration,
  sendEmailOTP,
  sendSMSOTP,
  verifyCode
}
