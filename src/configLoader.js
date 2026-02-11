const path = require('path')

let config = null

/**
 * Load configuration from a file path
 * @param {string} configPath - Path to the configuration file
 * @returns {Object} Configuration object
 */
function loadConfig(configPath = null) {
  if (config) {
    return config
  }

  if (configPath) {
    try {
      const absolutePath = path.isAbsolute(configPath) 
        ? configPath 
        : path.resolve(process.cwd(), configPath)
      
      config = require(absolutePath)
      console.log(`Using configuration from: ${absolutePath}`)
    } catch (error) {
      throw new Error(`Failed to load config from ${configPath}: ${error.message}`)
    }
  } else {
    // Try to load from default location (project root)
    try {
      config = require('../config')
    } catch (error) {
      throw new Error('No configuration file found. Please provide a config file path or create a config.js in the project root.')
    }
  }

  return config
}

/**
 * Set configuration object directly (useful for testing)
 * @param {Object} newConfig - Configuration object
 */
function setConfig(newConfig) {
  config = newConfig
}

/**
 * Get current configuration
 * @returns {Object} Configuration object
 */
function getConfig() {
  if (!config) {
    return loadConfig()
  }
  return config
}

/**
 * Reset configuration (useful for testing)
 */
function resetConfig() {
  config = null
}

module.exports = {
  loadConfig,
  setConfig,
  getConfig,
  resetConfig
}
