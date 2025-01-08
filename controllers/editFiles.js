const { PutObjectCommand, S3Client } = require('@aws-sdk/client-s3')
const { deleteFileFromS3 } = require('../services/uploadService')

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
})

exports.editFile = async (req, res) => {
  try {
    const fileKey = decodeURIComponent(req.params.key)

    if (!req.file) {
      return res
        .status(400)
        .json({ message: 'No file provided for replacement' })
    }
    console.log('Replacing file with key:', fileKey)

    await deleteFileFromS3(fileKey)

    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: fileKey,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
      CacheControl: 'no-cache'
    }
    const command = new PutObjectCommand(uploadParams)
    await s3Client.send(command)

    const fileUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${
      process.env.AWS_REGION
    }.amazonaws.com/${fileKey}?timestamp=${Date.now()}`

    res.status(200).json({
      message: 'File replaced successfully',
      fileUrl: fileUrl
    })
  } catch (error) {
    console.error('Error editing file:', error)
    res.status(500).json({ error: 'Failed to edit file' })
  }
}
