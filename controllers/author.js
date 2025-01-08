const Author = require('../models/author')
const ErrorResponse = require('../utils/errorResponse')

exports.addAuthor = async (req, res, next) => {
  const { name, bio } = req.body

  try {
    const newAuthor = new Author({ name, bio })
    await newAuthor.save()
    res.status(201).json({ success: true, data: newAuthor })
  } catch (error) {
    next(new ErrorResponse(error.message, 400))
  }
}

exports.getAllAuthors = async (req, res, next) => {
  try {
    const authors = await Author.find()
    res.status(200).json(authors)
  } catch (error) {
    next(new ErrorResponse('Failed to retrieve authors', 500))
  }
}
