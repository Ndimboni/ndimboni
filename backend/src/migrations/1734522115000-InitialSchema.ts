import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1734522115000 implements MigrationInterface {
  name = 'InitialSchema1734522115000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create users table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" varchar PRIMARY KEY NOT NULL,
        "email" varchar NOT NULL,
        "name" varchar NOT NULL,
        "password" varchar NOT NULL,
        "role" varchar NOT NULL DEFAULT ('user'),
        "isActive" boolean NOT NULL DEFAULT (1),
        "createdAt" datetime NOT NULL DEFAULT (datetime('now')),
        "updatedAt" datetime NOT NULL DEFAULT (datetime('now')),
        CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email")
      )
    `);

    // Create scam_reports table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "scam_reports" (
        "id" varchar PRIMARY KEY NOT NULL,
        "title" varchar NOT NULL,
        "description" text NOT NULL,
        "scamType" varchar NOT NULL,
        "status" varchar NOT NULL DEFAULT ('pending'),
        "scammerInfo" varchar,
        "evidenceUrl" varchar,
        "reporterEmail" varchar,
        "reporterPhone" varchar,
        "userId" varchar,
        "createdAt" datetime NOT NULL DEFAULT (datetime('now')),
        "updatedAt" datetime NOT NULL DEFAULT (datetime('now')),
        CONSTRAINT "FK_scam_reports_users" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
      )
    `);

    // Create scam_checks table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "scam_checks" (
        "id" varchar PRIMARY KEY NOT NULL,
        "message" text NOT NULL,
        "extractedUrls" text,
        "status" varchar(50) NOT NULL DEFAULT ('unknown'),
        "detectedIntent" varchar(50) NOT NULL DEFAULT ('unknown'),
        "riskScore" float NOT NULL DEFAULT (0),
        "confidence" float NOT NULL DEFAULT (0),
        "reasons" text,
        "detectedPatterns" text,
        "urlScanResults" text,
        "checkedBy" varchar(255),
        "ipAddress" varchar(45),
        "userAgent" text,
        "createdAt" datetime NOT NULL DEFAULT (datetime('now')),
        "updatedAt" datetime NOT NULL DEFAULT (datetime('now')),
        CONSTRAINT "FK_scam_checks_users" FOREIGN KEY ("checkedBy") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
      )
    `);

    // Create scammer_reports table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "scammer_reports" (
        "id" varchar PRIMARY KEY NOT NULL,
        "type" varchar NOT NULL,
        "identifier" varchar NOT NULL,
        "description" text NOT NULL,
        "evidence" text,
        "status" varchar NOT NULL DEFAULT ('pending'),
        "reportedBy" varchar,
        "verifiedBy" varchar,
        "ipAddress" varchar(45),
        "additionalInfo" text,
        "reportCount" integer NOT NULL DEFAULT (1),
        "lastReportedAt" datetime,
        "createdAt" datetime NOT NULL DEFAULT (datetime('now')),
        "updatedAt" datetime NOT NULL DEFAULT (datetime('now')),
        CONSTRAINT "FK_scammer_reports_reporter" FOREIGN KEY ("reportedBy") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "FK_scammer_reports_verifier" FOREIGN KEY ("verifiedBy") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
      )
    `);

    // Create uploaded_files table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "uploaded_files" (
        "id" varchar PRIMARY KEY NOT NULL,
        "filename" varchar NOT NULL,
        "originalName" varchar NOT NULL,
        "mimeType" varchar NOT NULL,
        "size" integer NOT NULL,
        "path" varchar NOT NULL,
        "uploadedById" varchar,
        "createdAt" datetime NOT NULL DEFAULT (datetime('now')),
        "updatedAt" datetime NOT NULL DEFAULT (datetime('now')),
        CONSTRAINT "FK_uploaded_files_users" FOREIGN KEY ("uploadedById") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
      )
    `);

    console.log('Initial schema migration completed successfully');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS "uploaded_files"');
    await queryRunner.query('DROP TABLE IF EXISTS "scammer_reports"');
    await queryRunner.query('DROP TABLE IF EXISTS "scam_checks"');
    await queryRunner.query('DROP TABLE IF EXISTS "scam_reports"');
    await queryRunner.query('DROP TABLE IF EXISTS "users"');

    console.log('Initial schema migration reverted successfully');
  }
}
