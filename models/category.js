const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category', // Reference to the parent category
      default: null
    },
    children: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category' // Reference to child categories
      }
    ]
  },
  { timestamps: true }
)

// Pre-save middleware to update the parent's children array
categorySchema.pre('save', async function (next) {
  if (this.parent) {
    const parentCategory = await mongoose
      .model('Category')
      .findById(this.parent)
    if (parentCategory) {
      parentCategory.children.push(this._id)
      await parentCategory.save()
    }
  }
  next()
})

module.exports = mongoose.model('Category', categorySchema)
