const express = require('express')
const {
  addCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
} = require('../controllers/category')
const { authorize, protect } = require('../middleware/auth')
const router = express.Router()

router.post('/', addCategory)
router.get('/', getAllCategories)
router.get('/:id', getCategoryById)
router.put('/:id', protect, authorize('admin'), updateCategory)

router.delete('/:id', deleteCategory)

module.exports = router
