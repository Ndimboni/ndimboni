import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1750602009626 implements MigrationInterface {
  name = 'Migration1750602009626';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "education_resources" ("id" varchar PRIMARY KEY NOT NULL, "title" varchar NOT NULL, "description" text NOT NULL, "url" varchar, "imageUrl" varchar, "category" varchar, "status" varchar NOT NULL DEFAULT ('draft'), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "deletedAt" datetime, "createdById" varchar, "nextResourceId" varchar, "parentId" varchar, CONSTRAINT "FK_eeac4f5ce416619bc55a5b6e1a9" FOREIGN KEY ("createdById") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_b07fb5217b390244667d4263a81" FOREIGN KEY ("nextResourceId") REFERENCES "education_resources" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_dca9aad491d1ce88b994a2bba67" FOREIGN KEY ("parentId") REFERENCES "education_resources" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "education_resources"`);
  }
}
