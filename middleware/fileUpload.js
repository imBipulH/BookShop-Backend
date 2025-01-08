const multer = require('multer')
const path = require('path')

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/') // Temporary folder for file storage
//   },
//   filename: (req, file, cb) => {
//     cb(null, `${Date.now()}-${path.basename(file.originalname)}`)
//   }
// })

const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf'
  ]
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Invalid file type'), false)
  }
}

const upload = multer({ storage, fileFilter })

module.exports = upload
