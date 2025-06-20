export enum Action {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  MANAGE = 'manage',
}

export enum Resource {
  USER = 'user',
  SCAM_REPORT = 'scam-report',
  FILE = 'file',
  EMAIL = 'email',
  ADMIN_PANEL = 'admin-panel',
  BOT_SETTINGS = 'bot-settings',
  CONTACT = 'contact',
}

export interface PolicyRule {
  action: Action | Action[];
  resource: Resource | Resource[];
  condition?: (context: PolicyContext) => boolean;
}

export interface PolicyContext {
  user: {
    id: string;
    email: string;
    role: string;
  };
  resource?: {
    id?: string;
    ownerId?: string;
    [key: string]: any;
  };
  environment?: {
    ip?: string;
    userAgent?: string;
    [key: string]: any;
  };
}
