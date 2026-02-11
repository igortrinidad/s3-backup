#!/usr/bin/env node

const { loadConfig } = require('../src/configLoader')
const makeBackup = require('../src/makeBackup')
const CronJob = require('cron').CronJob

// Parse command line arguments
const args = process.argv.slice(2)

function printHelp() {
  console.log(`
s3-backup - Database backup to S3-compatible storage

Usage:
  npx s3-backup [options]
  s3-backup [options]

Options:
  -c, --config <path>    Path to configuration file (required)
  -d, --daemon           Run as daemon with cron scheduler (keeps running)
  -h, --help            Show this help message
  -v, --version         Show version

Examples:
  # Run a single backup
  npx s3-backup --config ./config.js
  
  # Run as daemon with PM2 (starts cron scheduler in background)
  pm2 start npx --name s3-backup -- s3-backup --daemon --config ./config.js
  
  # Or install globally and run
  npm install -g s3-backup
  pm2 start s3-backup -- --daemon --config ./config.js

Configuration file example:
  See config.example.js in the project repository
  `)
}

function printVersion() {
  const packageJson = require('../package.json')
  console.log(`s3-backup v${packageJson.version}`)
}

// Parse arguments
let configPath = null
let daemonMode = false

for (let i = 0; i < args.length; i++) {
  const arg = args[i]
  
  if (arg === '-h' || arg === '--help') {
    printHelp()
    process.exit(0)
  }
  
  if (arg === '-v' || arg === '--version') {
    printVersion()
    process.exit(0)
  }
  
  if (arg === '-d' || arg === '--daemon') {
    daemonMode = true
  }
  
  if (arg === '-c' || arg === '--config') {
    configPath = args[i + 1]
    if (!configPath) {
      console.error('Error: --config requires a path argument')
      process.exit(1)
    }
    i++ // Skip next argument as we've already consumed it
  }
}

// Main execution
async function main() {
  try {
    // Load configuration
    if (!configPath) {
      console.error('Error: Configuration file path is required')
      console.error('Use --config <path> to specify the configuration file')
      console.error('Run with --help for more information')
      process.exit(1)
    }

    const config = loadConfig(configPath)
    
    if (daemonMode) {
      // Run as daemon with cron scheduler
      console.log('🚀 Starting s3-backup in daemon mode...')
      console.log(`📅 Cron schedule: ${config.cron_time || '0 5 * * *'}`)
      console.log(`🌍 Timezone: ${config.timezone || 'UTC'}`)
      console.log(`💾 Databases configured: ${config.instances.length} instance(s)`)
      console.log('')
      
      // Run on startup if configured
      if (config.runOnStartup) {
        console.log('⚡ Running initial backup (runOnStartup=true)...')
        await makeBackup()
        console.log('✓ Initial backup completed!')
        console.log('')
      }
      
      // Setup cron job
      console.log('⏰ Cron scheduler started. Process will keep running...')
      console.log('   Use PM2 or Ctrl+C to stop.')
      console.log('')
      
      new CronJob(config.cron_time || '0 5 * * *', async () => {
        console.log(`\n[${new Date().toISOString()}] Starting scheduled backup...`)
        try {
          await makeBackup()
          console.log(`[${new Date().toISOString()}] ✓ Scheduled backup completed!\n`)
        } catch (error) {
          console.error(`[${new Date().toISOString()}] ✗ Scheduled backup failed:`, error.message)
        }
      }, null, true, config.timezone)
      
      // Keep process alive
      process.on('SIGINT', () => {
        console.log('\n\n👋 Shutting down s3-backup daemon...')
        process.exit(0)
      })
      
    } else {
      // Run single backup
      console.log('Starting backup process...')
      await makeBackup()
      console.log('✓ Backup completed successfully!')
      process.exit(0)
    }
    
  } catch (error) {
    console.error('✗ Backup failed:', error.message)
    if (process.env.DEBUG) {
      console.error(error.stack)
    }
    process.exit(1)
  }
}

main()
