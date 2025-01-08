// controllers/wishlistController.js
const Wishlist = require('../models/wishlist')

exports.addToWishlist = async (req, res) => {
  const userId = req.user._id // Assuming req.user has authenticated user data
  const { bookId } = req.body
  try {
    let wishlist = await Wishlist.findOne({ userId })

    if (!wishlist) {
      wishlist = new Wishlist({ userId, books: [bookId] })
    } else if (!wishlist.books.includes(bookId)) {
      wishlist.books.push(bookId)
    } else {
      return res.status(400).json({ message: 'Book already in wishlist' })
    }

    await wishlist.save()
    res.status(200).json(wishlist)
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Error adding to wishlist', details: error.message })
  }
}

// Remove from wishlist
exports.removeFromWishlist = async (req, res) => {
  const userId = req.user._id
  const { bookId } = req.body

  try {
    const wishlist = await Wishlist.findOneAndUpdate(
      { userId },
      { $pull: { books: bookId } },
      { new: true }
    ).populate('books')

    if (!wishlist)
      return res.status(404).json({ message: 'Wishlist not found' })

    console.log(wishlist)

    res.status(200).json(wishlist)
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Error removing from wishlist', details: error.message })
  }
}

// Get wishlist by user ID
exports.getWishlist = async (req, res) => {
  if (!req.user) return res.status(404).json({ message: 'Log in first' })
  const userId = req.user._id

  try {
    const wishlist = await Wishlist.findOne({ userId }).populate('books')
    if (!wishlist)
      return res.status(404).json({ message: 'Wishlist not found' })

    console.log(wishlist)

    res.status(200).json(wishlist)
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Error fetching wishlist', details: error.message })
  }
}
