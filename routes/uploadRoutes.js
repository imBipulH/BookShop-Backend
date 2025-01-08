const express = require('express')
const upload = require('../middleware/fileUpload')
const { uploadFile, deleteFile } = require('../controllers/uploadFiles')
const { editFile } = require('../controllers/editFiles')

const router = express.Router()



// Route to upload images
router.post('/:type', upload.single('file'), uploadFile)
router.delete('/:key(*)', deleteFile)
router.put('/:key(*)', upload.single('file'), editFile)

module.exports = router
