const mongoose = require('mongoose')

const CartSchema = new mongoose.Schema({
  userId: { type: String, required: false },
  sessionId: { type: String, required: false },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true
      },
      quantity: { type: Number, min: 1, default: 1 },
      price: Number,
      isMarked: { type: Boolean, default: true }
    }
  ],
  selectAll: { type: Boolean, default: false }
})

module.exports = mongoose.model('Cart', CartSchema)
