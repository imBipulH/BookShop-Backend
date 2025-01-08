const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand
} = require('@aws-sdk/client-s3')

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
})

// Upload file to S3
exports.uploadFileToS3 = async (fileBuffer, key, mimetype) => {
  const uploadParams = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    Body: fileBuffer, // Use the buffer from Multer's memory storage
    ContentType: mimetype // Preserve file type
  }

  try {
    await s3Client.send(new PutObjectCommand(uploadParams))
    return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`
  } catch (error) {
    console.error('Error uploading to S3:', error)
    throw new Error('Failed to upload file')
  }
}

// Delete file from S3
exports.deleteFileFromS3 = async key => {
  const deleteParams = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key
  }

  try {
    await s3Client.send(new DeleteObjectCommand(deleteParams))
  } catch (error) {
    console.error('Error deleting from S3:', error)
    throw new Error('Failed to delete file')
  }
}
