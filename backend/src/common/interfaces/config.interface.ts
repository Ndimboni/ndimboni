export interface DatabaseConfig {
  type: 'sqlite' | 'postgres';
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

export interface AppConfig {
  port: number;
  database: DatabaseConfig;
  jwt: JwtConfig;
  email: EmailConfig;
  upload: UploadConfig;
  cors: CorsConfig;
  admin: AdminConfig;
  telegram: TelegramConfig;
}
