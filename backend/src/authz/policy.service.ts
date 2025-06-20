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
        Resource.BOT_SETTINGS,
        Resource.CONTACT,
      ],
      condition: (context) => context.user.role === 'admin',
    },

    // Moderator policies - can review, approve/reject reports and manage contacts
    {
      action: [Action.READ, Action.UPDATE, Action.DELETE],
      resource: [Resource.SCAM_REPORT, Resource.CONTACT],
      condition: (context) => context.user.role === 'moderator',
    },
    {
      action: [Action.READ, Action.UPDATE],
      resource: [Resource.USER],
      condition: (context) => context.user.role === 'moderator',
    },
    {
      action: [Action.CREATE, Action.READ, Action.UPDATE],
      resource: [Resource.FILE, Resource.EMAIL],
      condition: (context) => context.user.role === 'moderator',
    },
    {
      action: [Action.READ],
      resource: [Resource.ADMIN_PANEL],
      condition: (context) => context.user.role === 'moderator',
    },

    // Analyst policies - can view and verify scam reports
    {
      action: [Action.READ, Action.UPDATE],
      resource: [Resource.SCAM_REPORT],
      condition: (context) => context.user.role === 'analyst',
    },
    {
      action: [Action.READ],
      resource: [Resource.USER, Resource.FILE],
      condition: (context) => context.user.role === 'analyst',
    },
    {
      action: [Action.READ],
      resource: [Resource.ADMIN_PANEL],
      condition: (context) => context.user.role === 'analyst',
    },

    // User policies - can create contact messages and manage their own resources
    {
      action: [Action.CREATE],
      resource: [Resource.CONTACT],
      condition: (context) =>
        context.user.role === 'user' ||
        context.user.role === 'analyst' ||
        context.user.role === 'moderator' ||
        context.user.role === 'admin',
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

  /**
   * Get role-specific capabilities and dashboard information
   */
  getRoleCapabilities(role: string): {
    name: string;
    description: string;
    capabilities: string[];
    dashboardSections: string[];
  } {
    switch (role) {
      case 'admin':
        return {
          name: 'Administrator',
          description: 'Full system access and management',
          capabilities: [
            'Manage all users and roles',
            'View and manage all scam reports',
            'Access all system settings',
            'Manage contact messages',
            'Configure bot settings',
            'View analytics and reports',
            'Delete any content',
          ],
          dashboardSections: [
            'User Management',
            'Scam Reports Overview',
            'Contact Messages',
            'System Analytics',
            'Bot Configuration',
            'Platform Settings',
          ],
        };

      case 'moderator':
        return {
          name: 'Moderator',
          description: 'Content moderation and community management',
          capabilities: [
            'Review and approve/reject scam reports',
            'Communicate with analysts and admins',
            'Manage contact messages',
            'Update user information',
            'Upload and manage files',
            'Send system emails',
            'Access moderation dashboard',
          ],
          dashboardSections: [
            'Pending Reports Review',
            'Contact Messages',
            'User Management',
            'Moderation Queue',
            'Communication Tools',
          ],
        };

      case 'analyst':
        return {
          name: 'Analyst',
          description: 'Scam analysis and verification specialist',
          capabilities: [
            'View all reported scams',
            'Mark scams as verified or unverified',
            'Add analysis notes to reports',
            'Access scam patterns and trends',
            'View user-submitted evidence',
            'Generate analysis reports',
          ],
          dashboardSections: [
            'Scam Analysis Queue',
            'Verification Dashboard',
            'Pattern Analysis',
            'Evidence Review',
            'Analysis Reports',
          ],
        };

      case 'user':
        return {
          name: 'User',
          description: 'Platform user with reporting capabilities',
          capabilities: [
            'Submit scam reports',
            'Upload evidence files',
            'Send contact messages',
            'View own reports',
            'Update personal profile',
            'Check scam detection',
          ],
          dashboardSections: [
            'My Reports',
            'Submit New Report',
            'Scam Check Tool',
            'Profile Settings',
          ],
        };

      default:
        return {
          name: 'Unknown',
          description: 'Invalid role',
          capabilities: [],
          dashboardSections: [],
        };
    }
  }

  /**
   * Check if a role can moderate content
   */
  canModerate(role: string): boolean {
    return ['admin', 'moderator'].includes(role);
  }

  /**
   * Check if a role can analyze scams
   */
  canAnalyze(role: string): boolean {
    return ['admin', 'analyst'].includes(role);
  }

  /**
   * Check if a role can access admin features
   */
  canAccessAdmin(role: string): boolean {
    return role === 'admin';
  }

  /**
   * Get workflow permissions for scam reports based on role
   */
  getScamReportWorkflow(role: string): {
    canView: boolean;
    canVerify: boolean;
    canModerate: boolean;
    canDelete: boolean;
    canUpdateStatus: boolean;
  } {
    return {
      canView: ['admin', 'moderator', 'analyst', 'user'].includes(role),
      canVerify: ['admin', 'analyst'].includes(role),
      canModerate: ['admin', 'moderator'].includes(role),
      canDelete: ['admin'].includes(role),
      canUpdateStatus: ['admin', 'moderator', 'analyst'].includes(role),
    };
  }
}
