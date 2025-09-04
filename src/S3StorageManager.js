const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')
const config = require('../config')

class S3StorageManager {
  constructor(dbInstance) {
    let storageConfig
    if (!dbInstance.s3) {
      storageConfig = config.s3Default
    } else {
      storageConfig = dbInstance.s3
    }

    this.client = new S3Client({
      region: storageConfig.region,
      credentials: {
        accessKeyId: storageConfig.key,
        secretAccessKey: storageConfig.secret,
      },
    })

    this.bucket = storageConfig.bucket
  }

  async put(key, fileStream) {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: fileStream,
    })

    try {
      const response = await this.client.send(command)
      return response
    } catch (error) {
      throw new Error(`Failed to upload to S3: ${error.message}`)
    }
  }
}

module.exports = S3StorageManager
