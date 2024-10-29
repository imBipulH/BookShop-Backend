const Book = require('../models/book')

exports.addReview = async (req, res) => {
  const { bookId } = req.params
  const { userId, rating, comment } = req.body

  try {
    const book = await Book.findById(bookId)
    if (!book) return res.status(404).json({ error: 'Book not found' })

    // Check if the user already reviewed
    const existingReview = book.reviews.find(
      review => review.user.toString() === userId
    )
    if (existingReview) {
      return res
        .status(400)
        .json({ error: 'User has already reviewed this book' })
    }

    // Add the new review with approval set to false
    book.reviews.push({ user: userId, rating, comment })

    // Save the book
    await book.save()

    res.status(201).json({ message: 'Review submitted for approval', book })
  } catch (error) {
    res.status(500).json({ error: 'Error adding review', message: error })
  }
}

// Approve a review
exports.approveReview = async (req, res) => {
  const { bookId, reviewId } = req.params

  try {
    const book = await Book.findById(bookId)
    if (!book) return res.status(404).json({ error: 'Book not found' })

    const review = book.reviews.id(reviewId)
    if (!review) return res.status(404).json({ error: 'Review not found' })

    review.status = 'approved'

    await book.save()

    res.status(200).json({ message: 'Review approved', review })
  } catch (error) {
    res.status(500).json({ error: 'Error approving review' })
  }
}

// Reject a review (optional)
exports.rejectReview = async (req, res) => {
  const { bookId, reviewId } = req.params

  try {
    const book = await Book.findById(bookId)
    if (!book) return res.status(404).json({ error: 'Book not found' })

    const review = book.reviews.id(reviewId)
    if (!review) return res.status(404).json({ error: 'Review not found' })

    review.status = 'rejected'

    await book.save()

    res.status(200).json({ message: 'Review rejected', review })
  } catch (error) {
    res.status(500).json({ error: 'Error rejecting review' })
  }
}

// This is approved reviews for customers only
exports.getBookWithApprovedReviews = async (req, res) => {
  const { bookId } = req.params

  try {
    const book = await Book.findById(bookId)
      .populate('reviews.user', 'firstName')
      .select('-__v')

    if (!book) return res.status(404).json({ error: 'Book not found' })

    // Filter to only include approved reviews
    const approvedReviews = book.reviews.filter(
      review => review.status === 'approved'
    )

    res.status(200).json({ ...book.toObject(), reviews: approvedReviews })
  } catch (error) {
    res.status(500).json({ error: 'Error fetching book' })
  }
}

exports.getAllReviews = async (req, res) => {
  const {
    status,
    bookId,
    userId,
    rating,
    startDate,
    endDate,
    sortBy = 'createdAt',
    order = 'desc'
  } = req.query

  // Initialize the main filter
  let filter = {}

  // Filter books by specific book ID if provided
  if (bookId) filter['_id'] = bookId

  // Build review-specific filters using $elemMatch
  if (status || userId || rating || startDate || endDate) {
    filter['reviews'] = { $elemMatch: {} }

    if (status) filter['reviews'].$elemMatch.status = status
    if (userId) filter['reviews'].$elemMatch.user = userId
    if (rating) filter['reviews'].$elemMatch.rating = Number(rating) // Ensure rating is a number

    // Apply date range filter
    if (startDate || endDate) {
      filter['reviews'].$elemMatch.createdAt = {}
      if (startDate)
        filter['reviews'].$elemMatch.createdAt.$gte = new Date(startDate)
      if (endDate)
        filter['reviews'].$elemMatch.createdAt.$lte = new Date(endDate)
    }
  }

  try {
    // Fetch books with filtered reviews
    const books = await Book.find(filter)
      .populate('reviews.user', 'username')
      .select('title reviews')

    // Process and filter each book’s reviews to match additional criteria if needed
    const reviews = books.flatMap(book =>
      book.reviews
        .filter(review => {
          if (status && review.status !== status) return false
          if (userId && review.user.toString() !== userId) return false
          if (rating && review.rating !== Number(rating)) return false
          if (startDate && new Date(review.createdAt) < new Date(startDate))
            return false
          if (endDate && new Date(review.createdAt) > new Date(endDate))
            return false
          return true
        })
        .map(review => ({
          ...review.toObject(),
          bookTitle: book.title,
          bookId: book._id
        }))
    )

    // Sort reviews based on the provided `sortBy` and `order`
    const sortedReviews = reviews.sort((a, b) => {
      const fieldA = a[sortBy]
      const fieldB = b[sortBy]
      if (fieldA < fieldB) return order === 'asc' ? -1 : 1
      if (fieldA > fieldB) return order === 'asc' ? 1 : -1
      return 0
    })

    res.status(200).json(sortedReviews)
  } catch (error) {
    console.error('Error fetching reviews:', error)
    res
      .status(500)
      .json({ error: 'Error fetching reviews', details: error.message })
  }
}
