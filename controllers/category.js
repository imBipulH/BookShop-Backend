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
  console.log(req.user)

  try {
    const categories = await Category.find()
      .populate('parent', 'name')
      .populate('children', 'name')
    res.status(200).json({ success: true, data: categories })
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
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })

    if (!category) {
      return next(new ErrorResponse('Category not found', 404))
    }

    res.status(200).json({ success: true, data: category })
  } catch (error) {
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
