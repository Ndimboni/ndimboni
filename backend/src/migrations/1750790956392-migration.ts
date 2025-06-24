import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1750790956392 implements MigrationInterface {
  name = 'Migration1750790956392';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "temporary_uploaded_files" ("id" varchar PRIMARY KEY NOT NULL, "filename" varchar NOT NULL, "originalName" varchar NOT NULL, "mimeType" varchar NOT NULL, "size" integer NOT NULL, "path" varchar NOT NULL, "uploadedById" varchar, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "uploadedBy" varchar, CONSTRAINT "FK_d6d041aff81e8f057d5e72b8398" FOREIGN KEY ("uploadedBy") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_uploaded_files"("id", "filename", "originalName", "mimeType", "size", "path", "uploadedById", "createdAt", "updatedAt", "uploadedBy") SELECT "id", "filename", "originalName", "mimeType", "size", "path", "uploadedById", "createdAt", "updatedAt", "uploadedBy" FROM "uploaded_files"`,
    );
    await queryRunner.query(`DROP TABLE "uploaded_files"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_uploaded_files" RENAME TO "uploaded_files"`,
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_scam_checks" ("id" varchar PRIMARY KEY NOT NULL, "message" text NOT NULL, "extractedUrls" text, "status" varchar(50) NOT NULL DEFAULT ('unknown'), "detectedIntent" varchar(50) NOT NULL DEFAULT ('unknown'), "riskScore" float NOT NULL DEFAULT (0), "confidence" float NOT NULL DEFAULT (0), "reasons" text, "detectedPatterns" text, "urlScanResults" text, "checkedBy" varchar(255), "ipAddress" varchar(45), "userAgent" text, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "source" varchar(50) NOT NULL DEFAULT ('web'), "extractedIdentifiers" text, "aiAnalysis" text, "databaseMatches" text, "virusTotalResults" text, "intentAnalysis" text, "analysisMethod" varchar(20) NOT NULL DEFAULT ('web'), CONSTRAINT "FK_23716221e0d9463e9e0b5faba32" FOREIGN KEY ("checkedBy") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_scam_checks"("id", "message", "extractedUrls", "status", "detectedIntent", "riskScore", "confidence", "reasons", "detectedPatterns", "urlScanResults", "checkedBy", "ipAddress", "userAgent", "createdAt", "updatedAt", "source") SELECT "id", "message", "extractedUrls", "status", "detectedIntent", "riskScore", "confidence", "reasons", "detectedPatterns", "urlScanResults", "checkedBy", "ipAddress", "userAgent", "createdAt", "updatedAt", "source" FROM "scam_checks"`,
    );
    await queryRunner.query(`DROP TABLE "scam_checks"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_scam_checks" RENAME TO "scam_checks"`,
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_uploaded_files" ("id" varchar PRIMARY KEY NOT NULL, "filename" varchar NOT NULL, "originalName" varchar NOT NULL, "mimeType" varchar NOT NULL, "size" bigint NOT NULL, "path" varchar NOT NULL, "uploadedById" varchar, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "uploadedBy" varchar, CONSTRAINT "FK_d6d041aff81e8f057d5e72b8398" FOREIGN KEY ("uploadedBy") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_uploaded_files"("id", "filename", "originalName", "mimeType", "size", "path", "uploadedById", "createdAt", "updatedAt", "uploadedBy") SELECT "id", "filename", "originalName", "mimeType", "size", "path", "uploadedById", "createdAt", "updatedAt", "uploadedBy" FROM "uploaded_files"`,
    );
    await queryRunner.query(`DROP TABLE "uploaded_files"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_uploaded_files" RENAME TO "uploaded_files"`,
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_scammer_reports" ("id" varchar PRIMARY KEY NOT NULL, "type" varchar(50) NOT NULL, "identifier" varchar(255) NOT NULL, "description" text NOT NULL, "evidence" text, "status" varchar(50) NOT NULL DEFAULT ('pending'), "reportedBy" varchar(255), "verifiedBy" varchar(255), "ipAddress" varchar(45), "additionalInfo" text, "reportCount" integer NOT NULL DEFAULT (1), "lastReportedAt" datetime, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "source" varchar(50) NOT NULL DEFAULT ('web'))`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_scammer_reports"("id", "type", "identifier", "description", "evidence", "status", "reportedBy", "verifiedBy", "ipAddress", "additionalInfo", "reportCount", "lastReportedAt", "createdAt", "updatedAt", "source") SELECT "id", "type", "identifier", "description", "evidence", "status", "reportedBy", "verifiedBy", "ipAddress", "additionalInfo", "reportCount", "lastReportedAt", "createdAt", "updatedAt", "source" FROM "scammer_reports"`,
    );
    await queryRunner.query(`DROP TABLE "scammer_reports"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_scammer_reports" RENAME TO "scammer_reports"`,
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_scammer_reports" ("id" varchar PRIMARY KEY NOT NULL, "type" varchar(50) NOT NULL, "identifier" varchar(255) NOT NULL, "description" text NOT NULL, "evidence" text, "status" varchar(50) NOT NULL DEFAULT ('pending'), "reportedBy" varchar, "verifiedBy" varchar, "ipAddress" varchar(45), "additionalInfo" text, "reportCount" integer NOT NULL DEFAULT (1), "lastReportedAt" datetime, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "source" varchar(50) NOT NULL DEFAULT ('web'))`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_scammer_reports"("id", "type", "identifier", "description", "evidence", "status", "reportedBy", "verifiedBy", "ipAddress", "additionalInfo", "reportCount", "lastReportedAt", "createdAt", "updatedAt", "source") SELECT "id", "type", "identifier", "description", "evidence", "status", "reportedBy", "verifiedBy", "ipAddress", "additionalInfo", "reportCount", "lastReportedAt", "createdAt", "updatedAt", "source" FROM "scammer_reports"`,
    );
    await queryRunner.query(`DROP TABLE "scammer_reports"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_scammer_reports" RENAME TO "scammer_reports"`,
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_scam_checks" ("id" varchar PRIMARY KEY NOT NULL, "message" text NOT NULL, "extractedUrls" text, "status" varchar(50) NOT NULL DEFAULT ('unknown'), "detectedIntent" varchar(50) NOT NULL DEFAULT ('unknown'), "riskScore" float NOT NULL DEFAULT (0), "confidence" float NOT NULL DEFAULT (0), "reasons" text, "detectedPatterns" text, "urlScanResults" text, "checkedBy" varchar(255), "ipAddress" varchar(45), "userAgent" text, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "source" varchar(50) NOT NULL DEFAULT ('web'), "extractedIdentifiers" text, "aiAnalysis" text, "databaseMatches" text, "virusTotalResults" text, "intentAnalysis" text, "analysisMethod" varchar(20) NOT NULL DEFAULT ('web'))`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_scam_checks"("id", "message", "extractedUrls", "status", "detectedIntent", "riskScore", "confidence", "reasons", "detectedPatterns", "urlScanResults", "checkedBy", "ipAddress", "userAgent", "createdAt", "updatedAt", "source", "extractedIdentifiers", "aiAnalysis", "databaseMatches", "virusTotalResults", "intentAnalysis", "analysisMethod") SELECT "id", "message", "extractedUrls", "status", "detectedIntent", "riskScore", "confidence", "reasons", "detectedPatterns", "urlScanResults", "checkedBy", "ipAddress", "userAgent", "createdAt", "updatedAt", "source", "extractedIdentifiers", "aiAnalysis", "databaseMatches", "virusTotalResults", "intentAnalysis", "analysisMethod" FROM "scam_checks"`,
    );
    await queryRunner.query(`DROP TABLE "scam_checks"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_scam_checks" RENAME TO "scam_checks"`,
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_scam_checks" ("id" varchar PRIMARY KEY NOT NULL, "message" text NOT NULL, "extractedUrls" text, "status" varchar(50) NOT NULL DEFAULT ('unknown'), "detectedIntent" varchar(50) NOT NULL DEFAULT ('unknown'), "riskScore" decimal(5,4) NOT NULL DEFAULT (0), "confidence" decimal(5,4) NOT NULL DEFAULT (0), "reasons" text, "detectedPatterns" text, "urlScanResults" text, "checkedBy" varchar, "ipAddress" varchar(45), "userAgent" text, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "source" varchar(50) NOT NULL DEFAULT ('web'), "extractedIdentifiers" text, "aiAnalysis" text, "databaseMatches" text, "virusTotalResults" text, "intentAnalysis" text, "analysisMethod" varchar(20) NOT NULL DEFAULT ('web'))`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_scam_checks"("id", "message", "extractedUrls", "status", "detectedIntent", "riskScore", "confidence", "reasons", "detectedPatterns", "urlScanResults", "checkedBy", "ipAddress", "userAgent", "createdAt", "updatedAt", "source", "extractedIdentifiers", "aiAnalysis", "databaseMatches", "virusTotalResults", "intentAnalysis", "analysisMethod") SELECT "id", "message", "extractedUrls", "status", "detectedIntent", "riskScore", "confidence", "reasons", "detectedPatterns", "urlScanResults", "checkedBy", "ipAddress", "userAgent", "createdAt", "updatedAt", "source", "extractedIdentifiers", "aiAnalysis", "databaseMatches", "virusTotalResults", "intentAnalysis", "analysisMethod" FROM "scam_checks"`,
    );
    await queryRunner.query(`DROP TABLE "scam_checks"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_scam_checks" RENAME TO "scam_checks"`,
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_scammer_reports" ("id" varchar PRIMARY KEY NOT NULL, "type" varchar(50) NOT NULL, "identifier" varchar(255) NOT NULL, "description" text NOT NULL, "evidence" text, "status" varchar(50) NOT NULL DEFAULT ('pending'), "reportedBy" varchar, "verifiedBy" varchar, "ipAddress" varchar(45), "additionalInfo" text, "reportCount" integer NOT NULL DEFAULT (1), "lastReportedAt" datetime, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "source" varchar(50) NOT NULL DEFAULT ('web'), CONSTRAINT "FK_45effc32c38c12eaae8446f6f16" FOREIGN KEY ("reportedBy") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_56a5daa953a71b25a1afae9cb2a" FOREIGN KEY ("verifiedBy") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_scammer_reports"("id", "type", "identifier", "description", "evidence", "status", "reportedBy", "verifiedBy", "ipAddress", "additionalInfo", "reportCount", "lastReportedAt", "createdAt", "updatedAt", "source") SELECT "id", "type", "identifier", "description", "evidence", "status", "reportedBy", "verifiedBy", "ipAddress", "additionalInfo", "reportCount", "lastReportedAt", "createdAt", "updatedAt", "source" FROM "scammer_reports"`,
    );
    await queryRunner.query(`DROP TABLE "scammer_reports"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_scammer_reports" RENAME TO "scammer_reports"`,
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_scam_checks" ("id" varchar PRIMARY KEY NOT NULL, "message" text NOT NULL, "extractedUrls" text, "status" varchar(50) NOT NULL DEFAULT ('unknown'), "detectedIntent" varchar(50) NOT NULL DEFAULT ('unknown'), "riskScore" decimal(5,4) NOT NULL DEFAULT (0), "confidence" decimal(5,4) NOT NULL DEFAULT (0), "reasons" text, "detectedPatterns" text, "urlScanResults" text, "checkedBy" varchar, "ipAddress" varchar(45), "userAgent" text, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "source" varchar(50) NOT NULL DEFAULT ('web'), "extractedIdentifiers" text, "aiAnalysis" text, "databaseMatches" text, "virusTotalResults" text, "intentAnalysis" text, "analysisMethod" varchar(20) NOT NULL DEFAULT ('web'), CONSTRAINT "FK_23716221e0d9463e9e0b5faba32" FOREIGN KEY ("checkedBy") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_scam_checks"("id", "message", "extractedUrls", "status", "detectedIntent", "riskScore", "confidence", "reasons", "detectedPatterns", "urlScanResults", "checkedBy", "ipAddress", "userAgent", "createdAt", "updatedAt", "source", "extractedIdentifiers", "aiAnalysis", "databaseMatches", "virusTotalResults", "intentAnalysis", "analysisMethod") SELECT "id", "message", "extractedUrls", "status", "detectedIntent", "riskScore", "confidence", "reasons", "detectedPatterns", "urlScanResults", "checkedBy", "ipAddress", "userAgent", "createdAt", "updatedAt", "source", "extractedIdentifiers", "aiAnalysis", "databaseMatches", "virusTotalResults", "intentAnalysis", "analysisMethod" FROM "scam_checks"`,
    );
    await queryRunner.query(`DROP TABLE "scam_checks"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_scam_checks" RENAME TO "scam_checks"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "scam_checks" RENAME TO "temporary_scam_checks"`,
    );
    await queryRunner.query(
      `CREATE TABLE "scam_checks" ("id" varchar PRIMARY KEY NOT NULL, "message" text NOT NULL, "extractedUrls" text, "status" varchar(50) NOT NULL DEFAULT ('unknown'), "detectedIntent" varchar(50) NOT NULL DEFAULT ('unknown'), "riskScore" decimal(5,4) NOT NULL DEFAULT (0), "confidence" decimal(5,4) NOT NULL DEFAULT (0), "reasons" text, "detectedPatterns" text, "urlScanResults" text, "checkedBy" varchar, "ipAddress" varchar(45), "userAgent" text, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "source" varchar(50) NOT NULL DEFAULT ('web'), "extractedIdentifiers" text, "aiAnalysis" text, "databaseMatches" text, "virusTotalResults" text, "intentAnalysis" text, "analysisMethod" varchar(20) NOT NULL DEFAULT ('web'))`,
    );
    await queryRunner.query(
      `INSERT INTO "scam_checks"("id", "message", "extractedUrls", "status", "detectedIntent", "riskScore", "confidence", "reasons", "detectedPatterns", "urlScanResults", "checkedBy", "ipAddress", "userAgent", "createdAt", "updatedAt", "source", "extractedIdentifiers", "aiAnalysis", "databaseMatches", "virusTotalResults", "intentAnalysis", "analysisMethod") SELECT "id", "message", "extractedUrls", "status", "detectedIntent", "riskScore", "confidence", "reasons", "detectedPatterns", "urlScanResults", "checkedBy", "ipAddress", "userAgent", "createdAt", "updatedAt", "source", "extractedIdentifiers", "aiAnalysis", "databaseMatches", "virusTotalResults", "intentAnalysis", "analysisMethod" FROM "temporary_scam_checks"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_scam_checks"`);
    await queryRunner.query(
      `ALTER TABLE "scammer_reports" RENAME TO "temporary_scammer_reports"`,
    );
    await queryRunner.query(
      `CREATE TABLE "scammer_reports" ("id" varchar PRIMARY KEY NOT NULL, "type" varchar(50) NOT NULL, "identifier" varchar(255) NOT NULL, "description" text NOT NULL, "evidence" text, "status" varchar(50) NOT NULL DEFAULT ('pending'), "reportedBy" varchar, "verifiedBy" varchar, "ipAddress" varchar(45), "additionalInfo" text, "reportCount" integer NOT NULL DEFAULT (1), "lastReportedAt" datetime, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "source" varchar(50) NOT NULL DEFAULT ('web'))`,
    );
    await queryRunner.query(
      `INSERT INTO "scammer_reports"("id", "type", "identifier", "description", "evidence", "status", "reportedBy", "verifiedBy", "ipAddress", "additionalInfo", "reportCount", "lastReportedAt", "createdAt", "updatedAt", "source") SELECT "id", "type", "identifier", "description", "evidence", "status", "reportedBy", "verifiedBy", "ipAddress", "additionalInfo", "reportCount", "lastReportedAt", "createdAt", "updatedAt", "source" FROM "temporary_scammer_reports"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_scammer_reports"`);
    await queryRunner.query(
      `ALTER TABLE "scam_checks" RENAME TO "temporary_scam_checks"`,
    );
    await queryRunner.query(
      `CREATE TABLE "scam_checks" ("id" varchar PRIMARY KEY NOT NULL, "message" text NOT NULL, "extractedUrls" text, "status" varchar(50) NOT NULL DEFAULT ('unknown'), "detectedIntent" varchar(50) NOT NULL DEFAULT ('unknown'), "riskScore" float NOT NULL DEFAULT (0), "confidence" float NOT NULL DEFAULT (0), "reasons" text, "detectedPatterns" text, "urlScanResults" text, "checkedBy" varchar(255), "ipAddress" varchar(45), "userAgent" text, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "source" varchar(50) NOT NULL DEFAULT ('web'), "extractedIdentifiers" text, "aiAnalysis" text, "databaseMatches" text, "virusTotalResults" text, "intentAnalysis" text, "analysisMethod" varchar(20) NOT NULL DEFAULT ('web'))`,
    );
    await queryRunner.query(
      `INSERT INTO "scam_checks"("id", "message", "extractedUrls", "status", "detectedIntent", "riskScore", "confidence", "reasons", "detectedPatterns", "urlScanResults", "checkedBy", "ipAddress", "userAgent", "createdAt", "updatedAt", "source", "extractedIdentifiers", "aiAnalysis", "databaseMatches", "virusTotalResults", "intentAnalysis", "analysisMethod") SELECT "id", "message", "extractedUrls", "status", "detectedIntent", "riskScore", "confidence", "reasons", "detectedPatterns", "urlScanResults", "checkedBy", "ipAddress", "userAgent", "createdAt", "updatedAt", "source", "extractedIdentifiers", "aiAnalysis", "databaseMatches", "virusTotalResults", "intentAnalysis", "analysisMethod" FROM "temporary_scam_checks"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_scam_checks"`);
    await queryRunner.query(
      `ALTER TABLE "scam_checks" RENAME TO "temporary_scam_checks"`,
    );
    await queryRunner.query(
      `CREATE TABLE "scam_checks" ("id" varchar PRIMARY KEY NOT NULL, "message" text NOT NULL, "extractedUrls" text, "status" varchar(50) NOT NULL DEFAULT ('unknown'), "detectedIntent" varchar(50) NOT NULL DEFAULT ('unknown'), "riskScore" float NOT NULL DEFAULT (0), "confidence" float NOT NULL DEFAULT (0), "reasons" text, "detectedPatterns" text, "urlScanResults" text, "checkedBy" varchar(255), "ipAddress" varchar(45), "userAgent" text, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "source" varchar(50) NOT NULL DEFAULT ('web'), "extractedIdentifiers" text, "aiAnalysis" text, "databaseMatches" text, "virusTotalResults" text, "intentAnalysis" text, "analysisMethod" varchar(20) NOT NULL DEFAULT ('web'), CONSTRAINT "FK_23716221e0d9463e9e0b5faba32" FOREIGN KEY ("checkedBy") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT INTO "scam_checks"("id", "message", "extractedUrls", "status", "detectedIntent", "riskScore", "confidence", "reasons", "detectedPatterns", "urlScanResults", "checkedBy", "ipAddress", "userAgent", "createdAt", "updatedAt", "source", "extractedIdentifiers", "aiAnalysis", "databaseMatches", "virusTotalResults", "intentAnalysis", "analysisMethod") SELECT "id", "message", "extractedUrls", "status", "detectedIntent", "riskScore", "confidence", "reasons", "detectedPatterns", "urlScanResults", "checkedBy", "ipAddress", "userAgent", "createdAt", "updatedAt", "source", "extractedIdentifiers", "aiAnalysis", "databaseMatches", "virusTotalResults", "intentAnalysis", "analysisMethod" FROM "temporary_scam_checks"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_scam_checks"`);
    await queryRunner.query(
      `ALTER TABLE "scammer_reports" RENAME TO "temporary_scammer_reports"`,
    );
    await queryRunner.query(
      `CREATE TABLE "scammer_reports" ("id" varchar PRIMARY KEY NOT NULL, "type" varchar(50) NOT NULL, "identifier" varchar(255) NOT NULL, "description" text NOT NULL, "evidence" text, "status" varchar(50) NOT NULL DEFAULT ('pending'), "reportedBy" varchar(255), "verifiedBy" varchar(255), "ipAddress" varchar(45), "additionalInfo" text, "reportCount" integer NOT NULL DEFAULT (1), "lastReportedAt" datetime, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "source" varchar(50) NOT NULL DEFAULT ('web'))`,
    );
    await queryRunner.query(
      `INSERT INTO "scammer_reports"("id", "type", "identifier", "description", "evidence", "status", "reportedBy", "verifiedBy", "ipAddress", "additionalInfo", "reportCount", "lastReportedAt", "createdAt", "updatedAt", "source") SELECT "id", "type", "identifier", "description", "evidence", "status", "reportedBy", "verifiedBy", "ipAddress", "additionalInfo", "reportCount", "lastReportedAt", "createdAt", "updatedAt", "source" FROM "temporary_scammer_reports"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_scammer_reports"`);
    await queryRunner.query(
      `ALTER TABLE "scammer_reports" RENAME TO "temporary_scammer_reports"`,
    );
    await queryRunner.query(
      `CREATE TABLE "scammer_reports" ("id" varchar PRIMARY KEY NOT NULL, "type" varchar(50) NOT NULL, "identifier" varchar(255) NOT NULL, "description" text NOT NULL, "evidence" text, "status" varchar(50) NOT NULL DEFAULT ('pending'), "reportedBy" varchar(255), "verifiedBy" varchar(255), "ipAddress" varchar(45), "additionalInfo" text, "reportCount" integer NOT NULL DEFAULT (1), "lastReportedAt" datetime, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "source" varchar(50) NOT NULL DEFAULT ('web'), CONSTRAINT "FK_45effc32c38c12eaae8446f6f16" FOREIGN KEY ("reportedBy") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT INTO "scammer_reports"("id", "type", "identifier", "description", "evidence", "status", "reportedBy", "verifiedBy", "ipAddress", "additionalInfo", "reportCount", "lastReportedAt", "createdAt", "updatedAt", "source") SELECT "id", "type", "identifier", "description", "evidence", "status", "reportedBy", "verifiedBy", "ipAddress", "additionalInfo", "reportCount", "lastReportedAt", "createdAt", "updatedAt", "source" FROM "temporary_scammer_reports"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_scammer_reports"`);
    await queryRunner.query(
      `ALTER TABLE "uploaded_files" RENAME TO "temporary_uploaded_files"`,
    );
    await queryRunner.query(
      `CREATE TABLE "uploaded_files" ("id" varchar PRIMARY KEY NOT NULL, "filename" varchar NOT NULL, "originalName" varchar NOT NULL, "mimeType" varchar NOT NULL, "size" integer NOT NULL, "path" varchar NOT NULL, "uploadedById" varchar, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "uploadedBy" varchar, CONSTRAINT "FK_d6d041aff81e8f057d5e72b8398" FOREIGN KEY ("uploadedBy") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT INTO "uploaded_files"("id", "filename", "originalName", "mimeType", "size", "path", "uploadedById", "createdAt", "updatedAt", "uploadedBy") SELECT "id", "filename", "originalName", "mimeType", "size", "path", "uploadedById", "createdAt", "updatedAt", "uploadedBy" FROM "temporary_uploaded_files"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_uploaded_files"`);
    await queryRunner.query(
      `ALTER TABLE "scam_checks" RENAME TO "temporary_scam_checks"`,
    );
    await queryRunner.query(
      `CREATE TABLE "scam_checks" ("id" varchar PRIMARY KEY NOT NULL, "message" text NOT NULL, "extractedUrls" text, "status" varchar(50) NOT NULL DEFAULT ('unknown'), "detectedIntent" varchar(50) NOT NULL DEFAULT ('unknown'), "riskScore" float NOT NULL DEFAULT (0), "confidence" float NOT NULL DEFAULT (0), "reasons" text, "detectedPatterns" text, "urlScanResults" text, "checkedBy" varchar(255), "ipAddress" varchar(45), "userAgent" text, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "source" varchar(50) NOT NULL DEFAULT ('web'), CONSTRAINT "FK_23716221e0d9463e9e0b5faba32" FOREIGN KEY ("checkedBy") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT INTO "scam_checks"("id", "message", "extractedUrls", "status", "detectedIntent", "riskScore", "confidence", "reasons", "detectedPatterns", "urlScanResults", "checkedBy", "ipAddress", "userAgent", "createdAt", "updatedAt", "source") SELECT "id", "message", "extractedUrls", "status", "detectedIntent", "riskScore", "confidence", "reasons", "detectedPatterns", "urlScanResults", "checkedBy", "ipAddress", "userAgent", "createdAt", "updatedAt", "source" FROM "temporary_scam_checks"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_scam_checks"`);
    await queryRunner.query(
      `ALTER TABLE "uploaded_files" RENAME TO "temporary_uploaded_files"`,
    );
    await queryRunner.query(
      `CREATE TABLE "uploaded_files" ("id" varchar PRIMARY KEY NOT NULL, "filename" varchar NOT NULL, "originalName" varchar NOT NULL, "mimeType" varchar NOT NULL, "size" integer NOT NULL, "path" varchar NOT NULL, "uploadedById" varchar, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "uploadedBy" varchar, CONSTRAINT "FK_d6d041aff81e8f057d5e72b8398" FOREIGN KEY ("uploadedBy") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT INTO "uploaded_files"("id", "filename", "originalName", "mimeType", "size", "path", "uploadedById", "createdAt", "updatedAt", "uploadedBy") SELECT "id", "filename", "originalName", "mimeType", "size", "path", "uploadedById", "createdAt", "updatedAt", "uploadedBy" FROM "temporary_uploaded_files"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_uploaded_files"`);
  }
}
