const { uploadFileToS3 } = require('../services/uploadService')

exports.uploadFile = async (req, res) => {
  try {
    const file = req.file
    const type = req.params.type // 'books', 'authors', 'pdf', etc.
    const folder = type === 'pdf' ? 'pdfs' : 'images'

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' })
    }

    const key = `${folder}/${Date.now()}-${file.originalname}`
    const fileUrl = await uploadFileToS3(file.buffer, key, file.mimetype)

    res.status(200).json({ fileUrl, message: 'File uploaded successfully' })
  } catch (error) {
    console.error('Error uploading file:', error)
    res.status(500).json({ error: 'File upload failed' })
  }
}

// Delete a file from aws
const { deleteFileFromS3 } = require('../services/uploadService')

exports.deleteFile = async (req, res) => {
  try {
    const key = req.params.key

    if (!key) {
      return res.status(400).json({ message: 'File key is required' })
    }

    await deleteFileFromS3(key)
    res.status(200).json({ message: 'File deleted successfully' })
  } catch (error) {
    console.error('Error deleting file:', error)
    res.status(500).json({ error: 'File deletion failed' })
  }
}
