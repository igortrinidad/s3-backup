const { exec } = require('child_process')
const moment = require('moment')
const config = require('../config')

module.exports = (dbInstance, databaseName) => new Promise((resolve, reject) => {
  try {
    const now = moment().format('YYYY-MM-DD-HH-mm')
    const filename = `${databaseName}-${now}.gz`
    const filepath = `${process.cwd()}/dumps/${filename}`

    let cmd

    if (dbInstance.isDocker) {
      cmd = `docker exec ${dbInstance.dockerImage} mongodump --host ${dbInstance.host} --port ${dbInstance.port} -u ${dbInstance.username} -p ${dbInstance.password} --authenticationDatabase admin --db ${databaseName} --archive=${filepath} --gzip`
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
