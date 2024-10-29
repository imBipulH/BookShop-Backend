const mongoose = require('mongoose')

const publisherSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    descriptions: { type: String },
    image: { type: String }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Publisher', publisherSchema)
