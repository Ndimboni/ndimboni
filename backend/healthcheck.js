#!/usr/bin/env node

/**
 * Simple Health Check - Only checks if application responds on port 3000
 */

const http = require('http');

// Configuration
const config = {
  host: process.env.HOST || 'localhost',
  port: process.env.PORT || 3000,
  timeout: 5000,
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
};

/**
 * Simple HTTP check - only verifies if we get a response on the configured port
 */
async function checkPort() {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: config.host,
        port: config.port,
        path: '/',
        method: 'GET',
        timeout: config.timeout,
      },
      (res) => {
        // Any response (200, 404, etc.) means the app is running
        resolve(true);
      },
    );

    req.setTimeout(config.timeout, () => {
      req.destroy();
      reject(new Error(`No response on port ${config.port}`));
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

/**
 * Main health check
 */
async function runHealthCheck() {
  try {
    await checkPort();
    console.log(
      `${colors.green}✅ Application responding on port ${config.port}${colors.reset}`,
    );
    process.exit(0);
  } catch (error) {
    console.log(
      `${colors.red}❌ No response on port ${config.port}: ${error.message}${colors.reset}`,
    );
    process.exit(1);
  }
}

// Run the health check
if (require.main === module) {
  runHealthCheck();
}
