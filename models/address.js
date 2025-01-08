const mongoose = require('mongoose')

const adddressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  alternativeNumber: {
    type: String,
    default: null
  },
  country: {
    type: String,
    default: 'Bangladesh'
  },
  region: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  area: {
    type: String,
    default: null
  },
  zone: {
    type: String,
    default: null
  },
  addressDetails: {
    type: String
  },
  type: {
    type: String,
    enum: ['Home', 'Office', 'Other'],
    required: true,
    default: 'Home'
  }
})

module.exports = mongoose.model('Address', adddressSchema)
