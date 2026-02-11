const fs = require('fs')
const fsPromises = require('fs/promises')
const { getConfig } = require('./configLoader')
const getDbData = require('./getDbData')
const S3StorageManager = require('./S3StorageManager')
const DiscordNotifier = require('./DiscordNotifier')

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

module.exports = async () => {
  const config = getConfig()
  const discord = new DiscordNotifier()
  
  for(const dbInstance of config.instances) {
    try {
      if(config.debug) console.log(`******** STARTING BACKUP FOR ENGINE ${dbInstance.engine} ************`)
      
      const { getData } = getDbData(dbInstance)
      const storage = new S3StorageManager(dbInstance)

      for(const databaseName of dbInstance.databases) {
        try {
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
            await discord.notifyBackupFailure({
              database: databaseName,
              engine: dbInstance.engine,
              error: `Failed to access backup file: ${error.message}`,
              filename: backupFile.filename
            })
            continue
          }

          try {
            // Upload to S3 and wait for completion
            // Pass filepath directly to enable multipart upload for large files
            const uploadResult = await storage.put(`${databaseName}/${backupFile.filename}`, backupFile.filepath)
            
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
            
            // Notify Discord about upload failure
            await discord.notifyBackupFailure({
              database: databaseName,
              engine: dbInstance.engine,
              error: `Upload failed: ${uploadError.message}`,
              filename: backupFile.filename
            })
            
            // Don't delete the file if upload failed
            await fsPromises.unlink(backupFile.filepath)
            continue
          }

          if(config.debug) console.log(`******** FINISHED BACKUP FOR DB ${databaseName} ************`)
          
        } catch (dbError) {
          // Error occurred during database backup process
          console.error(`Error backing up database ${databaseName}:`, dbError.message)
          
          await discord.notifyBackupFailure({
            database: databaseName,
            engine: dbInstance.engine,
            error: `Database backup failed: ${dbError.message}`
          })
          // Continue with next database
        }
      }
      
    } catch (instanceError) {
      // Error occurred at instance level (connection, configuration, etc)
      console.error(`Error processing instance (${dbInstance.engine}):`, instanceError.message)
      
      await discord.notifyBackupFailure({
        database: dbInstance.databases?.join(', ') || 'Unknown',
        engine: dbInstance.engine || 'Unknown',
        error: `Instance error: ${instanceError.message}`
      })
      // Continue with next instance
    }
  }
}