import { StackNavigationProp as RNStackNavigationProp } from "@react-navigation/stack";

// Types for the Ndimboni Scam Guard App

export interface ScammerData {
  id: string;
  type: ScammerType;
  identifier: string;
  description: string;
  status: ScammerStatus;
  evidence?: string;
  reportedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export enum ScammerType {
  EMAIL = "email",
  PHONE = "phone",
  SOCIAL_MEDIA = "social_media",
  WEBSITE = "website",
  OTHER = "other",
}

export enum ScammerStatus {
  PENDING = "pending",
  VERIFIED = "verified",
  FALSE_POSITIVE = "false_positive",
  INVESTIGATING = "investigating",
}

export interface CheckScammerRequest {
  type: ScammerType;
  identifier: string;
}

export interface CheckScammerResponse {
  success: boolean;
  isScammer: boolean;
  data?: ScammerData;
  message: string;
}

export interface ReportScammerRequest {
  phoneNumber: string;
  description: string;
  additionalInfo?: string;
}

export interface ReportScammerResponse {
  success: boolean;
  data: ScammerData;
  message: string;
}

export interface DetectionHistory {
  phoneNumber: string;
  type: "call" | "sms" | "manual";
  isScammer: boolean;
  timestamp: string;
  details?: string;
  message?: string;
}

export interface DetectionRecord {
  phoneNumber: string;
  context: "call" | "sms" | "test";
  scammerData?: ScammerData;
  timestamp: number;
  deviceInfo: string;
}

export interface MonitoringStats {
  isMonitoring: boolean;
  totalCalls: number;
  totalSMS: number;
  detectionsToday: number;
  lastUpdate: number;
}

export interface ServiceStatus {
  initialized: boolean;
  notificationPermission: boolean;
  alertHistorySize: number;
}

export interface CallEvent {
  phoneNumber: string;
  callState: "incoming" | "answered" | "ended";
  timestamp: number;
}

export interface SMSEvent {
  phoneNumber: string;
  message: string;
  timestamp: number;
}

export interface AppConfig {
  API_BASE_URL: string;
  API_TIMEOUT: number;
  CACHE_DURATION: number;
  DEBUG_MODE: boolean;
  FEATURES: {
    CALL_MONITORING: boolean;
    SMS_MONITORING: boolean;
    BACKGROUND_DETECTION: boolean;
    MANUAL_REPORTING: boolean;
    DETECTION_HISTORY: boolean;
  };
  PHONE_CONFIG: {
    DEFAULT_COUNTRY_CODE: string;
    RWANDA_PREFIX: string;
    MIN_LENGTH: number;
    MAX_LENGTH: number;
  };
}

export interface NavigationProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
    goBack: () => void;
  };
}

// React Navigation types
export type RootStackParamList = {
  Home: undefined;
  Report: undefined;
  Check: undefined;
  History: undefined;
};

export type ScreenNames = keyof RootStackParamList;

// Navigation prop types
export type StackNavigationProp<T extends keyof RootStackParamList> =
  RNStackNavigationProp<RootStackParamList, T>;
