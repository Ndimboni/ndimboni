import { Module } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LocalAuthGuard } from './local-auth.guard';
import { PolicyGuard } from './policy.guard';

@Module({
  providers: [JwtAuthGuard, LocalAuthGuard, PolicyGuard],
  exports: [JwtAuthGuard, LocalAuthGuard, PolicyGuard],
})
export class CommonGuardsModule {}
