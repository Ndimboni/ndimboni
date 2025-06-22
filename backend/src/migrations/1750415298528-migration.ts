import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1750415298528 implements MigrationInterface {
  name = 'Migration1750415298528';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "contacts" ("id" varchar PRIMARY KEY NOT NULL, "name" varchar NOT NULL, "email" varchar NOT NULL, "phone" varchar, "subject" varchar NOT NULL, "message" text NOT NULL, "category" varchar NOT NULL DEFAULT ('general_inquiry'), "status" varchar NOT NULL DEFAULT ('pending'), "adminResponse" text, "respondedBy" varchar, "respondedAt" datetime, "userId" varchar, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')))`,
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_scam_reports" ("id" varchar PRIMARY KEY NOT NULL, "title" varchar NOT NULL, "description" text NOT NULL, "scamType" varchar NOT NULL, "status" varchar NOT NULL DEFAULT ('pending'), "scammerInfo" varchar, "evidenceUrl" varchar, "reporterEmail" varchar, "reporterPhone" varchar, "userId" varchar, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "verifiedBy" varchar, "verifiedAt" datetime, "moderatedBy" varchar, "moderatedAt" datetime, "moderationNotes" text, CONSTRAINT "FK_88687000d743354ab7054099566" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_scam_reports"("id", "title", "description", "scamType", "status", "scammerInfo", "evidenceUrl", "reporterEmail", "reporterPhone", "userId", "createdAt", "updatedAt") SELECT "id", "title", "description", "scamType", "status", "scammerInfo", "evidenceUrl", "reporterEmail", "reporterPhone", "userId", "createdAt", "updatedAt" FROM "scam_reports"`,
    );
    await queryRunner.query(`DROP TABLE "scam_reports"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_scam_reports" RENAME TO "scam_reports"`,
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_contacts" ("id" varchar PRIMARY KEY NOT NULL, "name" varchar NOT NULL, "email" varchar NOT NULL, "phone" varchar, "subject" varchar NOT NULL, "message" text NOT NULL, "category" varchar NOT NULL DEFAULT ('general_inquiry'), "status" varchar NOT NULL DEFAULT ('pending'), "adminResponse" text, "respondedBy" varchar, "respondedAt" datetime, "userId" varchar, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "FK_30ef77942fc8c05fcb829dcc61d" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_contacts"("id", "name", "email", "phone", "subject", "message", "category", "status", "adminResponse", "respondedBy", "respondedAt", "userId", "createdAt", "updatedAt") SELECT "id", "name", "email", "phone", "subject", "message", "category", "status", "adminResponse", "respondedBy", "respondedAt", "userId", "createdAt", "updatedAt" FROM "contacts"`,
    );
    await queryRunner.query(`DROP TABLE "contacts"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_contacts" RENAME TO "contacts"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "contacts" RENAME TO "temporary_contacts"`,
    );
    await queryRunner.query(
      `CREATE TABLE "contacts" ("id" varchar PRIMARY KEY NOT NULL, "name" varchar NOT NULL, "email" varchar NOT NULL, "phone" varchar, "subject" varchar NOT NULL, "message" text NOT NULL, "category" varchar NOT NULL DEFAULT ('general_inquiry'), "status" varchar NOT NULL DEFAULT ('pending'), "adminResponse" text, "respondedBy" varchar, "respondedAt" datetime, "userId" varchar, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')))`,
    );
    await queryRunner.query(
      `INSERT INTO "contacts"("id", "name", "email", "phone", "subject", "message", "category", "status", "adminResponse", "respondedBy", "respondedAt", "userId", "createdAt", "updatedAt") SELECT "id", "name", "email", "phone", "subject", "message", "category", "status", "adminResponse", "respondedBy", "respondedAt", "userId", "createdAt", "updatedAt" FROM "temporary_contacts"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_contacts"`);
    await queryRunner.query(
      `ALTER TABLE "scam_reports" RENAME TO "temporary_scam_reports"`,
    );
    await queryRunner.query(
      `CREATE TABLE "scam_reports" ("id" varchar PRIMARY KEY NOT NULL, "title" varchar NOT NULL, "description" text NOT NULL, "scamType" varchar NOT NULL, "status" varchar NOT NULL DEFAULT ('pending'), "scammerInfo" varchar, "evidenceUrl" varchar, "reporterEmail" varchar, "reporterPhone" varchar, "userId" varchar, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "FK_88687000d743354ab7054099566" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT INTO "scam_reports"("id", "title", "description", "scamType", "status", "scammerInfo", "evidenceUrl", "reporterEmail", "reporterPhone", "userId", "createdAt", "updatedAt") SELECT "id", "title", "description", "scamType", "status", "scammerInfo", "evidenceUrl", "reporterEmail", "reporterPhone", "userId", "createdAt", "updatedAt" FROM "temporary_scam_reports"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_scam_reports"`);
    await queryRunner.query(`DROP TABLE "contacts"`);
  }
}
