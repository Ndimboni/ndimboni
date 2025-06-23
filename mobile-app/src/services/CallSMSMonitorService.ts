import {
  Platform,
  DeviceEventEmitter,
  NativeEventEmitter,
  NativeModules,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ScamDetectionService from "./ScamDetectionService";
import { CallEvent, SMSEvent, MonitoringStats } from "../types";
import appConfig from "../utils/config";

// Import native modules (these may require ejecting from Expo managed workflow)
import SmsAndroid from "react-native-sms-android";
import CallDetection from "react-native-call-detection";

/**
 * Service for monitoring incoming calls and SMS messages
 * Note: Some features require ejecting from Expo managed workflow or using Expo Development Build
 */
class CallSMSMonitorService {
  private isMonitoring: boolean = false;
  private callListeners: any[] = [];
  private smsListeners: any[] = [];
  private lastProcessedCall: string | null = null;
  private lastProcessedSMS: string | null = null;
  private callDetector: any = null;

  /**
   * Start monitoring calls and SMS
   */
  async startMonitoring(): Promise<boolean> {
    try {
      if (this.isMonitoring) {
        console.log("Monitoring already active");
        return true;
      }

      // Check if monitoring is enabled in settings
      const monitoringEnabled = await this.isMonitoringEnabled();
      if (!monitoringEnabled) {
        console.log("Monitoring disabled in settings");
        return false;
      }

      console.log("Starting call and SMS monitoring...");

      if (Platform.OS === "android") {
        this.startAndroidMonitoring();
      } else if (Platform.OS === "ios") {
        this.startIOSMonitoring();
      }

      this.isMonitoring = true;
      console.log("Call and SMS monitoring started");
      return true;
    } catch (error) {
      console.error("Error starting monitoring:", error);
      return false;
    }
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    try {
      console.log("Stopping call and SMS monitoring...");

      // Remove all listeners
      this.callListeners.forEach((listener) => {
        if (listener && typeof listener.remove === "function") {
          listener.remove();
        }
      });

      this.smsListeners.forEach((listener) => {
        if (listener && typeof listener.remove === "function") {
          listener.remove();
        }
      });

      // Stop call detector
      if (this.callDetector) {
        this.callDetector.dispose();
        this.callDetector = null;
      }

      this.callListeners = [];
      this.smsListeners = [];
      this.isMonitoring = false;

      console.log("Monitoring stopped");
    } catch (error) {
      console.error("Error stopping monitoring:", error);
    }
  }

  /**
   * Android-specific monitoring setup
   */
  private startAndroidMonitoring(): void {
    try {
      // Set up call detection for Android
      this.setupAndroidCallDetection();

      // Set up SMS monitoring for Android
      this.setupAndroidSMSDetection();

      console.log("Android monitoring setup complete");
    } catch (error) {
      console.error("Error setting up Android monitoring:", error);
      // Fallback to simulation for development
      this.simulateCallDetection();
      this.simulateSMSDetection();
    }
  }

  /**
   * iOS-specific monitoring setup
   */
  private startIOSMonitoring(): void {
    try {
      // iOS has limited call/SMS monitoring capabilities
      // For now, use simulation
      this.simulateCallDetection();

      console.log("iOS monitoring setup complete (limited functionality)");
    } catch (error) {
      console.error("Error setting up iOS monitoring:", error);
    }
  }

  /**
   * Set up Android call detection using react-native-call-detection
   */
  private setupAndroidCallDetection(): void {
    try {
      if (!CallDetection) {
        throw new Error("CallDetection module not available");
      }

      this.callDetector = new CallDetection({
        onStart: (data: any) => {
          console.log("Call started:", data);
          this.handleIncomingCall(data.phoneNumber, "incoming");
        },
        onPickup: (data: any) => {
          console.log("Call answered:", data);
          this.handleIncomingCall(data.phoneNumber, "answered");
        },
        onEnd: (data: any) => {
          console.log("Call ended:", data);
          this.handleIncomingCall(data.phoneNumber, "ended");
        },
      });

      console.log("Android call detection initialized");
    } catch (error) {
      console.error("Error setting up Android call detection:", error);
      throw error;
    }
  }

  /**
   * Set up Android SMS detection using react-native-sms-android
   */
  private setupAndroidSMSDetection(): void {
    try {
      if (!SmsAndroid) {
        throw new Error("SmsAndroid module not available");
      }

      // Listen for SMS received events
      const smsListener = DeviceEventEmitter.addListener(
        "onSMSReceived",
        (message: any) => {
          console.log("SMS received:", message);
          this.handleIncomingSMS(
            message.originatingAddress || message.address,
            message.body || message.message,
            Date.now()
          );
        }
      );

      this.smsListeners.push(smsListener);
      console.log("Android SMS detection initialized");
    } catch (error) {
      console.error("Error setting up Android SMS detection:", error);
      throw error;
    }
  }

  /**
   * Simulate call detection for development/testing
   */
  private simulateCallDetection(): void {
    console.log("Setting up call detection simulation...");

    // Simulate a test call every 30 seconds for demo purposes
    if (appConfig.DEBUG_MODE) {
      const interval = setInterval(() => {
        if (this.isMonitoring) {
          this.handleIncomingCall("+250788123456", "incoming");
        } else {
          clearInterval(interval);
        }
      }, 30000);
    }
  }

  /**
   * Simulate SMS detection for development/testing
   */
  private simulateSMSDetection(): void {
    console.log("Setting up SMS detection simulation...");

    // Simulate a test SMS every 45 seconds for demo purposes
    if (appConfig.DEBUG_MODE) {
      const interval = setInterval(() => {
        if (this.isMonitoring) {
          this.handleIncomingSMS(
            "+250788789012",
            "Test scam message",
            Date.now()
          );
        } else {
          clearInterval(interval);
        }
      }, 45000);
    }
  }

  /**
   * Handle incoming call
   */
  private async handleIncomingCall(
    phoneNumber: string,
    callState: "incoming" | "answered" | "ended"
  ): Promise<void> {
    try {
      console.log(`Incoming call: ${phoneNumber} (${callState})`);

      // Avoid duplicate processing
      const callId = `${phoneNumber}_${callState}_${Date.now()}`;
      if (this.lastProcessedCall === callId) {
        return;
      }
      this.lastProcessedCall = callId;

      // Only check for scammers on incoming calls
      if (callState === "incoming") {
        await ScamDetectionService.checkAndAlertScammer(phoneNumber, "call");
      }

      // Log the call
      await this.logCall(phoneNumber, callState);
    } catch (error) {
      console.error("Error handling incoming call:", error);
    }
  }

  /**
   * Handle incoming SMS
   */
  private async handleIncomingSMS(
    phoneNumber: string,
    message: string,
    timestamp: number
  ): Promise<void> {
    try {
      console.log(`Incoming SMS from: ${phoneNumber}`);

      // Avoid duplicate processing
      const smsId = `${phoneNumber}_${timestamp}`;
      if (this.lastProcessedSMS === smsId) {
        return;
      }
      this.lastProcessedSMS = smsId;

      // Check if sender is a known scammer
      await ScamDetectionService.checkAndAlertScammer(phoneNumber, "sms");

      // Log the SMS
      await this.logSMS(phoneNumber, message, timestamp);
    } catch (error) {
      console.error("Error handling incoming SMS:", error);
    }
  }

  /**
   * Log call details
   */
  private async logCall(phoneNumber: string, callState: string): Promise<void> {
    try {
      const callLog: CallEvent = {
        phoneNumber,
        callState: callState as "incoming" | "answered" | "ended",
        timestamp: Date.now(),
      };

      const key = `call_log_${Date.now()}`;
      await AsyncStorage.setItem(key, JSON.stringify(callLog));
    } catch (error) {
      console.error("Error logging call:", error);
    }
  }

  /**
   * Log SMS details
   */
  private async logSMS(
    phoneNumber: string,
    message: string,
    timestamp: number
  ): Promise<void> {
    try {
      const smsLog: SMSEvent = {
        phoneNumber,
        message: message.substring(0, 100), // Truncate for privacy
        timestamp,
      };

      const key = `sms_log_${timestamp}`;
      await AsyncStorage.setItem(key, JSON.stringify(smsLog));
    } catch (error) {
      console.error("Error logging SMS:", error);
    }
  }

  /**
   * Check if monitoring is enabled in app settings
   */
  async isMonitoringEnabled(): Promise<boolean> {
    try {
      const enabled = await AsyncStorage.getItem("monitoring_enabled");
      return enabled !== "false"; // Default to true
    } catch (error) {
      console.error("Error checking monitoring setting:", error);
      return true; // Default to enabled
    }
  }

  /**
   * Enable/disable monitoring
   */
  async setMonitoringEnabled(enabled: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem("monitoring_enabled", enabled.toString());

      if (enabled && !this.isMonitoring) {
        this.startMonitoring();
      } else if (!enabled && this.isMonitoring) {
        this.stopMonitoring();
      }
    } catch (error) {
      console.error("Error setting monitoring enabled:", error);
    }
  }

  /**
   * Get monitoring statistics
   */
  async getMonitoringStats(): Promise<MonitoringStats> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const callLogs = keys.filter((key) => key.startsWith("call_log_"));
      const smsLogs = keys.filter((key) => key.startsWith("sms_log_"));

      // Count detections from today
      const detectionHistory = await ScamDetectionService.getDetectionHistory();
      const today = new Date().toDateString();
      const detectionsToday = detectionHistory.filter(
        (d) => new Date(d.timestamp).toDateString() === today
      ).length;

      return {
        isMonitoring: this.isMonitoring,
        totalCalls: callLogs.length,
        totalSMS: smsLogs.length,
        detectionsToday,
        lastUpdate: Date.now(),
      };
    } catch (error) {
      console.error("Error getting monitoring stats:", error);
      return {
        isMonitoring: this.isMonitoring,
        totalCalls: 0,
        totalSMS: 0,
        detectionsToday: 0,
        lastUpdate: Date.now(),
      };
    }
  }

  /**
   * Clean up old logs (older than 7 days)
   */
  async cleanupLogs(): Promise<void> {
    try {
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const keys = await AsyncStorage.getAllKeys();
      const logKeys = keys.filter(
        (key) => key.startsWith("call_log_") || key.startsWith("sms_log_")
      );

      const keysToRemove: string[] = [];
      for (const key of logKeys) {
        const timestamp = parseInt(key.split("_").pop() || "0");
        if (timestamp < sevenDaysAgo) {
          keysToRemove.push(key);
        }
      }

      if (keysToRemove.length > 0) {
        await AsyncStorage.multiRemove(keysToRemove);
        console.log(`Cleaned up ${keysToRemove.length} old log entries`);
      }
    } catch (error) {
      console.error("Error cleaning up logs:", error);
    }
  }

  /**
   * Get monitoring status
   */
  getStatus(): {
    isMonitoring: boolean;
    platform: string;
    activeListeners: number;
  } {
    return {
      isMonitoring: this.isMonitoring,
      platform: Platform.OS,
      activeListeners: this.callListeners.length + this.smsListeners.length,
    };
  }
}

export default new CallSMSMonitorService();
