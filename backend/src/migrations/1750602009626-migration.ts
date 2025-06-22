import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1750602009626 implements MigrationInterface {
  name = 'Migration1750602009626';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "education_resources" ("id" varchar PRIMARY KEY NOT NULL, "title" varchar NOT NULL, "description" text NOT NULL, "url" varchar, "imageUrl" varchar, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "deletedAt" datetime, "createdById" varchar, "nextResourceId" varchar, "parentId" varchar)`,
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_education_resources" ("id" varchar PRIMARY KEY NOT NULL, "title" varchar NOT NULL, "description" text NOT NULL, "url" varchar, "imageUrl" varchar, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "deletedAt" datetime, "createdById" varchar, "nextResourceId" varchar, "parentId" varchar, CONSTRAINT "FK_eeac4f5ce416619bc55a5b6e1a9" FOREIGN KEY ("createdById") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_b07fb5217b390244667d4263a81" FOREIGN KEY ("nextResourceId") REFERENCES "education_resources" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_dca9aad491d1ce88b994a2bba67" FOREIGN KEY ("parentId") REFERENCES "education_resources" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_education_resources"("id", "title", "description", "url", "imageUrl", "createdAt", "updatedAt", "deletedAt", "createdById", "nextResourceId", "parentId") SELECT "id", "title", "description", "url", "imageUrl", "createdAt", "updatedAt", "deletedAt", "createdById", "nextResourceId", "parentId" FROM "education_resources"`,
    );
    await queryRunner.query(`DROP TABLE "education_resources"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_education_resources" RENAME TO "education_resources"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "education_resources" RENAME TO "temporary_education_resources"`,
    );
    await queryRunner.query(
      `CREATE TABLE "education_resources" ("id" varchar PRIMARY KEY NOT NULL, "title" varchar NOT NULL, "description" text NOT NULL, "url" varchar, "imageUrl" varchar, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "deletedAt" datetime, "createdById" varchar, "nextResourceId" varchar, "parentId" varchar)`,
    );
    await queryRunner.query(
      `INSERT INTO "education_resources"("id", "title", "description", "url", "imageUrl", "createdAt", "updatedAt", "deletedAt", "createdById", "nextResourceId", "parentId") SELECT "id", "title", "description", "url", "imageUrl", "createdAt", "updatedAt", "deletedAt", "createdById", "nextResourceId", "parentId" FROM "temporary_education_resources"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_education_resources"`);
    await queryRunner.query(`DROP TABLE "education_resources"`);
  }
}
