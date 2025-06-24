import axios, { AxiosInstance } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import appConfig, { APP_CONSTANTS } from "../utils/config";
import {
  CheckScammerRequest,
  CheckScammerResponse,
  ReportScammerRequest,
  ReportScammerResponse,
  ScammerType,
} from "../types";

class NdimboniAPI {
  private axiosInstance: AxiosInstance;
  private cache: Map<string, { data: any; timestamp: number }>;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: appConfig.API_BASE_URL,
      timeout: appConfig.API_TIMEOUT,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Cache for scammer checks
    this.cache = new Map();
  }

  /**
   * Check if a phone number is a known scammer
   */
  async checkScammerPhone(phoneNumber: string): Promise<CheckScammerResponse> {
    try {
      // Clean phone number
      const cleanedNumber = this.cleanPhoneNumber(phoneNumber);

      // Check cache first
      const cacheKey = `phone_${cleanedNumber}`;
      const cached = await this.getCachedResult(cacheKey);
      if (cached) {
        return cached;
      }

      const requestData: CheckScammerRequest = {
        type: ScammerType.PHONE,
        identifier: cleanedNumber,
      };

      const response = await this.axiosInstance.post(
        APP_CONSTANTS.ENDPOINTS.CHECK_SCAMMER,
        requestData
      );

      const result: CheckScammerResponse = {
        isScammer: response.data.isScammer,
        data: response.data.data,
        success: response.data.success,
        message: response.data.message,
      };

      // Cache the result
      await this.setCachedResult(cacheKey, result);

      return result;
    } catch (error) {
      console.error("Error checking scammer phone:", error);
      throw new Error(APP_CONSTANTS.ERROR_MESSAGES.CHECK_FAILED);
    }
  }

  /**
   * Report a new scammer phone number
   */
  async reportScammerPhone(
    reportData: ReportScammerRequest
  ): Promise<ReportScammerResponse> {
    try {
      const cleanedNumber = this.cleanPhoneNumber(reportData.phoneNumber);

      const requestData = {
        type: ScammerType.PHONE,
        identifier: cleanedNumber,
        description: reportData.description,
        additionalInfo: reportData.additionalInfo || "",
        source: "mobile_app",
      };

      const response = await this.axiosInstance.post(
        APP_CONSTANTS.ENDPOINTS.REPORT_SCAMMER,
        requestData
      );

      // Invalidate cache for this number
      const cacheKey = `phone_${cleanedNumber}`;
      await AsyncStorage.removeItem(cacheKey);
      this.cache.delete(cacheKey);

      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error("Error reporting scammer:", error);
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error(APP_CONSTANTS.ERROR_MESSAGES.REPORT_FAILED);
    }
  }

  /**
   * Get scammer statistics
   */
  async getScammerStats(): Promise<any> {
    try {
      const response = await this.axiosInstance.get(
        APP_CONSTANTS.ENDPOINTS.GET_STATS
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching stats:", error);
      throw new Error("Failed to fetch statistics");
    }
  }

  /**
   * Clean and normalize phone number for Rwanda
   */
  private cleanPhoneNumber(phoneNumber: string): string {
    // Remove all non-digit characters except +
    let cleaned = phoneNumber.replace(/[^\d+]/g, "");

    // Handle Rwanda country code
    if (cleaned.startsWith("0")) {
      cleaned =
        appConfig.PHONE_CONFIG.DEFAULT_COUNTRY_CODE + cleaned.substring(1);
    } else if (cleaned.startsWith(appConfig.PHONE_CONFIG.RWANDA_PREFIX)) {
      cleaned = "+" + cleaned;
    } else if (!cleaned.startsWith("+")) {
      // Assume it's a local Rwanda number
      cleaned = appConfig.PHONE_CONFIG.DEFAULT_COUNTRY_CODE + cleaned;
    }

    return cleaned;
  }

  /**
   * Get cached result if still valid
   */
  private async getCachedResult(key: string): Promise<any> {
    try {
      // Check memory cache first
      if (this.cache.has(key)) {
        const cached = this.cache.get(key)!;
        if (Date.now() - cached.timestamp < appConfig.CACHE_DURATION) {
          return cached.data;
        }
        this.cache.delete(key);
      }

      // Check AsyncStorage
      const cached = await AsyncStorage.getItem(key);
      if (cached) {
        const parsedCache = JSON.parse(cached);
        if (Date.now() - parsedCache.timestamp < appConfig.CACHE_DURATION) {
          // Add to memory cache
          this.cache.set(key, parsedCache);
          return parsedCache.data;
        }
        // Remove expired cache
        await AsyncStorage.removeItem(key);
      }

      return null;
    } catch (error) {
      console.error("Error getting cached result:", error);
      return null;
    }
  }

  /**
   * Set cached result
   */
  private async setCachedResult(key: string, data: any): Promise<void> {
    try {
      const cacheEntry = {
        data,
        timestamp: Date.now(),
      };

      // Store in memory cache
      this.cache.set(key, cacheEntry);

      // Store in AsyncStorage
      await AsyncStorage.setItem(key, JSON.stringify(cacheEntry));
    } catch (error) {
      console.error("Error setting cached result:", error);
    }
  }

  /**
   * Clear all cached data
   */
  async clearCache(): Promise<void> {
    try {
      this.cache.clear();
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(
        (key) => key.startsWith("phone_") || key.startsWith("email_")
      );
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.error("Error clearing cache:", error);
    }
  }

  /**
   * Test API connectivity
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.axiosInstance.get(
        APP_CONSTANTS.ENDPOINTS.GET_STATS
      );
      return response.status === 200;
    } catch (error) {
      console.error("API connection test failed:", error);
      return false;
    }
  }

  /**
   * Validate phone number format
   */
  validatePhoneNumber(phoneNumber: string): boolean {
    const cleaned = phoneNumber.replace(/[^\d+]/g, "");
    return (
      cleaned.length >= appConfig.PHONE_CONFIG.MIN_LENGTH &&
      cleaned.length <= appConfig.PHONE_CONFIG.MAX_LENGTH
    );
  }
}

export default new NdimboniAPI();
