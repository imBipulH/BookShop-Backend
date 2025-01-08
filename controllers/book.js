const Book = require('../models/book')
const Author = require('../models/author')
const Category = require('../models/category')
const ErrorResponse = require('../utils/errorResponse')

// Add a new book
exports.addBook = async (req, res, next) => {
  const {
    title,
    author,
    publisher,
    summery,
    price,
    discountPercentage,
    category,
    language,
    country,
    stock,
    isbn,
    itemId,
    coverImage,
    pdf
  } = req.body

  try {
    // Check for existing ISBN
    const existingBookByISBN = await Book.findOne({ isbn })
    if (existingBookByISBN) {
      return next(new ErrorResponse('ISBN already exists', 400))
    }

    // Check for existing itemID
    const existingBookByItemID = await Book.findOne({ itemId })
    if (existingBookByItemID) {
      return next(new ErrorResponse('ItemID already exists', 400))
    }

    const discountPrice = price - price * (discountPercentage / 100)
    const newBook = await Book.create({
      title,
      author,
      publisher,
      summery,
      price,
      discountPrice,
      discountPercentage,
      category,
      language,
      country,
      stock,
      isbn,
      itemId,
      coverImage,
      pdf
    })
    res.status(201).json({ success: true, data: newBook })
  } catch (error) {
    next(new ErrorResponse(error.message, 400))
  }
}

// Get a single book by ID
exports.getBookById = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id)
      .populate('category', 'name')
      .populate('author', 'name')
      .populate('publisher', 'name')

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
    limit = 100,
    sort = 'title',
    sortOrder,
    categories,
    authors,
    publishers,
    priceRange,
    language,
    rating,
    search
  } = req.query

  let query = {}
  const order = sortOrder === 'desc' ? -1 : 1
  if (categories) {
    const categoryArray = categories.split(',')
    query.category = { $in: categoryArray }
  }
  if (authors) {
    const authorArray = authors.split(',')
    query.author = { $in: authorArray }
  }
  if (publishers) {
    const publisherArray = publishers.split(',')
    query.publisher = { $in: publisherArray }
  }

  if (priceRange) {
    const [minPrice, maxPrice] = priceRange.split('-')
    query.price = { $gte: minPrice, $lte: maxPrice }
  }
  if (language) query.language = language

  if (rating) query.rating = { $gte: rating }

  // Search filter (for title or description)
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ]
  }

  try {
    const totalItems = await Book.countDocuments(query)

    const books = await Book.find(query)
      .populate('category', 'name')
      .populate('author', 'name')
      .populate('publisher', 'name')
      .sort({ [sort]: order })
      .limit(parseInt(limit))
      .skip((page - 1) * limit)

    const totalPages = Math.ceil(totalItems / limit)
    res.status(200).json({
      success: true,
      count: books.length,
      data: books,
      totalItems,
      totalPages,
      currentPage: parseInt(page)
    })
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
    console.log(error)

    next(new ErrorResponse('Failed to update book', 500))
  }
}

// Search books by title or author
exports.searchBook = async (req, res) => {
  const { query } = req.query

  try {
    const books = await searchBooks(query)
    res.json(books)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const searchBooks = async query => {
  try {
    const books = await Book.aggregate([
      // Lookup authors
      {
        $lookup: {
          from: 'authors', // Collection name for authors
          localField: 'author', // Field in Book schema
          foreignField: '_id', // Field in Author schema
          as: 'authorDetails' // Resultant field for joined data
        }
      },
      // Lookup publishers
      {
        $lookup: {
          from: 'publishers', // Collection name for publishers
          localField: 'publisher', // Field in Book schema
          foreignField: '_id', // Field in Publisher schema
          as: 'publisherDetails' // Resultant field for joined data
        }
      },
      // Flatten author and publisher fields
      {
        $addFields: {
          authorName: { $arrayElemAt: ['$authorDetails.name', 0] },
          publisherName: { $arrayElemAt: ['$publisherDetails.name', 0] }
        }
      },
      // Add a field that combines title, author name, and publisher name
      {
        $addFields: {
          searchFields: {
            $concat: [
              { $ifNull: ['$title', ''] },
              ' ',
              { $ifNull: ['$authorName', ''] },
              ' ',
              { $ifNull: ['$publisherName', ''] }
            ]
          }
        }
      },
      // Match based on the search query
      {
        $match: {
          searchFields: { $regex: query, $options: 'i' } // Case-insensitive search
        }
      },
      // Project the fields you want in the response
      {
        $project: {
          title: 1,
          price: 1,
          discountPercentage: 1,
          coverImage: 1,
          averageRating: 1,
          authorName: 1,
          publisherName: 1
        }
      }
    ])

    return books
  } catch (error) {
    throw new Error(error.message)
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
