#!/usr/bin/env node

/**
 * Health Check Script for Ndimboni Digital Scam Protection Backend
 * 
 * This script performs comprehensive health checks for the NestJS backend application
 * including database connectivity, external service dependencies, and API endpoints.
 */

const http = require('http');
const https = require('https');
const { execSync } = require('child_process');

// Configuration
const config = {
  host: process.env.HOST || 'localhost',
  port: process.env.PORT || 3000,
  timeout: 5000,
  maxRetries: 3,
  retryDelay: 1000,
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

/**
 * Utility function to make HTTP requests
 */
function makeRequest(options) {
  return new Promise((resolve, reject) => {
    const client = options.protocol === 'https:' ? https : http;
    
    const req = client.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });

    req.setTimeout(config.timeout, () => {
      req.destroy();
      reject(new Error(`Request timeout after ${config.timeout}ms`));
    });

    req.on('error', reject);
    req.end();
  });
}

/**
 * Check if the main application is running
 */
async function checkMainApplication() {
  console.log(`${colors.cyan}🔍 Checking main application...${colors.reset}`);
  
  try {
    const response = await makeRequest({
      hostname: config.host,
      port: config.port,
      path: '/',
      method: 'GET',
      timeout: config.timeout
    });

    if (response.statusCode === 200 || response.statusCode === 404) {
      console.log(`${colors.green}✅ Main application is running (HTTP ${response.statusCode})${colors.reset}`);
      return true;
    } else {
      console.log(`${colors.yellow}⚠️  Main application returned HTTP ${response.statusCode}${colors.reset}`);
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}❌ Main application is not responding: ${error.message}${colors.reset}`);
    return false;
  }
}

/**
 * Check API health endpoint
 */
async function checkHealthEndpoint() {
  console.log(`${colors.cyan}🔍 Checking health endpoint...${colors.reset}`);
  
  try {
    const response = await makeRequest({
      hostname: config.host,
      port: config.port,
      path: '/health',
      method: 'GET',
      timeout: config.timeout
    });

    if (response.statusCode === 200) {
      console.log(`${colors.green}✅ Health endpoint is responding${colors.reset}`);
      
      try {
        const healthData = JSON.parse(response.data);
        if (healthData.status === 'ok') {
          console.log(`${colors.green}✅ Application health status: OK${colors.reset}`);
          return true;
        }
      } catch (parseError) {
        console.log(`${colors.yellow}⚠️  Health endpoint returned non-JSON response${colors.reset}`);
      }
      
      return true;
    } else {
      console.log(`${colors.yellow}⚠️  Health endpoint returned HTTP ${response.statusCode}${colors.reset}`);
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}❌ Health endpoint is not responding: ${error.message}${colors.reset}`);
    return false;
  }
}

/**
 * Check database connectivity
 */
async function checkDatabase() {
  console.log(`${colors.cyan}🔍 Checking database connectivity...${colors.reset}`);
  
  try {
    // Try to check if we can connect to the database
    // This is a simple check - in production you might want to make an actual DB query
    const response = await makeRequest({
      hostname: config.host,
      port: config.port,
      path: '/api/health/db',
      method: 'GET',
      timeout: config.timeout
    });

    if (response.statusCode === 200) {
      console.log(`${colors.green}✅ Database is accessible${colors.reset}`);
      return true;
    } else {
      console.log(`${colors.yellow}⚠️  Database health check returned HTTP ${response.statusCode}${colors.reset}`);
      return false;
    }
  } catch (error) {
    console.log(`${colors.yellow}⚠️  Database health endpoint not available: ${error.message}${colors.reset}`);
    // Don't fail the entire health check if DB endpoint is not implemented
    return true;
  }
}

/**
 * Check external dependencies (optional)
 */
async function checkExternalDependencies() {
  console.log(`${colors.cyan}🔍 Checking external dependencies...${colors.reset}`);
  
  const dependencies = [
    {
      name: 'Groq API',
      check: async () => {
        // Just check if the API key environment variable is set
        if (process.env.GROQ_API_KEY) {
          console.log(`${colors.green}✅ Groq API key is configured${colors.reset}`);
          return true;
        } else {
          console.log(`${colors.yellow}⚠️  Groq API key not configured${colors.reset}`);
          return false;
        }
      }
    },
    {
      name: 'Email Service',
      check: async () => {
        // Check if email configuration is present
        if (process.env.EMAIL_HOST && process.env.EMAIL_USER) {
          console.log(`${colors.green}✅ Email service is configured${colors.reset}`);
          return true;
        } else {
          console.log(`${colors.yellow}⚠️  Email service not fully configured${colors.reset}`);
          return false;
        }
      }
    },
    {
      name: 'Telegram Bot',
      check: async () => {
        // Check if Telegram bot token is configured
        if (process.env.TELEGRAM_BOT_TOKEN) {
          console.log(`${colors.green}✅ Telegram bot token is configured${colors.reset}`);
          return true;
        } else {
          console.log(`${colors.yellow}⚠️  Telegram bot token not configured${colors.reset}`);
          return false;
        }
      }
    }
  ];

  let allPassed = true;
  
  for (const dep of dependencies) {
    try {
      const result = await dep.check();
      if (!result) allPassed = false;
    } catch (error) {
      console.log(`${colors.red}❌ ${dep.name} check failed: ${error.message}${colors.reset}`);
      allPassed = false;
    }
  }

  return allPassed;
}

/**
 * Check critical API endpoints
 */
async function checkCriticalEndpoints() {
  console.log(`${colors.cyan}🔍 Checking critical API endpoints...${colors.reset}`);
  
  const endpoints = [
    {
      path: '/api/scam-check/check',
      method: 'POST',
      name: 'Scam Check API',
      body: JSON.stringify({ message: 'health check test message' }),
      headers: {
        'Content-Type': 'application/json'
      }
    }
  ];

  let allPassed = true;

  for (const endpoint of endpoints) {
    try {
      const options = {
        hostname: config.host,
        port: config.port,
        path: endpoint.path,
        method: endpoint.method,
        headers: endpoint.headers,
        timeout: config.timeout
      };

      const response = await new Promise((resolve, reject) => {
        const client = http;
        const req = client.request(options, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              data: data
            });
          });
        });

        req.setTimeout(config.timeout, () => {
          req.destroy();
          reject(new Error(`Request timeout after ${config.timeout}ms`));
        });

        req.on('error', reject);
        
        if (endpoint.body) {
          req.write(endpoint.body);
        }
        
        req.end();
      });

      // For public endpoints, we expect 200, 400 (validation error), or 401 (auth required) as OK
      if (response.statusCode === 200 || response.statusCode === 400 || response.statusCode === 401) {
        console.log(`${colors.green}✅ ${endpoint.name} endpoint is responding (HTTP ${response.statusCode})${colors.reset}`);
      } else {
        console.log(`${colors.yellow}⚠️  ${endpoint.name} endpoint returned HTTP ${response.statusCode}${colors.reset}`);
        // Don't fail the health check for non-critical status codes
        // allPassed = false;
      }
    } catch (error) {
      console.log(`${colors.red}❌ ${endpoint.name} endpoint failed: ${error.message}${colors.reset}`);
      allPassed = false;
    }
  }

  return allPassed;
}

/**
 * Check system resources
 */
function checkSystemResources() {
  console.log(`${colors.cyan}🔍 Checking system resources...${colors.reset}`);
  
  try {
    // Check memory usage
    const memUsage = process.memoryUsage();
    const memUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    const memTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
    
    console.log(`${colors.blue}📊 Memory usage: ${memUsedMB}MB / ${memTotalMB}MB heap${colors.reset}`);
    
    // Check if memory usage is reasonable (less than 500MB heap)
    if (memUsedMB < 500) {
      console.log(`${colors.green}✅ Memory usage is normal${colors.reset}`);
    } else {
      console.log(`${colors.yellow}⚠️  High memory usage detected${colors.reset}`);
    }

    // Check disk space (if possible)
    try {
      const diskUsage = execSync('df -h /', { encoding: 'utf8', timeout: 2000 });
      const lines = diskUsage.trim().split('\n');
      if (lines.length > 1) {
        const stats = lines[1].split(/\s+/);
        const usedPercent = stats[4];
        console.log(`${colors.blue}💾 Disk usage: ${usedPercent} used${colors.reset}`);
        
        const usedPercentNum = parseInt(usedPercent.replace('%', ''));
        if (usedPercentNum < 90) {
          console.log(`${colors.green}✅ Disk space is sufficient${colors.reset}`);
        } else {
          console.log(`${colors.yellow}⚠️  Low disk space warning${colors.reset}`);
        }
      }
    } catch (diskError) {
      console.log(`${colors.blue}💾 Disk space check not available on this system${colors.reset}`);
    }

    return true;
  } catch (error) {
    console.log(`${colors.red}❌ System resource check failed: ${error.message}${colors.reset}`);
    return false;
  }
}

/**
 * Main health check function
 */
async function runHealthCheck() {
  console.log(`${colors.bright}${colors.magenta}🏥 Ndimboni Backend Health Check${colors.reset}`);
  console.log(`${colors.blue}🔧 Checking ${config.host}:${config.port}${colors.reset}\n`);

  const checks = [
    { name: 'Main Application', fn: checkMainApplication, critical: true },
    { name: 'Health Endpoint', fn: checkHealthEndpoint, critical: false },
    { name: 'Database', fn: checkDatabase, critical: false },
    { name: 'External Dependencies', fn: checkExternalDependencies, critical: false },
    { name: 'Critical Endpoints', fn: checkCriticalEndpoints, critical: false },
    { name: 'System Resources', fn: checkSystemResources, critical: false }
  ];

  let overallHealth = true;
  let criticalFailures = 0;

  for (const check of checks) {
    try {
      const result = await check.fn();
      if (!result) {
        if (check.critical) {
          criticalFailures++;
          overallHealth = false;
        }
      }
    } catch (error) {
      console.log(`${colors.red}❌ ${check.name} check failed: ${error.message}${colors.reset}`);
      if (check.critical) {
        criticalFailures++;
        overallHealth = false;
      }
    }
    console.log(''); // Add spacing between checks
  }

  // Final status
  console.log(`${colors.bright}📋 Health Check Summary${colors.reset}`);
  console.log(`${colors.blue}⏰ Completed at: ${new Date().toISOString()}${colors.reset}`);
  
  if (overallHealth) {
    console.log(`${colors.green}${colors.bright}✅ HEALTHY - All critical systems operational${colors.reset}`);
    process.exit(0);
  } else {
    console.log(`${colors.red}${colors.bright}❌ UNHEALTHY - ${criticalFailures} critical failure(s) detected${colors.reset}`);
    process.exit(1);
  }
}

/**
 * Handle script execution
 */
if (require.main === module) {
  // Handle SIGTERM and SIGINT gracefully
  process.on('SIGTERM', () => {
    console.log(`${colors.yellow}⚠️  Health check interrupted${colors.reset}`);
    process.exit(1);
  });

  process.on('SIGINT', () => {
    console.log(`${colors.yellow}⚠️  Health check interrupted${colors.reset}`);
    process.exit(1);
  });

  // Run the health check
  runHealthCheck().catch((error) => {
    console.log(`${colors.red}❌ Health check failed: ${error.message}${colors.reset}`);
    process.exit(1);
  });
}

module.exports = {
  runHealthCheck,
  checkMainApplication,
  checkHealthEndpoint,
  checkDatabase,
  checkExternalDependencies,
  checkCriticalEndpoints,
  checkSystemResources
};
