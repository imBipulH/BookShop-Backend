const Book = require('../models/book')
const Category = require('../models/category')
const ErrorResponse = require('../utils/errorResponse')

// Add a new category
exports.addCategory = async (req, res, next) => {
  const { name, description, parent } = req.body

  try {
    // Create the new category
    const newCategory = await Category.create({ name, description, parent })

    // If there is a parent category, push the new category's ID into the parent's children array
    if (parent) {
      await Category.findByIdAndUpdate(
        parent,
        { $addToSet: { children: newCategory._id } },
        { new: true }
      )
    }

    res.status(201).json({ success: true, data: newCategory })
  } catch (error) {
    next(new ErrorResponse(error.message, 400))
  }
}

// Get all categories
exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find()
      .populate('parent', 'name')
      .populate('children', 'name')
    res.status(200).json(categories)
  } catch (error) {
    next(new ErrorResponse('Failed to retrieve categories', 500))
  }
}

// Get a single category by ID
exports.getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate('parent', 'name')
      .populate('children', 'name')

    if (!category) {
      return next(new ErrorResponse('Category not found', 404))
    }

    res.status(200).json({ success: true, data: category })
  } catch (error) {
    next(new ErrorResponse('Failed to retrieve category', 500))
  }
}

// Update a category
exports.updateCategory = async (req, res, next) => {
  const { name, description, parent } = req.body
  try {
    const updateData = { name, description }

    if (parent !== '') {
      updateData.parent = parent
    }
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    )

    if (!category) {
      return next(new ErrorResponse('Category not found', 404))
    }

    // If this category had a parent, remove it from the parent's children array
    if (parent && category.parent) {
      await Category.findByIdAndUpdate(
        category.parent,
        { $pull: { children: category._id } },
        { new: true }
      )
    }

    if (parent) {
      await Category.findByIdAndUpdate(
        parent,
        { $addToSet: { children: category._id } },
        { new: true }
      )
    }

    res.status(200).json({ success: true, data: category })
  } catch (error) {
    console.log(error)

    next(new ErrorResponse('Failed to update category', 500))
  }
}

// Delete a category
exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id)

    if (!category) {
      return next(new ErrorResponse('Category not found', 404))
    }

    // If this category has a parent, remove this category from the parent's children array
    if (category.parent) {
      await Category.findByIdAndUpdate(
        category.parent,
        { $pull: { children: category._id } },
        { new: true }
      )
    }

    res
      .status(204)
      .json({ success: true, messege: 'Category Deleted Successfully' })
  } catch (error) {
    next(new ErrorResponse('Failed to delete category', 500))
  }
}

// Get CategoryBooks for Homepage

exports.getCategoryBooks = async (req, res, next) => {
  try {
    const categories = req.body

    if (!categories || !Array.isArray(categories)) {
      return next(
        new ErrorResponse('Please provide a valid list of categories', 400)
      )
    }

    const booksByCategoryGroup = await Promise.all(
      categories.map(async group => {
        return Promise.all(
          group.map(async category => {
            const books = await Book.find({ category: category._id }).limit(4)
            return { category, books }
          })
        )
      })
    )

    res.status(200).json(booksByCategoryGroup)
  } catch (error) {
    next(new ErrorResponse('Failed to get category books', 500))
  }
}
