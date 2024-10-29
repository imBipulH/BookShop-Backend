const mongoose = require('mongoose')

const authorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    image: { type: String },
    bio: { type: String, default: '' },
    follower: { type: Number, default: 0 }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Author', authorSchema)
