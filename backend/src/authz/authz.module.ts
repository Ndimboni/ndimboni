import { Module } from '@nestjs/common';
import { PolicyService } from './policy.service';
import { PolicyGuard } from '../common/guards/policy.guard';

@Module({
  imports: [],
  providers: [PolicyService, PolicyGuard],
  exports: [PolicyService, PolicyGuard],
})
export class AuthzModule {}
