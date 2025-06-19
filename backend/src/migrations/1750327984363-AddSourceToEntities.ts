import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSourceToEntities1750327984363 implements MigrationInterface {
  name = 'AddSourceToEntities1750327984363';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "temporary_scammer_reports" ("id" varchar PRIMARY KEY NOT NULL, "type" varchar(50) NOT NULL, "identifier" varchar(255) NOT NULL, "description" text NOT NULL, "evidence" text, "status" varchar(50) NOT NULL DEFAULT ('pending'), "reportedBy" varchar(255), "verifiedBy" varchar(255), "ipAddress" varchar(45), "additionalInfo" text, "reportCount" integer NOT NULL DEFAULT (1), "lastReportedAt" datetime, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "source" varchar(50) NOT NULL DEFAULT ('web'), CONSTRAINT "FK_56a5daa953a71b25a1afae9cb2a" FOREIGN KEY ("verifiedBy") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_45effc32c38c12eaae8446f6f16" FOREIGN KEY ("reportedBy") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_scammer_reports"("id", "type", "identifier", "description", "evidence", "status", "reportedBy", "verifiedBy", "ipAddress", "additionalInfo", "reportCount", "lastReportedAt", "createdAt", "updatedAt") SELECT "id", "type", "identifier", "description", "evidence", "status", "reportedBy", "verifiedBy", "ipAddress", "additionalInfo", "reportCount", "lastReportedAt", "createdAt", "updatedAt" FROM "scammer_reports"`,
    );
    await queryRunner.query(`DROP TABLE "scammer_reports"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_scammer_reports" RENAME TO "scammer_reports"`,
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_scam_checks" ("id" varchar PRIMARY KEY NOT NULL, "message" text NOT NULL, "extractedUrls" text, "status" varchar(50) NOT NULL DEFAULT ('unknown'), "detectedIntent" varchar(50) NOT NULL DEFAULT ('unknown'), "riskScore" float NOT NULL DEFAULT (0), "confidence" float NOT NULL DEFAULT (0), "reasons" text, "detectedPatterns" text, "urlScanResults" text, "checkedBy" varchar(255), "ipAddress" varchar(45), "userAgent" text, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "source" varchar(50) NOT NULL DEFAULT ('web'), CONSTRAINT "FK_23716221e0d9463e9e0b5faba32" FOREIGN KEY ("checkedBy") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_scam_checks"("id", "message", "extractedUrls", "status", "detectedIntent", "riskScore", "confidence", "reasons", "detectedPatterns", "urlScanResults", "checkedBy", "ipAddress", "userAgent", "createdAt", "updatedAt") SELECT "id", "message", "extractedUrls", "status", "detectedIntent", "riskScore", "confidence", "reasons", "detectedPatterns", "urlScanResults", "checkedBy", "ipAddress", "userAgent", "createdAt", "updatedAt" FROM "scam_checks"`,
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
      `CREATE TABLE "scam_checks" ("id" varchar PRIMARY KEY NOT NULL, "message" text NOT NULL, "extractedUrls" text, "status" varchar(50) NOT NULL DEFAULT ('unknown'), "detectedIntent" varchar(50) NOT NULL DEFAULT ('unknown'), "riskScore" float NOT NULL DEFAULT (0), "confidence" float NOT NULL DEFAULT (0), "reasons" text, "detectedPatterns" text, "urlScanResults" text, "checkedBy" varchar(255), "ipAddress" varchar(45), "userAgent" text, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "FK_23716221e0d9463e9e0b5faba32" FOREIGN KEY ("checkedBy") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT INTO "scam_checks"("id", "message", "extractedUrls", "status", "detectedIntent", "riskScore", "confidence", "reasons", "detectedPatterns", "urlScanResults", "checkedBy", "ipAddress", "userAgent", "createdAt", "updatedAt") SELECT "id", "message", "extractedUrls", "status", "detectedIntent", "riskScore", "confidence", "reasons", "detectedPatterns", "urlScanResults", "checkedBy", "ipAddress", "userAgent", "createdAt", "updatedAt" FROM "temporary_scam_checks"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_scam_checks"`);
    await queryRunner.query(
      `ALTER TABLE "scammer_reports" RENAME TO "temporary_scammer_reports"`,
    );
    await queryRunner.query(
      `CREATE TABLE "scammer_reports" ("id" varchar PRIMARY KEY NOT NULL, "type" varchar(50) NOT NULL, "identifier" varchar(255) NOT NULL, "description" text NOT NULL, "evidence" text, "status" varchar(50) NOT NULL DEFAULT ('pending'), "reportedBy" varchar(255), "verifiedBy" varchar(255), "ipAddress" varchar(45), "additionalInfo" text, "reportCount" integer NOT NULL DEFAULT (1), "lastReportedAt" datetime, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "FK_56a5daa953a71b25a1afae9cb2a" FOREIGN KEY ("verifiedBy") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_45effc32c38c12eaae8446f6f16" FOREIGN KEY ("reportedBy") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT INTO "scammer_reports"("id", "type", "identifier", "description", "evidence", "status", "reportedBy", "verifiedBy", "ipAddress", "additionalInfo", "reportCount", "lastReportedAt", "createdAt", "updatedAt") SELECT "id", "type", "identifier", "description", "evidence", "status", "reportedBy", "verifiedBy", "ipAddress", "additionalInfo", "reportCount", "lastReportedAt", "createdAt", "updatedAt" FROM "temporary_scammer_reports"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_scammer_reports"`);
  }
}
