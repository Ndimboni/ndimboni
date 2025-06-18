import { Injectable } from '@nestjs/common';
import {
  Action,
  Resource,
  PolicyRule,
  PolicyContext,
} from '../common/interfaces/policy.interface';

@Injectable()
export class PolicyService {
  private policies: PolicyRule[] = [
    // Admin policies - can manage everything
    {
      action: [
        Action.CREATE,
        Action.READ,
        Action.UPDATE,
        Action.DELETE,
        Action.MANAGE,
      ],
      resource: [
        Resource.USER,
        Resource.SCAM_REPORT,
        Resource.FILE,
        Resource.EMAIL,
        Resource.ADMIN_PANEL,
      ],
      condition: (context) => context.user.role === 'admin',
    },

    // Moderator policies
    {
      action: [Action.READ, Action.UPDATE],
      resource: [Resource.SCAM_REPORT, Resource.USER],
      condition: (context) => context.user.role === 'moderator',
    },
    {
      action: [Action.CREATE, Action.READ],
      resource: [Resource.FILE, Resource.EMAIL],
      condition: (context) => context.user.role === 'moderator',
    },

    // User policies - can manage their own resources
    {
      action: [Action.READ, Action.UPDATE],
      resource: Resource.USER,
      condition: (context) =>
        context.user.role === 'user' &&
        context.resource?.ownerId === context.user.id,
    },
    {
      action: [Action.CREATE, Action.READ, Action.UPDATE],
      resource: Resource.SCAM_REPORT,
      condition: (context) =>
        context.user.role === 'user' &&
        (context.resource?.ownerId === context.user.id ||
          !context.resource?.ownerId),
    },
    {
      action: [Action.CREATE, Action.READ],
      resource: Resource.FILE,
      condition: (context) =>
        context.user.role === 'user' &&
        (context.resource?.ownerId === context.user.id ||
          !context.resource?.ownerId),
    },
  ];

  canPerformAction(
    action: Action,
    resource: Resource,
    context: PolicyContext,
  ): boolean {
    return this.policies.some((policy) => {
      // Check if action matches
      const actionMatches = Array.isArray(policy.action)
        ? policy.action.includes(action)
        : policy.action === action;

      // Check if resource matches
      const resourceMatches = Array.isArray(policy.resource)
        ? policy.resource.includes(resource)
        : policy.resource === resource;

      // Check condition if provided
      const conditionMatches = policy.condition
        ? policy.condition(context)
        : true;

      return actionMatches && resourceMatches && conditionMatches;
    });
  }

  getUserPermissions(
    context: PolicyContext,
  ): { action: Action; resource: Resource }[] {
    const permissions: { action: Action; resource: Resource }[] = [];

    this.policies.forEach((policy) => {
      const conditionMatches = policy.condition
        ? policy.condition(context)
        : true;

      if (conditionMatches) {
        const actions = Array.isArray(policy.action)
          ? policy.action
          : [policy.action];
        const resources = Array.isArray(policy.resource)
          ? policy.resource
          : [policy.resource];

        actions.forEach((action) => {
          resources.forEach((resource) => {
            permissions.push({ action, resource });
          });
        });
      }
    });

    return permissions;
  }
}
