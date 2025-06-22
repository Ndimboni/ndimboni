import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EducationResource } from '../entities/education-resource.entity';
import { EducationResourcesService } from './education-resources.service';
import { EducationResourcesController } from './education-resources.controller';
import { AuthzModule } from '../authz/authz.module';
import { CommonServicesModule } from '../common/services/common-services.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([EducationResource]),
    AuthzModule,
    CommonServicesModule,
  ],
  providers: [EducationResourcesService],
  controllers: [EducationResourcesController],
  exports: [EducationResourcesService],
})
export class EducationResourcesModule {}
