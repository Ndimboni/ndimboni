import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MigrationService implements OnModuleInit {
  private readonly logger = new Logger(MigrationService.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit(): Promise<void> {
    const runMigrations = this.configService.get<boolean>(
      'database.migrationsRun',
    );
    const synchronize = this.configService.get<boolean>('database.synchronize');
    const nodeEnv = process.env.NODE_ENV;

    this.logger.log(
      `Database initialization started - Environment: ${nodeEnv}`,
    );
    this.logger.log(
      `Synchronize: ${synchronize}, Run Migrations: ${runMigrations}`,
    );

    try {
      if (runMigrations && !synchronize) {
        this.logger.log('Running pending migrations...');
        await this.runMigrations();
      } else if (synchronize) {
        this.logger.log(
          'Database synchronization is enabled - skipping migrations',
        );
        await this.ensureTablesExist();
      } else {
        this.logger.log('Neither migrations nor synchronization enabled');
      }

      await this.logDatabaseStatus();
    } catch (error) {
      this.logger.error('Database initialization failed:', error);
      throw error;
    }
  }

  private async runMigrations(): Promise<void> {
    try {
      const hasUnappliedMigrations = await this.dataSource.showMigrations();

      if (hasUnappliedMigrations) {
        this.logger.log('Found pending migrations');
        await this.dataSource.runMigrations();
        this.logger.log('All migrations executed successfully');
      } else {
        this.logger.log('No pending migrations found');
      }
    } catch (error) {
      this.logger.error('Migration execution failed:', error);
      throw error;
    }
  }

  private async ensureTablesExist(): Promise<void> {
    try {
      // Check if main tables exist, if not, synchronization will create them
      const queryRunner = this.dataSource.createQueryRunner();

      try {
        const tables = await queryRunner.getTables();
        const tableNames = tables.map((table) => table.name);

        const expectedTables = [
          'users',
          'scam_reports',
          'scam_checks',
          'scammer_reports',
          'uploaded_files',
        ];
        const missingTables = expectedTables.filter(
          (table) => !tableNames.includes(table),
        );

        if (missingTables.length > 0) {
          this.logger.log(
            `Missing tables detected: ${missingTables.join(', ')}`,
          );
          this.logger.log(
            'Database synchronization will create missing tables',
          );
        } else {
          this.logger.log('All required tables exist');
        }
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      this.logger.warn('Could not verify table existence:', error.message);
    }
  }

  private async logDatabaseStatus(): Promise<void> {
    try {
      const queryRunner = this.dataSource.createQueryRunner();

      try {
        const tables = await queryRunner.getTables();
        this.logger.log(
          `Database contains ${tables.length} tables: ${tables.map((t) => t.name).join(', ')}`,
        );

        // Check migration table if it exists
        const migrationTable = tables.find(
          (table) => table.name === 'migrations',
        );
        if (migrationTable) {
          const migrations = await queryRunner.query(
            'SELECT * FROM migrations ORDER BY timestamp ASC',
          );
          this.logger.log(
            `Migration history: ${migrations.length} migrations applied`,
          );
        }
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      this.logger.warn('Could not retrieve database status:', error.message);
    }
  }

  async generateMigration(name: string): Promise<void> {
    try {
      this.logger.log(`Generating migration: ${name}`);
      // Note: This would typically use the TypeORM CLI
      // For now, we'll log that manual migration generation is needed
      this.logger.warn(
        'To generate migrations, use: npm run migration:generate -- --name=' +
          name,
      );
    } catch (error) {
      this.logger.error('Migration generation failed:', error);
      throw error;
    }
  }

  async revertLastMigration(): Promise<void> {
    try {
      this.logger.log('Reverting last migration...');
      await this.dataSource.undoLastMigration();
      this.logger.log('Last migration reverted successfully');
    } catch (error) {
      this.logger.error('Migration revert failed:', error);
      throw error;
    }
  }
}
