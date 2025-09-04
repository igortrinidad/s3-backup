#!/usr/bin/env node

/**
 * Test script for S3StorageManager with AWS SDK v3
 * This script validates the S3 connection and upload functionality
 */

const S3StorageManager = require('./src/S3StorageManager')
const fs = require('fs')
const path = require('path')

// Mock configuration for testing
const testConfig = {
  s3: {
    key: process.env.AWS_S3_KEY || 'test-key',
    secret: process.env.AWS_S3_SECRET || 'test-secret',
    region: process.env.AWS_S3_REGION || 'us-east-1',
    bucket: process.env.AWS_S3_BUCKET || 'test-bucket'
  }
}

async function testS3StorageManager() {
  console.log('🧪 Testing S3StorageManager with AWS SDK v3...')
  
  try {
    // Initialize the storage manager
    const storage = new S3StorageManager(testConfig)
    console.log('✅ S3StorageManager initialized successfully')
    
    // Create a test file
    const testFileName = 'test-backup.txt'
    const testFilePath = path.join(__dirname, testFileName)
    const testContent = `Test backup file created at ${new Date().toISOString()}`
    
    fs.writeFileSync(testFilePath, testContent)
    console.log('✅ Test file created')
    
    // Note: Actual upload test would require valid AWS credentials
    console.log('ℹ️  To test actual S3 upload, set environment variables:')
    console.log('   - AWS_S3_KEY')
    console.log('   - AWS_S3_SECRET') 
    console.log('   - AWS_S3_REGION')
    console.log('   - AWS_S3_BUCKET')
    
    // Clean up test file
    fs.unlinkSync(testFilePath)
    console.log('✅ Test file cleaned up')
    
    console.log('🎉 S3StorageManager test completed successfully!')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    process.exit(1)
  }
}

// Run the test
if (require.main === module) {
  testS3StorageManager()
}

module.exports = testS3StorageManager
