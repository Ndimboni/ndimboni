import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PolicyService } from '../authz/policy.service';
import { POLICY_KEY } from '../decorators/policy.decorator';
import {
  Action,
  Resource,
  PolicyContext,
} from '../common/interfaces/policy.interface';

@Injectable()
export class PolicyGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private policyService: PolicyService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const policy = this.reflector.get<{ action: Action; resource: Resource }>(
      POLICY_KEY,
      context.getHandler(),
    );

    if (!policy) {
      return true; // No policy specified, allow access
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const policyContext: PolicyContext = {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      resource: request.params?.id ? { id: request.params.id } : undefined,
      environment: {
        ip: request.ip,
        userAgent: request.headers['user-agent'],
      },
    };

    const canPerform = this.policyService.canPerformAction(
      policy.action,
      policy.resource,
      policyContext,
    );

    if (!canPerform) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
