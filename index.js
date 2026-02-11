const CronJob = require('cron').CronJob
const { getConfig } = require('./src/configLoader')
const makeBackup = require('./src/makeBackup')

module.exports = ( async () => {
  const config = getConfig()

  if(config.runOnStartup) await makeBackup()

  if(config.debug) console.log(`**** Scheduling backups to run at ${config.cron_time} - ${config.timezone} *****`)

  new CronJob(config.cron_time || '0 5 * * *', async () => {
    await makeBackup()
  }, null, true, config.timezone)

})()