import {
  AppConfig,
  DatabaseConfig,
} from '../common/interfaces/config.interface';

export default (): AppConfig => {
  const dbType = process.env.DB_TYPE || 'sqlite';

  // Base database configuration
  const baseConfig = {
    // Use synchronize in development for quick prototyping, migrations in production
    synchronize:
      process.env.DB_SYNCHRONIZE === 'true' ||
      (process.env.NODE_ENV !== 'production' &&
        process.env.DB_SYNCHRONIZE !== 'false'),
    logging:
      process.env.NODE_ENV === 'development' ||
      process.env.DB_LOGGING === 'true',
    entities: ['dist/**/*.entity{.ts,.js}'],
    migrations: ['dist/migrations/*{.ts,.js}'],
    migrationsTableName: 'migrations',
    migrationsRun:
      process.env.DB_MIGRATIONS_RUN === 'true' ||
      (process.env.NODE_ENV === 'production' &&
        process.env.DB_MIGRATIONS_RUN !== 'false'),
    autoLoadEntities: true,
    dropSchema: process.env.DB_DROP_SCHEMA === 'true',
  };

  // Database-specific configuration
  let databaseConfig: DatabaseConfig;

  if (dbType === 'postgres' || dbType === 'postgresql') {
    databaseConfig = {
      ...baseConfig,
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'ndimboni',
      ssl:
        process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    };
  } else {
    // Default to SQLite
    databaseConfig = {
      ...baseConfig,
      type: 'sqlite',
      database: process.env.DB_NAME || './data/ndimboni.db',
    };
  }

  return {
    port: parseInt(process.env.PORT || '3000', 10),
    database: databaseConfig,
    jwt: {
      secret: process.env.JWT_SECRET || 'ndimboni-secret-key',
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    },
    email: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    },
    upload: {
      destination: process.env.UPLOAD_DESTINATION || './uploads',
      maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10), // 5MB
      allowedMimeTypes: [
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/pdf',
        'text/plain',
      ],
    },
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      credentials: true,
    },
    admin: {
      email: process.env.ADMIN_EMAIL || 'admin@ndimboni.com',
      password: process.env.ADMIN_PASSWORD || 'admin123',
      name: process.env.ADMIN_NAME || 'Admin User',
    },
    telegram: {
      botToken: process.env.TELEGRAM_BOT_TOKEN || '',
      webhookUrl: process.env.TELEGRAM_WEBHOOK_URL,
      adminChatIds: process.env.TELEGRAM_ADMIN_CHAT_IDS?.split(',') || [],
      allowedGroups: process.env.TELEGRAM_ALLOWED_GROUPS?.split(',') || [],
      moderationEnabled: process.env.TELEGRAM_MODERATION_ENABLED === 'true',
      autoDeleteDelay: parseInt(
        process.env.TELEGRAM_AUTO_DELETE_DELAY || '5',
        10,
      ),
    },
  };
};
