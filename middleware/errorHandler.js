const ErrorResponse = require('../utils/errorResponse')

// Centralized error handling middleware
const errorHandler = (err, req, res, next) => {
  let error = { ...err }
  error.message = err.message // Ensure the custom error message is set

  // Log the full error for debugging (optional)
  console.log(err)

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`
    error = new ErrorResponse(message, 404)
  }

  // Mongoose duplicate key error (e.g., unique email or phone)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0] // Get the field causing duplication
    const message = `Duplicate field value entered for ${field}`
    error = new ErrorResponse(message, 400)
  }

  // Mongoose validation error (e.g., required fields)
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)
      .map(val => val.message)
      .join(', ')
    error = new ErrorResponse(message, 400)
  }

  // Default to 500 if no status code is defined
  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error'
  })
}

module.exports = errorHandler
