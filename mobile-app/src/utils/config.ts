import { AppConfig } from '../types';

/**
 * Configuration file for the Ndimboni Scam Guard mobile app
 */

// Environment configurations
const environments = {
  development: {
    API_BASE_URL: 'http://localhost:3000',
    API_TIMEOUT: 10000,
    CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
    DEBUG_MODE: true,
  },
  production: {
    API_BASE_URL: 'https://your-production-url.com', // Update this
    API_TIMEOUT: 15000,
    CACHE_DURATION: 10 * 60 * 1000, // 10 minutes
    DEBUG_MODE: false,
  }
};

// Determine current environment
const currentEnv = __DEV__ ? 'development' : 'production';
const config = environments[currentEnv];

// App-specific configurations
const appConfig: AppConfig = {
  ...config,
  
  // Feature flags
  FEATURES: {
    CALL_MONITORING: true,
    SMS_MONITORING: true,
    BACKGROUND_DETECTION: true,
    MANUAL_REPORTING: true,
    DETECTION_HISTORY: true,
  },
  
  // Phone number formatting
  PHONE_CONFIG: {
    DEFAULT_COUNTRY_CODE: '+250',
    RWANDA_PREFIX: '250',
    MIN_LENGTH: 10,
    MAX_LENGTH: 15,
  },
};

// Additional constants
export const APP_CONSTANTS = {
  APP_NAME: 'Ndimboni Scam Guard',
  APP_VERSION: '1.0.0',
  
  // Notification settings
  NOTIFICATIONS: {
    SHOW_SCAMMER_ALERTS: true,
    PLAY_ALERT_SOUND: true,
    VIBRATE_ON_ALERT: true,
    ALERT_PRIORITY: 'high' as const,
  },
  
  // Data management
  DATA: {
    DETECTION_HISTORY_LIMIT: 100,
    CACHE_CLEANUP_INTERVAL: 24 * 60 * 60 * 1000, // 24 hours
    LOG_RETENTION_DAYS: 7,
  },
  
  // API endpoints
  ENDPOINTS: {
    CHECK_SCAMMER: '/api/scammer-reports/check',
    REPORT_SCAMMER: '/api/scammer-reports/report',
    GET_STATS: '/api/scammer-reports/stats',
  },
  
  // Error messages
  ERROR_MESSAGES: {
    NETWORK_ERROR: 'Unable to connect to the server. Please check your internet connection.',
    SERVER_ERROR: 'Server error occurred. Please try again later.',
    INVALID_PHONE: 'Please enter a valid phone number.',
    REPORT_FAILED: 'Failed to submit your report. Please try again.',
    CHECK_FAILED: 'Failed to check the phone number. Please try again.',
  },
  
  // Success messages
  SUCCESS_MESSAGES: {
    REPORT_SUBMITTED: 'Thank you for reporting this scammer. Your report helps protect others.',
    MONITORING_ENABLED: 'Scam protection is now active.',
    MONITORING_DISABLED: 'Scam protection has been disabled.',
  },
};

export default appConfig;
