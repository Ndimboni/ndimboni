export interface DatabaseConfig {
  type: 'sqlite' | 'postgres';
  url?: string; // Database URL support
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  database: string;
  ssl?: boolean | { rejectUnauthorized: boolean };
  synchronize: boolean;
  logging: boolean;
  entities: string[];
  migrations: string[];
  migrationsTableName: string;
  migrationsRun: boolean;
  autoLoadEntities: boolean;
  dropSchema?: boolean;
}

export interface JwtConfig {
  secret: string;
  expiresIn: string;
}

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user?: string;
    pass?: string;
  };
}

export interface UploadConfig {
  destination: string;
  maxFileSize: number;
  allowedMimeTypes: string[];
}

export interface CorsConfig {
  origin: string;
  credentials: boolean;
}

export interface AdminConfig {
  email: string;
  password: string;
  name: string;
}

export interface TelegramConfig {
  botToken: string;
  webhookUrl?: string;
  adminChatIds: string[];
  allowedGroups: string[];
  moderationEnabled: boolean;
  autoDeleteDelay: number; // seconds to wait before deleting messages
}

export interface AutoVerificationConfig {
  enabled: boolean;
  phoneThreshold: number; // Number of reports required to auto-verify phone numbers
  emailThreshold: number; // Number of reports required to auto-verify emails
  socialMediaThreshold: number; // Number of reports required to auto-verify social media accounts
  websiteThreshold: number; // Number of reports required to auto-verify websites
  otherThreshold: number; // Number of reports required to auto-verify other types
  uniqueReportersRequired: boolean; // Whether reports must come from different users
  timePeriodHours?: number; // Time period to consider for auto-verification (optional)
}

export interface AppConfig {
  port: number;
  database: DatabaseConfig;
  jwt: JwtConfig;
  email: EmailConfig;
  upload: UploadConfig;
  cors: CorsConfig;
  admin: AdminConfig;
  moderator: AdminConfig;
  telegram: TelegramConfig;
  autoVerification: AutoVerificationConfig;
}
