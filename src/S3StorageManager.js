const { 
  S3Client, 
  PutObjectCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand
} = require('@aws-sdk/client-s3')
const fs = require('fs')
const fsPromises = require('fs/promises')
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
    
    // Multipart upload configuration
    this.multipartThreshold = storageConfig.multipartThreshold || 100 * 1024 * 1024 // 100MB default
    this.partSize = storageConfig.partSize || 10 * 1024 * 1024 // 10MB default (minimum is 5MB)
    this.maxConcurrentParts = storageConfig.maxConcurrentParts || 5 // 5 concurrent uploads default
  }

  async put(key, filePathOrStream) {
    // Check if it's a file path (string) or stream
    let filePath
    let fileSize
    
    if (typeof filePathOrStream === 'string') {
      filePath = filePathOrStream
      const stats = await fsPromises.stat(filePath)
      fileSize = stats.size
    } else {
      // If it's a stream, we can't use multipart upload efficiently
      // Fall back to simple upload
      return this._putSimple(key, filePathOrStream)
    }

    // Use multipart upload for large files
    if (fileSize >= this.multipartThreshold) {
      return this._putMultipart(key, filePath, fileSize)
    } else {
      // Use simple upload for small files
      const fileStream = fs.createReadStream(filePath)
      return this._putSimple(key, fileStream)
    }
  }

  async _putSimple(key, fileStream) {
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

  async _putMultipart(key, filePath, fileSize) {
    const config = getConfig()
    
    if (config.debug) {
      console.log(`Using multipart upload for ${key} (${Math.round(fileSize / 1024 / 1024)}MB)`)
    }

    let uploadId

    try {
      // Step 1: Initiate multipart upload
      const createCommand = new CreateMultipartUploadCommand({
        Bucket: this.bucket,
        Key: key,
      })
      const createResponse = await this.client.send(createCommand)
      uploadId = createResponse.UploadId

      if (config.debug) {
        console.log(`Multipart upload initiated: ${uploadId}`)
      }

      // Step 2: Calculate parts
      const numParts = Math.ceil(fileSize / this.partSize)
      const parts = []

      if (config.debug) {
        console.log(`Uploading ${numParts} parts with ${this.maxConcurrentParts} concurrent uploads`)
      }

      // Step 3: Upload parts in parallel batches
      for (let i = 0; i < numParts; i += this.maxConcurrentParts) {
        const batchSize = Math.min(this.maxConcurrentParts, numParts - i)
        const uploadPromises = []

        for (let j = 0; j < batchSize; j++) {
          const partNumber = i + j + 1
          const start = (partNumber - 1) * this.partSize
          const end = Math.min(start + this.partSize, fileSize)

          uploadPromises.push(
            this._uploadPart(filePath, uploadId, key, partNumber, start, end)
          )
        }

        // Wait for current batch to complete
        const batchParts = await Promise.all(uploadPromises)
        parts.push(...batchParts)

        if (config.debug) {
          console.log(`Uploaded parts ${i + 1} to ${i + batchSize} of ${numParts}`)
        }
      }

      // Step 4: Complete multipart upload
      const completeCommand = new CompleteMultipartUploadCommand({
        Bucket: this.bucket,
        Key: key,
        UploadId: uploadId,
        MultipartUpload: {
          Parts: parts.sort((a, b) => a.PartNumber - b.PartNumber),
        },
      })

      const response = await this.client.send(completeCommand)

      if (config.debug) {
        console.log(`Multipart upload completed successfully for ${key}`)
      }

      return response

    } catch (error) {
      // If anything fails, abort the multipart upload
      if (uploadId) {
        try {
          const abortCommand = new AbortMultipartUploadCommand({
            Bucket: this.bucket,
            Key: key,
            UploadId: uploadId,
          })
          await this.client.send(abortCommand)
          
          if (config.debug) {
            console.log(`Aborted multipart upload: ${uploadId}`)
          }
        } catch (abortError) {
          console.error(`Failed to abort multipart upload: ${abortError.message}`)
        }
      }

      throw new Error(`Failed to upload to S3 (multipart): ${error.message}`)
    }
  }

  async _uploadPart(filePath, uploadId, key, partNumber, start, end) {
    const partSize = end - start
    const buffer = Buffer.alloc(partSize)
    
    // Read the specific part from the file
    const fileHandle = await fsPromises.open(filePath, 'r')
    try {
      await fileHandle.read(buffer, 0, partSize, start)
    } finally {
      await fileHandle.close()
    }

    // Upload the part
    const uploadCommand = new UploadPartCommand({
      Bucket: this.bucket,
      Key: key,
      UploadId: uploadId,
      PartNumber: partNumber,
      Body: buffer,
    })

    const uploadResponse = await this.client.send(uploadCommand)

    return {
      ETag: uploadResponse.ETag,
      PartNumber: partNumber,
    }
  }
}

module.exports = S3StorageManager
