import { DataSource } from 'typeorm';
import configuration from './configuration';

// Get configuration
const appConfig = configuration();
const dbConfig = appConfig.database;

// Create TypeORM DataSource configuration
const dataSourceConfig: any = {
  type: dbConfig.type,
  synchronize: false, // Always false for migrations
  logging: dbConfig.logging,
  entities: ['src/**/*.entity{.ts,.js}'],
  migrations: ['src/migrations/*{.ts,.js}'],
  migrationsTableName: dbConfig.migrationsTableName,
  subscribers: ['src/**/*.subscriber{.ts,.js}'],
};

// Use URL if provided, otherwise use individual components
if (dbConfig.url) {
  dataSourceConfig.url = dbConfig.url;
  if (dbConfig.ssl) {
    dataSourceConfig.ssl = dbConfig.ssl;
  }
} else {
  dataSourceConfig.host = dbConfig.host;
  dataSourceConfig.port = dbConfig.port;
  dataSourceConfig.username = dbConfig.username;
  dataSourceConfig.password = dbConfig.password;
  dataSourceConfig.database = dbConfig.database;
  if (dbConfig.ssl) {
    dataSourceConfig.ssl = dbConfig.ssl;
  }
}

export default new DataSource(dataSourceConfig);
