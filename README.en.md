# S3 Backup

> English | [Português](README.md)

> Database backup tool for S3-compatible storage providers

## Overview

This program performs database dumps (MySQL, PostgreSQL, MongoDB) and uploads them to Amazon S3 or any S3-compatible storage provider (Cloudflare R2, DigitalOcean Spaces, MinIO, Backblaze B2, etc).

## Features

- 🗄️ **Multi-database support**: MySQL, PostgreSQL, MongoDB
- ☁️ **S3-compatible storage**: AWS S3, Cloudflare R2, DigitalOcean Spaces, MinIO, Backblaze B2
- 📦 **Multiple storage providers**: Configure different storage for each database instance
- 🔔 **Discord notifications**: Get notified when backups fail
- ⏰ **Scheduled backups**: Built-in cron scheduler for automated backups
- 🚀 **CLI support**: Run backups via npx with custom config files
- 🐳 **Docker ready**: Support for both local and Docker database instances
- 🔄 **Error resilience**: Continue with other backups if one fails

## ⚠️ Version 2.0.0 - AWS SDK v3 Migration

Version 2.0.0 introduces AWS SDK v3, which offers:
- Better performance and smaller bundle size
- Modular architecture with tree-shaking
- Enhanced TypeScript support
- Modern, consistent APIs
- **Support for multiple S3-compatible storage providers**

The S3 configuration remains the same; only the internal implementation has been modernized.

## Installation

### Option 1: Clone the repository

```bash
git clone https://github.com/igortrinidad/s3-backup
cd s3-backup
npm install
```

### Option 2: Install via npm (if published)

```bash
npm install -g s3-backup
```

## Configuration

Copy the example configuration file:

```bash
cp config.example.js config.js
```

Edit the variables according to your needs.

### Cron Time Configuration

The `CRON_TIME` variable defines when backups will be executed. It uses six space-separated values:

1. Seconds (0-59)
2. Minutes (0-59)
3. Hours (0-23)
4. Day of month (1-31)
5. Month (0-11) [January - December]
6. Day of week (0-6) [Sunday - Saturday]

Example: `"0 5 * * 0"` runs every Sunday at 5:00 AM

## Usage

### Option 1: Using NPX (Recommended for one-time execution)

Run backups directly with npx, passing the configuration file path:

```bash
npx s3-backup --config ./config.js
```

Or using an absolute path:

```bash
npx s3-backup --config /path/to/your/config.js
```

### Option 2: Using CLI after global installation

Install the package globally:

```bash
npm install -g .
```

Run the backup:

```bash
s3-backup --config ./config.js
```

### Option 3: Scheduled backups with Cron

For automatic scheduled backups, run `index.js`:

```bash
node index.js
```

**Important:** For scheduled use with cron, you must have a `config.js` file in the project root.

### Option 4: One-time execution without scheduling

Run a single backup without scheduling:

```bash
node run_backup_standalone.js
```

### CLI Options

```bash
s3-backup --help         # Show help message
s3-backup --version      # Show version
s3-backup -c <path>      # Specify configuration file
```

## Supported Storage Providers

This project supports any storage provider compatible with the S3 API. Besides Amazon S3, you can use:

### Cloudflare R2

```javascript
s3Default: {
  key: "your-access-key",
  secret: "your-secret-key",
  region: "auto",
  bucket: "your-bucket",
  endpoint: "https://YOUR-ACCOUNT-ID.r2.cloudflarestorage.com",
  forcePathStyle: false
}
```

**Getting Started with Cloudflare R2:**
1. Go to R2 in your Cloudflare dashboard
2. Create a bucket
3. Generate API tokens (Access Key ID and Secret Access Key)
4. Your account ID is in the R2 URL

### DigitalOcean Spaces

```javascript
s3Default: {
  key: "your-access-key",
  secret: "your-secret-key",
  region: "nyc3", // or sgp1, fra1, sfo3, etc
  bucket: "your-space",
  endpoint: "https://nyc3.digitaloceanspaces.com",
  forcePathStyle: false
}
```

**Available regions:** nyc3, sfo3, sgp1, fra1, ams3, blr1, syd1

### MinIO

```javascript
s3Default: {
  key: "your-access-key",
  secret: "your-secret-key",
  region: "us-east-1",
  bucket: "your-bucket",
  endpoint: "http://localhost:9000",
  forcePathStyle: true
}
```

Perfect for self-hosted object storage solutions.

### Backblaze B2

```javascript
s3Default: {
  key: "your-application-key-id",
  secret: "your-application-key",
  region: "us-west-000",
  bucket: "your-bucket",
  endpoint: "https://s3.us-west-000.backblazeb2.com"
}
```

**Getting Started with Backblaze B2:**
1. Create a bucket in Backblaze B2
2. Generate Application Key
3. Use S3-compatible API endpoint

### Amazon S3 (Default)

For Amazon S3, no `endpoint` configuration is needed:

```javascript
s3Default: {
  key: "your-access-key",
  secret: "your-secret-key",
  region: "us-east-1",
  bucket: "your-bucket"
}
```

### Per-Instance Configuration

You can configure different storage providers for each database instance:

```javascript
instances: [
  {
    engine: "mysql",
    host: "127.0.0.1",
    user: "root",
    password: "",
    databases: ["mydb"],
    s3: {
      key: "cloudflare-key",
      secret: "cloudflare-secret",
      region: "auto",
      bucket: "mysql-backups",
      endpoint: "https://YOUR-ACCOUNT-ID.r2.cloudflarestorage.com"
    }
  },
  {
    engine: "pg",
    isDocker: true,
    dockerImage: "postgres-container",
    user: "postgres",
    databases: ["proddb"],
    s3: {
      key: "do-spaces-key",
      secret: "do-spaces-secret",
      region: "nyc3",
      bucket: "postgres-backups",
      endpoint: "https://nyc3.digitaloceanspaces.com"
    }
  }
]
```

## Discord Notifications

The project supports automatic Discord notifications when backup failures occur.

### 1. Create a Discord Webhook

1. Open the Discord server where you want to receive notifications
2. Go to **Server Settings** > **Integrations** > **Webhooks**
3. Click **New Webhook**
4. Configure the name and channel for notifications
5. Copy the **Webhook URL**

### 2. Configure in the project

In the `config.js` file, add the Discord configuration:

```javascript
discord: {
  enabled: true, // true to enable, false to disable
  webhookUrl: "https://discord.com/api/webhooks/YOUR_WEBHOOK_URL"
}
```

### Notification Types

The system will send Discord notifications when:

- ❌ **Backup file access failure**: When the backup file cannot be read
- ❌ **Upload failure**: When the upload to storage fails
- ❌ **Critical error**: When a general error occurs in the backup process

Each notification includes:
- Database name
- Engine used (MySQL, PostgreSQL, etc)
- Detailed error message
- Backup filename (when applicable)
- Timestamp of occurrence

### Disabling Notifications

To disable Discord notifications, simply set `enabled: false` or remove the `discord` configuration from `config.js`.

## Database Configuration Examples

### MySQL (Local)

```javascript
{
  engine: "mysql",
  isDocker: false,
  host: "127.0.0.1",
  user: "root",
  port: "3306",
  password: "your-password",
  databases: ["database1", "database2"]
}
```

### MySQL (Docker)

```javascript
{
  engine: "mysql",
  isDocker: true,
  dockerImage: "mysql-container-name",
  host: "localhost",
  user: "root",
  port: "3306",
  password: "your-password",
  databases: ["database1", "database2"]
}
```

### PostgreSQL (Docker)

```javascript
{
  engine: "pg",
  isDocker: true,
  dockerImage: "postgres-container-name",
  user: "postgres",
  databases: ["database1", "database2"]
}
```

### MongoDB (Docker)

```javascript
{
  engine: "mongo",
  isDocker: true,
  dockerImage: "mongo-container-name",
  host: "localhost",
  port: "27017",
  user: "admin",
  password: "your-password",
  databases: ["database1", "database2"]
}
```

## Production Use with PM2 (Recommended)

For production deployment with automatic scheduling via cron running in background, we recommend using PM2. Learn more about it [here](http://pm2.keymetrics.io/docs/usage/quick-start/)

### 🚀 How to run s3-backup with PM2?

```bash
# 1. Install PM2 (if you don't have it)
npm install -g pm2

# 2. Run with default config file (config.js in root)
pm2 start index.js --name=s3-backup

# 3. OR run with custom config using --daemon
pm2 start npx --name="s3-backup" -- s3-backup --daemon --config ./my-config.js

# The process runs in background with cron active!
# You can close the terminal and it keeps running
```

### What's the difference?

**Without `--daemon`** (single execution):
```bash
npx s3-backup --config ./config.js
# Runs ONE backup and exits
```

**With `--daemon`** (scheduled mode):
```bash
pm2 start npx --name s3-backup -- s3-backup --daemon --config ./config.js
# Starts the cron scheduler and keeps running in background
# Executes backups automatically at configured times
```

### Usage Examples

#### Basic usage with config.js in root
```bash
pm2 start index.js --name=s3-backup
```

#### With custom configuration file
```bash
pm2 start npx --name="s3-backup-prod" -- s3-backup --daemon --config ./production.config.js
pm2 start npx --name="s3-backup-staging" -- s3-backup --daemon --config ./staging.config.js
```

#### Run multiple instances with different configs
```bash
# Production
pm2 start npx --name="backup-prod" -- s3-backup --daemon --config /etc/s3-backup/prod.js

# Staging  
pm2 start npx --name="backup-staging" -- s3-backup --daemon --config /etc/s3-backup/staging.js

# Development
pm2 start npx --name="backup-dev" -- s3-backup --daemon --config ./config.dev.js
```

### Configure to Start on System Boot

To ensure backups start automatically when the server reboots:

```bash
# Generate startup script
pm2 startup

# Execute the command that PM2 displays (will be something like):
# sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u your-user --hp /home/your-user

# Save current process list to restore on boot
pm2 save
```

Now your backup will run in background and automatically restart:
- ✅ If the process crashes
- ✅ If the server reboots
- ✅ If you logout from the terminal

### Useful PM2 Commands

```bash
pm2 start index.js --name=s3-backup    # Start the backup scheduler
pm2 logs s3-backup                      # View logs in real-time
pm2 logs s3-backup --lines 100          # View last 100 log lines
pm2 flush s3-backup                     # Clear logs
pm2 restart s3-backup                   # Restart the process
pm2 reload s3-backup                    # Reload without downtime
pm2 stop s3-backup                      # Stop the process
pm2 delete s3-backup                    # Remove from PM2
pm2 list                                # List all processes
pm2 monit                               # Interactive process monitor
pm2 info s3-backup                      # Detailed process information
pm2 save                                # Save current process list
```

### Managing Multiple Processes (When using multiple configs)

```bash
# Start specific processes from ecosystem.config.js
pm2 start ecosystem.config.js --only s3-backup-production
pm2 start ecosystem.config.js --only s3-backup-staging

# View logs of a specific process
pm2 logs s3-backup-production
pm2 logs s3-backup-staging

# Restart only one process
pm2 restart s3-backup-production

# Stop all backup processes
pm2 stop all

# Delete all backup processes
pm2 delete all

# View table with all processes
pm2 list
```

### Verify if Running in Background

```bash
# List processes
pm2 list

# View detailed status
pm2 show s3-backup

# Check logs
pm2 logs s3-backup --lines 50
```

### Advanced Configuration with Ecosystem File

Create an `ecosystem.config.js` file in the project root:

```javascript
module.exports = {
  apps: [{
    name: 's3-backup',
    script: './index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production'
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
}
```

And start with:

```bash
pm2 start ecosystem.config.js
```

## Environment Variables

You can use a `.env` file for sensitive data:

```bash
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key
DISCORD_WEBHOOK_URL=your-webhook-url
```

Then reference them in your config:

```javascript
require('dotenv').config()

module.exports = {
  discord: {
    enabled: true,
    webhookUrl: process.env.DISCORD_WEBHOOK_URL
  },
  s3Default: {
    key: process.env.S3_ACCESS_KEY,
    secret: process.env.S3_SECRET_KEY,
    region: "us-east-1",
    bucket: "your-bucket"
  }
}
```

## Troubleshooting

### Error: mysqldump not found

Install MySQL client tools:
```bash
# Ubuntu/Debian
sudo apt-get install mysql-client

# macOS
brew install mysql-client
```

### Error: pg_dump not found

Install PostgreSQL client tools:
```bash
# Ubuntu/Debian
sudo apt-get install postgresql-client

# macOS
brew install postgresql
```

### Upload fails to Cloudflare R2

Make sure:
- Your endpoint URL includes your account ID
- The region is set to `"auto"`
- Your bucket has the correct permissions

### Discord notifications not working

Verify:
- The webhook URL is correct and active
- The `enabled` flag is set to `true`
- Your server has internet access to Discord

## License

ISC

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Author

Igor Trindade

## Support

If you encounter any issues or have questions, please open an issue on GitHub.
