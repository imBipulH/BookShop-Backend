const multer = require('multer')
const path = require('path')

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = file.mimetype.includes('image')
      ? 'uploads/images'
      : file.mimetype.includes('pdf')
      ? 'uploads/pdfs'
      : 'uploads/others'
    cb(null, dir)
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`)
  }
})

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Invalid file type'), false)
    }
    cb(null, true)
  }
})

module.exports = upload
