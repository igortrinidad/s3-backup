const { exec } = require('child_process')
const moment = require('moment')
const fs = require('fs')
const path = require('path')
const config = require('../config')

module.exports = (dbInstance, databaseName) => new Promise((resolve, reject) => {
  try {
    const now = moment().format('YYYY-MM-DD-HH-mm')
    const filename = `${databaseName}-${now}.gz`
    const dumpsDir = path.join(process.cwd(), 'dumps')
    const filepath = path.join(dumpsDir, filename)

    // Ensure dumps directory exists
    if (!fs.existsSync(dumpsDir)) {
      fs.mkdirSync(dumpsDir, { recursive: true })
    }

    let cmd

    if (dbInstance.isDocker) {
      cmd = `docker exec ${dbInstance.dockerImage} mongodump --host ${dbInstance.host} --port ${dbInstance.port} -u ${dbInstance.user} -p ${dbInstance.password} --authenticationDatabase admin --db ${databaseName} --archive --gzip > ${filepath}`
    } else {
      cmd = `mongodump --host ${dbInstance.host} --port ${dbInstance.port} -u ${dbInstance.user} -p ${dbInstance.password} --authenticationDatabase admin --db ${databaseName} --archive=${filepath} --gzip`
    }

    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.warn('Backup error:', error)
        return reject(error)
      }

      if (config.debug) console.log(`MongoDB backup created: ${filename}`)

      resolve({ filename, filepath })
    })
  } catch (err) {
    reject(err)
  }
})
