import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1750802172608 implements MigrationInterface {
    name = 'Migration1750802172608'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "scammer_report_instances" ("id" varchar PRIMARY KEY NOT NULL, "scammerReportId" varchar NOT NULL, "reportedBy" varchar, "ipAddress" varchar(45), "description" text, "additionalInfo" text, "source" varchar(50) NOT NULL DEFAULT ('web'), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "scammer_report_id" varchar)`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_0fd314ee8856a76608c9d59608" ON "scammer_report_instances" ("scammer_report_id", "reportedBy") `);
        await queryRunner.query(`CREATE TABLE "temporary_scammer_reports" ("id" varchar PRIMARY KEY NOT NULL, "type" varchar(50) NOT NULL, "identifier" varchar(255) NOT NULL, "description" text NOT NULL, "evidence" text, "status" varchar(50) NOT NULL DEFAULT ('pending'), "reportedBy" varchar, "verifiedBy" varchar, "ipAddress" varchar(45), "additionalInfo" text, "reportCount" integer NOT NULL DEFAULT (1), "lastReportedAt" datetime, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "source" varchar(50) NOT NULL DEFAULT ('web'), "isAutoVerified" boolean NOT NULL DEFAULT (0), "autoVerifiedAt" datetime, CONSTRAINT "FK_56a5daa953a71b25a1afae9cb2a" FOREIGN KEY ("verifiedBy") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_45effc32c38c12eaae8446f6f16" FOREIGN KEY ("reportedBy") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_scammer_reports"("id", "type", "identifier", "description", "evidence", "status", "reportedBy", "verifiedBy", "ipAddress", "additionalInfo", "reportCount", "lastReportedAt", "createdAt", "updatedAt", "source") SELECT "id", "type", "identifier", "description", "evidence", "status", "reportedBy", "verifiedBy", "ipAddress", "additionalInfo", "reportCount", "lastReportedAt", "createdAt", "updatedAt", "source" FROM "scammer_reports"`);
        await queryRunner.query(`DROP TABLE "scammer_reports"`);
        await queryRunner.query(`ALTER TABLE "temporary_scammer_reports" RENAME TO "scammer_reports"`);
        await queryRunner.query(`DROP INDEX "IDX_0fd314ee8856a76608c9d59608"`);
        await queryRunner.query(`CREATE TABLE "temporary_scammer_report_instances" ("id" varchar PRIMARY KEY NOT NULL, "scammerReportId" varchar NOT NULL, "reportedBy" varchar, "ipAddress" varchar(45), "description" text, "additionalInfo" text, "source" varchar(50) NOT NULL DEFAULT ('web'), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "scammer_report_id" varchar, CONSTRAINT "FK_e3fa89c589cb4f009eddcc54bd6" FOREIGN KEY ("scammer_report_id") REFERENCES "scammer_reports" ("id") ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT "FK_98724ff6f20c866b06e6d547a64" FOREIGN KEY ("reportedBy") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_scammer_report_instances"("id", "scammerReportId", "reportedBy", "ipAddress", "description", "additionalInfo", "source", "createdAt", "scammer_report_id") SELECT "id", "scammerReportId", "reportedBy", "ipAddress", "description", "additionalInfo", "source", "createdAt", "scammer_report_id" FROM "scammer_report_instances"`);
        await queryRunner.query(`DROP TABLE "scammer_report_instances"`);
        await queryRunner.query(`ALTER TABLE "temporary_scammer_report_instances" RENAME TO "scammer_report_instances"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_0fd314ee8856a76608c9d59608" ON "scammer_report_instances" ("scammer_report_id", "reportedBy") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_0fd314ee8856a76608c9d59608"`);
        await queryRunner.query(`ALTER TABLE "scammer_report_instances" RENAME TO "temporary_scammer_report_instances"`);
        await queryRunner.query(`CREATE TABLE "scammer_report_instances" ("id" varchar PRIMARY KEY NOT NULL, "scammerReportId" varchar NOT NULL, "reportedBy" varchar, "ipAddress" varchar(45), "description" text, "additionalInfo" text, "source" varchar(50) NOT NULL DEFAULT ('web'), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "scammer_report_id" varchar)`);
        await queryRunner.query(`INSERT INTO "scammer_report_instances"("id", "scammerReportId", "reportedBy", "ipAddress", "description", "additionalInfo", "source", "createdAt", "scammer_report_id") SELECT "id", "scammerReportId", "reportedBy", "ipAddress", "description", "additionalInfo", "source", "createdAt", "scammer_report_id" FROM "temporary_scammer_report_instances"`);
        await queryRunner.query(`DROP TABLE "temporary_scammer_report_instances"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_0fd314ee8856a76608c9d59608" ON "scammer_report_instances" ("scammer_report_id", "reportedBy") `);
        await queryRunner.query(`ALTER TABLE "scammer_reports" RENAME TO "temporary_scammer_reports"`);
        await queryRunner.query(`CREATE TABLE "scammer_reports" ("id" varchar PRIMARY KEY NOT NULL, "type" varchar(50) NOT NULL, "identifier" varchar(255) NOT NULL, "description" text NOT NULL, "evidence" text, "status" varchar(50) NOT NULL DEFAULT ('pending'), "reportedBy" varchar, "verifiedBy" varchar, "ipAddress" varchar(45), "additionalInfo" text, "reportCount" integer NOT NULL DEFAULT (1), "lastReportedAt" datetime, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "source" varchar(50) NOT NULL DEFAULT ('web'), CONSTRAINT "FK_56a5daa953a71b25a1afae9cb2a" FOREIGN KEY ("verifiedBy") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_45effc32c38c12eaae8446f6f16" FOREIGN KEY ("reportedBy") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "scammer_reports"("id", "type", "identifier", "description", "evidence", "status", "reportedBy", "verifiedBy", "ipAddress", "additionalInfo", "reportCount", "lastReportedAt", "createdAt", "updatedAt", "source") SELECT "id", "type", "identifier", "description", "evidence", "status", "reportedBy", "verifiedBy", "ipAddress", "additionalInfo", "reportCount", "lastReportedAt", "createdAt", "updatedAt", "source" FROM "temporary_scammer_reports"`);
        await queryRunner.query(`DROP TABLE "temporary_scammer_reports"`);
        await queryRunner.query(`DROP INDEX "IDX_0fd314ee8856a76608c9d59608"`);
        await queryRunner.query(`DROP TABLE "scammer_report_instances"`);
    }

}
