const Publisher = require('../models/publisher')
const ErrorResponse = require('../utils/errorResponse')

exports.addPublisher = async (req, res, next) => {
  const { name, descriptions } = req.body

  try {
    const newPublisher = new Publisher({ name, descriptions })
    await newPublisher.save()
    res.status(201).json({ success: true, data: newPublisher })
  } catch (error) {
    next(new ErrorResponse(error.message, 400))
  }
}
