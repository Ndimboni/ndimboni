import { SetMetadata } from '@nestjs/common';
import { Action, Resource } from '../interfaces/policy.interface';

export const POLICY_KEY = 'policy';

export const RequirePolicy = (action: Action, resource: Resource) =>
  SetMetadata(POLICY_KEY, { action, resource });
