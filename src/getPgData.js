const exec = require('child_process').exec;
const moment = require('moment');
const config = require('../config');

module.exports = (dbInstance, databaseName) => new Promise( (resolve, reject) => {
  try {

    const now = moment().format('YYYY-MM-DD-HH-m')
    const filename = `${databaseName}-${now}.sql`
    const filepath = `${process.cwd()}/dumps/${filename}`

    const cmd = `docker exec ${dbInstance.dockerImage} pg_dump -U ${dbInstance.user} ${databaseName} > ${filepath}`
    
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.warn(error)
      }

      if(config.debug) console.log(`Backup created: ${filename}`)
      
      resolve({ filename: filename, filepath: filepath })
    })

  } catch (err) {
    reject(err)
  }
})