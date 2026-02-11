/**
 * Main config
 */
module.exports = {
  debug: true,
  runOnStartup: false,
  cron_time: "0 5 * * 0",
  timezone: "America/Sao_Paulo",
  
  /**
   * Discord notifications configuration
   * Get your webhook URL from Discord:
   * Server Settings > Integrations > Webhooks > New Webhook
   */
  discord: {
    enabled: true, // Set to false to disable notifications
    webhookUrl: "" // Your Discord webhook URL
  },
  
  /**
   * Default S3 configuration (AWS S3)
   * This configuration is used for all instances unless overridden
   */
  s3Default: {
    key: "",
    secret: "",
    region: "us-east-1",
    bucket: ""
    // Optional: endpoint (for S3-compatible providers)
    // Optional: forcePathStyle (required for some providers)
  },

  /**
   * Examples of S3-compatible storage providers:
   * 
   * Cloudflare R2:
   * s3Default: {
   *   key: "your-access-key",
   *   secret: "your-secret-key",
   *   region: "auto",
   *   bucket: "your-bucket",
   *   endpoint: "https://YOUR-ACCOUNT-ID.r2.cloudflarestorage.com",
   *   forcePathStyle: false
   * }
   * 
   * DigitalOcean Spaces:
   * s3Default: {
   *   key: "your-access-key",
   *   secret: "your-secret-key",
   *   region: "nyc3",
   *   bucket: "your-space",
   *   endpoint: "https://nyc3.digitaloceanspaces.com",
   *   forcePathStyle: false
   * }
   * 
   * MinIO:
   * s3Default: {
   *   key: "your-access-key",
   *   secret: "your-secret-key",
   *   region: "us-east-1",
   *   bucket: "your-bucket",
   *   endpoint: "http://localhost:9000",
   *   forcePathStyle: true
   * }
   * 
   * Backblaze B2:
   * s3Default: {
   *   key: "your-application-key-id",
   *   secret: "your-application-key",
   *   region: "us-west-000",
   *   bucket: "your-bucket",
   *   endpoint: "https://s3.us-west-000.backblazeb2.com"
   * }
   */

  instances: [
    {
      engine: "mysql",
      isDocker: false,
      host: "127.0.0.1",
      user: "root",
      port: "3306",
      password: "",
      databases: [""]
      // Optional: Override s3Default for this instance
      // s3: {
      //   key: "",
      //   secret: "",
      //   region: "us-east-1",
      //   bucket: "",
      //   endpoint: "",
      //   forcePathStyle: false
      // }
    },
    {
      engine: "pg",
      isDocker: true,
      dockerImage: "",
      user: "",
      databases: [""]
    }
  ]
}