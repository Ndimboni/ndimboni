import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NdimboniAPI from './api';
import { DetectionRecord, ServiceStatus, ScammerData } from '../types';
import appConfig, { APP_CONSTANTS } from '../utils/config';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

class ScamDetectionService {
  private isInitialized: boolean = false;
  private notificationPermission: boolean = false;
  private alertHistory: Map<string, number> = new Map();

  async init(): Promise<void> {
    try {
      await this.requestPermissions();
      this.isInitialized = true;
      console.log('ScamDetectionService initialized successfully');
    } catch (error) {
      console.error('Failed to initialize ScamDetectionService:', error);
    }
  }

  /**
   * Request necessary permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      // Request notification permissions
      const { status } = await Notifications.requestPermissionsAsync();
      this.notificationPermission = status === 'granted';

      if (!this.notificationPermission) {
        console.warn('Notification permission not granted');
      }

      return this.notificationPermission;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  }

  /**
   * Check if a phone number is a scammer and show alert if needed
   */
  async checkAndAlertScammer(
    phoneNumber: string, 
    context: 'call' | 'sms' | 'test' = 'unknown' as any
  ): Promise<boolean> {
    try {
      if (!phoneNumber || phoneNumber.length < 5) {
        return false;
      }

      // Prevent duplicate alerts for the same number within 5 minutes
      const alertKey = `${phoneNumber}_${context}`;
      const lastAlert = this.alertHistory.get(alertKey);
      if (lastAlert && Date.now() - lastAlert < 5 * 60 * 1000) {
        return false;
      }

      if (appConfig.DEBUG_MODE) {
        console.log(`Checking ${context} from: ${phoneNumber}`);
      }

      const result = await NdimboniAPI.checkScammerPhone(phoneNumber);

      if (result.isScammer) {
        this.alertHistory.set(alertKey, Date.now());
        
        // Show notification
        await this.showScammerAlert(phoneNumber, context, result.data);
        
        // Log the detection
        await this.logScammerDetection(phoneNumber, context, result.data);
        
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error checking scammer:', error);
      return false;
    }
  }

  /**
   * Show scammer alert notification
   */
  async showScammerAlert(
    phoneNumber: string, 
    context: 'call' | 'sms' | 'test', 
    scammerData?: ScammerData
  ): Promise<void> {
    try {
      if (!this.notificationPermission) {
        console.warn('Cannot show notification: permission not granted');
        return;
      }

      const contextText = context === 'call' ? 'incoming call' : 
                         context === 'sms' ? 'SMS message' : 'contact';

      const title = '🚨 SCAMMER ALERT!';
      const body = `Warning: ${contextText} from reported scammer ${phoneNumber}`;

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
          data: {
            phoneNumber,
            context,
            scammerData,
            timestamp: Date.now(),
          },
        },
        trigger: null, // Show immediately
      });

      if (appConfig.DEBUG_MODE) {
        console.log(`Scammer alert shown for ${phoneNumber} (${context})`);
      }
    } catch (error) {
      console.error('Error showing scammer alert:', error);
    }
  }

  /**
   * Log scammer detection for analytics
   */
  private async logScammerDetection(
    phoneNumber: string, 
    context: 'call' | 'sms' | 'test', 
    scammerData?: ScammerData
  ): Promise<void> {
    try {
      const detection: DetectionRecord = {
        phoneNumber,
        context,
        scammerData,
        timestamp: Date.now(),
        deviceInfo: Platform.OS,
      };

      // Store locally for now (could be sent to analytics later)
      const key = `detection_${Date.now()}`;
      await AsyncStorage.setItem(key, JSON.stringify(detection));

      if (appConfig.DEBUG_MODE) {
        console.log('Scammer detection logged:', detection);
      }
    } catch (error) {
      console.error('Error logging detection:', error);
    }
  }

  /**
   * Get detection history from local storage
   */
  async getDetectionHistory(): Promise<DetectionRecord[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const detectionKeys = keys.filter(key => key.startsWith('detection_'));
      
      const detections: DetectionRecord[] = [];
      for (const key of detectionKeys) {
        const detection = await AsyncStorage.getItem(key);
        if (detection) {
          detections.push(JSON.parse(detection));
        }
      }

      // Sort by timestamp, newest first
      detections.sort((a, b) => b.timestamp - a.timestamp);
      
      return detections;
    } catch (error) {
      console.error('Error getting detection history:', error);
      return [];
    }
  }

  /**
   * Clear old detection logs (older than 30 days)
   */
  async cleanupDetectionHistory(): Promise<void> {
    try {
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      const keys = await AsyncStorage.getAllKeys();
      const detectionKeys = keys.filter(key => key.startsWith('detection_'));
      
      const keysToRemove: string[] = [];
      for (const key of detectionKeys) {
        const detection = await AsyncStorage.getItem(key);
        if (detection) {
          const parsed: DetectionRecord = JSON.parse(detection);
          if (parsed.timestamp < thirtyDaysAgo) {
            keysToRemove.push(key);
          }
        }
      }

      if (keysToRemove.length > 0) {
        await AsyncStorage.multiRemove(keysToRemove);
        console.log(`Cleaned up ${keysToRemove.length} old detection records`);
      }
    } catch (error) {
      console.error('Error cleaning up detection history:', error);
    }
  }

  /**
   * Manually check a phone number (for user-initiated checks)
   */
  async manualCheck(phoneNumber: string): Promise<{
    success: boolean;
    isScammer?: boolean;
    data?: ScammerData;
    message?: string;
    error?: string;
  }> {
    try {
      const result = await NdimboniAPI.checkScammerPhone(phoneNumber);
      return {
        success: true,
        isScammer: result.isScammer,
        data: result.data,
        message: result.message,
      };
    } catch (error) {
      console.error('Error in manual check:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get service status
   */
  getStatus(): ServiceStatus {
    return {
      initialized: this.isInitialized,
      notificationPermission: this.notificationPermission,
      alertHistorySize: this.alertHistory.size,
    };
  }

  /**
   * Clear alert history (for testing or reset)
   */
  clearAlertHistory(): void {
    this.alertHistory.clear();
  }
}

export default new ScamDetectionService();
