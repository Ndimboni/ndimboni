import { DataSource } from 'typeorm';
import configuration from './configuration';

// Get configuration
const appConfig = configuration();

export default new DataSource({
  type: appConfig.database.type as any,
  host: appConfig.database.host,
  port: appConfig.database.port,
  username: appConfig.database.username,
  password: appConfig.database.password,
  database: appConfig.database.database,
  ssl: appConfig.database.ssl,
  synchronize: false, // Always false for migrations
  logging: appConfig.database.logging,
  entities: ['src/**/*.entity{.ts,.js}'],
  migrations: ['src/migrations/*{.ts,.js}'],
  migrationsTableName: appConfig.database.migrationsTableName,
  subscribers: ['src/**/*.subscriber{.ts,.js}'],
});
