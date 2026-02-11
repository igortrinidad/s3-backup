const https = require('https')
const { getConfig } = require('./configLoader')

class DiscordNotifier {
  constructor() {
    const config = getConfig()
    this.webhookUrl = config.discord?.webhookUrl
    this.enabled = config.discord?.enabled !== false && !!this.webhookUrl
  }

  /**
   * Send a notification to Discord
   * @param {Object} options - Notification options
   * @param {string} options.title - Notification title
   * @param {string} options.description - Notification description
   * @param {string} options.color - Embed color (hex without #)
   * @param {Array} options.fields - Additional fields to include
   */
  async send({ title, description, color = 'FF0000', fields = [] }) {
    if (!this.enabled) {
      return { success: false, message: 'Discord notifications disabled' }
    }

    const embed = {
      title,
      description,
      color: parseInt(color, 16),
      timestamp: new Date().toISOString(),
      fields,
      footer: {
        text: 's3-backup'
      }
    }

    const payload = JSON.stringify({
      embeds: [embed]
    })

    return new Promise((resolve, reject) => {
      const url = new URL(this.webhookUrl)
      
      const options = {
        hostname: url.hostname,
        port: 443,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        }
      }

      const req = https.request(options, (res) => {
        let data = ''

        res.on('data', (chunk) => {
          data += chunk
        })

        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ success: true, message: 'Notification sent successfully' })
          } else {
            resolve({ 
              success: false, 
              message: `Discord API returned ${res.statusCode}`,
              response: data 
            })
          }
        })
      })

      req.on('error', (error) => {
        console.error('Error sending Discord notification:', error.message)
        resolve({ success: false, message: error.message })
      })

      req.write(payload)
      req.end()
    })
  }

  /**
   * Send a backup failure notification
   * @param {Object} options - Failure details
   * @param {string} options.database - Database name
   * @param {string} options.engine - Database engine
   * @param {string} options.error - Error message
   * @param {string} options.filename - Backup filename (optional)
   */
  async notifyBackupFailure({ database, engine, error, filename }) {
    const fields = [
      { name: '🗄️ Database', value: database, inline: true },
      { name: '⚙️ Engine', value: engine, inline: true },
      { name: '❌ Error', value: error.substring(0, 1024), inline: false }
    ]

    if (filename) {
      fields.push({ name: '📁 Filename', value: filename, inline: false })
    }

    return this.send({
      title: '⚠️ Backup Failed',
      description: `Failed to complete backup for **${database}**`,
      color: 'FF0000', // Red
      fields
    })
  }

  /**
   * Send a backup success notification (optional)
   * @param {Object} options - Success details
   * @param {Array} options.databases - Array of database names
   * @param {string} options.engine - Database engine
   * @param {number} options.count - Number of backups
   */
  async notifyBackupSuccess({ databases, engine, count }) {
    return this.send({
      title: '✅ Backup Completed',
      description: `Successfully completed ${count} backup(s)`,
      color: '00FF00', // Green
      fields: [
        { name: '🗄️ Databases', value: databases.join(', '), inline: false },
        { name: '⚙️ Engine', value: engine, inline: true },
        { name: '📦 Count', value: count.toString(), inline: true }
      ]
    })
  }

  /**
   * Send a backup warning notification
   * @param {Object} options - Warning details
   * @param {string} options.message - Warning message
   * @param {string} options.database - Database name (optional)
   */
  async notifyWarning({ message, database }) {
    const fields = []
    
    if (database) {
      fields.push({ name: '🗄️ Database', value: database, inline: true })
    }

    return this.send({
      title: '⚠️ Backup Warning',
      description: message,
      color: 'FFA500', // Orange
      fields
    })
  }
}

module.exports = DiscordNotifier
