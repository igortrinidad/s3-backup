const exec = require('child_process').exec;
const moment = require('moment');
const fs = require('fs');
const path = require('path');
const { getConfig } = require('./configLoader');

module.exports = (dbInstance, databaseName) => new Promise( (resolve, reject) => {
  try {
    const config = getConfig()

    const now = moment().format('YYYY-MM-DD-HH-m')
    const filename = `${databaseName}-${now}.sql`
    const dumpsDir = path.join(process.cwd(), 'dumps')
    const filepath = path.join(dumpsDir, filename)

    // Ensure dumps directory exists
    if (!fs.existsSync(dumpsDir)) {
      fs.mkdirSync(dumpsDir, { recursive: true })
    }

    const cmd = `docker exec ${dbInstance.dockerImage} pg_dump -U ${dbInstance.user} ${databaseName} > ${filepath}`
    
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.warn('PostgreSQL dump error:', error)
        return reject(error)
      }
      
      if (stderr) {
        console.warn('PostgreSQL dump stderr:', stderr)
      }

      if(config.debug) console.log(`Backup created: ${filename}`)
      
      resolve({ filename: filename, filepath: filepath })
    })

  } catch (err) {
    reject(err)
  }
})