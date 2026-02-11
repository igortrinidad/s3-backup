const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')
const { getConfig } = require('./configLoader')

class S3StorageManager {
  constructor(dbInstance) {
    const config = getConfig()
    let storageConfig
    if (!dbInstance.s3) {
      storageConfig = config.s3Default
    } else {
      storageConfig = dbInstance.s3
    }

    const clientConfig = {
      region: storageConfig.region || 'auto',
      credentials: {
        accessKeyId: storageConfig.key,
        secretAccessKey: storageConfig.secret,
      },
    }

    // Support for custom endpoints (Cloudflare R2, DigitalOcean Spaces, MinIO, etc)
    if (storageConfig.endpoint) {
      clientConfig.endpoint = storageConfig.endpoint
    }

    // Some providers require forcePathStyle
    if (storageConfig.forcePathStyle !== undefined) {
      clientConfig.forcePathStyle = storageConfig.forcePathStyle
    }

    this.client = new S3Client(clientConfig)
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
