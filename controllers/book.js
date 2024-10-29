const Book = require('../models/book')
const Category = require('../models/category')
const ErrorResponse = require('../utils/errorResponse')

// Add a new book
exports.addBook = async (req, res, next) => {
  const {
    title,
    author,
    publisher,
    description,
    price,
    category,
    stock,
    isbn
  } = req.body

  try {
    const newBook = await Book.create({
      title,
      author,
      publisher,
      description,
      price,
      category,
      stock,
      isbn
    })
    res.status(201).json({ success: true, data: newBook })
  } catch (error) {
    next(new ErrorResponse(error.message, 400))
  }
}

// Get a single book by ID
exports.getBookById = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id).populate('category', 'name')

    if (!book) {
      return next(new ErrorResponse('Book not found', 404))
    }

    res.status(200).json({ success: true, data: book })
  } catch (error) {
    next(new ErrorResponse('Failed to retrieve book', 500))
  }
}

// Get All Books
exports.getAllBooks = async (req, res, next) => {
  const {
    page = 1,
    limit = 10,
    sort = 'title',
    sortOrder,
    category,
    priceRange,
    author,
    rating,
    search
  } = req.query

  let query = {}
  const order = sortOrder === 'desc' ? -1 : 1
  if (category) query.category = category
  if (priceRange) {
    const [minPrice, maxPrice] = priceRange.split('-')
    query.price = { $gte: minPrice, $lte: maxPrice }
  }
  // Author filter
  if (author) query.author = author

  // Rating filter
  if (rating) query.rating = { $gte: rating }

  // Search filter (for title or description)
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ]
  }

  console.log(query)

  try {
    const books = await Book.find(query)
      .populate('category', 'name')
      .sort({ [sort]: order })
      .limit(parseInt(limit))
      .skip((page - 1) * limit)
    res.status(200).json({ success: true, count: books.length, data: books })
  } catch (error) {
    next(new ErrorResponse(error.message, 500))
  }
}

// Update a book
exports.updateBook = async (req, res, next) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })

    if (!book) {
      return next(new ErrorResponse('Book not found', 404))
    }

    res.status(200).json({ success: true, data: book })
  } catch (error) {
    next(new ErrorResponse('Failed to update book', 500))
  }
}

// Search books by title or author
exports.searchBook = async (req, res) => {
  const { query } = req.query

  try {
    const books = await Book.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { author: { $regex: query, $options: 'i' } }
      ]
    })

    res.json(books)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get books within a price range
exports.booksByPriceRange = async (req, res) => {
  const { minPrice, maxPrice } = req.query

  try {
    const books = await Book.find({
      price: { $gte: minPrice, $lte: maxPrice }
    })
    res.json(books)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Delete a book
exports.deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id)

    if (!book) {
      return next(new ErrorResponse('Book not found', 404))
    }

    res.status(204).json({ success: true, data: {} }) // No content to send back
  } catch (error) {
    next(new ErrorResponse('Failed to delete book', 500))
  }
}
