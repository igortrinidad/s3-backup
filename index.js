const CronJob = require('cron').CronJob
const config = require('./config')

const makeBackup = require('./src/makeBackup')

module.exports = ( async () => {

  if(config.runOnStartup) await makeBackup()

  if(config.debug) console.log(`**** Scheduling backups to run at ${config.cron_time} - ${config.timezone} *****`)

  new CronJob(config.cron_time || '0 5 * * *', async () => {
    await makeBackup()
  }, null, true, config.timezone)

})()