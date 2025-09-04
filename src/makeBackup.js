const fs = require('fs')
const fsPromises = require('fs/promises')
const Sentry = require('@sentry/node')
const config = require('../config')
const getDbData = require('./getDbData')
const S3StorageManager = require('./S3StorageManager')

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

module.exports = async () => {
  try {

    for(const dbInstance of config.instances) {
      if(config.debug) console.log(`******** STARTING BACKUP FOR ENGINE ${dbInstance.engine} ************`)
      
      const { getData } = getDbData(dbInstance)

      const storage = new S3StorageManager(dbInstance)

      for(const databaseName of dbInstance.databases) {

        if(config.debug) console.log(`******** STARTING BACKUP FOR DB ${databaseName} ************`)
        const backupFile = await getData(dbInstance, databaseName)

        if(config.debug) console.log(`Starting upload of backup: ${backupFile.filename}`)
        
        // Verify file exists and is readable before upload
        try {
          await fsPromises.access(backupFile.filepath, fs.constants.R_OK)
          const fileStats = await fsPromises.stat(backupFile.filepath)
          if(config.debug) console.log(`File size: ${fileStats.size} bytes`)
          
          if(fileStats.size === 0) {
            throw new Error(`Backup file ${backupFile.filename} is empty`)
          }
        } catch (error) {
          console.error(`Error accessing backup file: ${error.message}`)
          continue
        }

        try {
          // Upload to S3 and wait for completion
          const fileStream = fs.createReadStream(backupFile.filepath)
          const uploadResult = await storage.put(`${databaseName}/${backupFile.filename}`, fileStream)
          
          if(config.debug) console.log(`Upload completed successfully for ${backupFile.filename}`)
          
          // Wait a bit to ensure upload is fully completed
          await wait(2000)
          
          // Clean up local file after successful upload
          try {
            await fsPromises.unlink(backupFile.filepath)
            if(config.debug) console.log(`Backup removed from ${backupFile.filepath}`)
          } catch (unlinkError) {
            console.error(`Error removing backup file: ${unlinkError.message}`)
          }
          
        } catch (uploadError) {
          console.error(`Upload failed for ${backupFile.filename}: ${uploadError.message}`)
          Sentry.captureException(uploadError)
          // Don't delete the file if upload failed
          continue
        }

        if(config.debug) console.log(`******** FINISHED BACKUP FOR DB ${databaseName} ************`)
        
      }
  
      Sentry.captureMessage(`Backup successfully completed for databases: ${dbInstance.databases.join(', ')}`);
    }

  } catch (err) {
    console.log(err)
    Sentry.captureException(err)
  }
}