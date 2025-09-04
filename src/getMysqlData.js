const exec = require('child_process').exec;
const moment = require('moment');
const fs = require('fs');
const path = require('path');
const config = require('../config');

module.exports = (dbInstance, databaseName) => new Promise( (resolve, reject) => {
  try {

    const now = moment().format('YYYY-MM-DD-HH-m')
    const filename = `${databaseName}-${now}.sql`
    const dumpsDir = path.join(process.cwd(), 'dumps')
    const filepath = path.join(dumpsDir, filename)

    // Ensure dumps directory exists
    if (!fs.existsSync(dumpsDir)) {
      fs.mkdirSync(dumpsDir, { recursive: true })
    }

    let cmd
    if(dbInstance.isDocker) {
      cmd = `docker exec ${dbInstance.dockerImage} mysqldump -h${dbInstance.host} -P${dbInstance.port} -u${dbInstance.username} -p${dbInstance.password} ${databaseName} > ${filepath}`
    } else {
      cmd = `mysqldump -h${dbInstance.host} -P${dbInstance.port} -u${dbInstance.user} -p${dbInstance.password} ${databaseName} > ${filepath}`
    }
    
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.warn('MySQL dump error:', error)
        return reject(error)
      }
      
      if (stderr) {
        console.warn('MySQL dump stderr:', stderr)
      }

      if(config.debug) console.log(`Backup created: ${filename}`)
      
      resolve({ filename: filename, filepath: filepath })
    })

  } catch (err) {
    reject(err)
  }
})