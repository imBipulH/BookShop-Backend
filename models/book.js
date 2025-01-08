const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    }
  }
  //   { _id: false }
)

const bookSchema = new mongoose.Schema(
  {
    itemId: {
      type: String
      // unique: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Author',
      required: true
    },
    publisher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Publisher',
      required: true
    },
    category: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
      }
    ],
    isbn: {
      type: String,
      unique: true,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    discountPercentage: {
      type: Number
    },
    discountPrice: {
      type: Number
    },
    language: {
      type: String,
      default: 'Bangla'
    },
    country: { type: String },
    stock: {
      type: Number,
      required: true,
      default: 0
    },
    pdf: {
      type: String
    },
    summery: {
      type: String
    },
    coverImage: {
      type: String
    },
    reviews: [reviewSchema],
    averageRating: { type: Number, default: 0 }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Book', bookSchema)
