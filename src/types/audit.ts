export interface AuditLogItem {
  id: string;
  adminId?: string | null;
  action: string;
  resource: string;
  resourceId?: string | null;
  httpMethod: string;
  beforeValue?: Record<string, any> | null;
  afterValue?: Record<string, any> | null;
  ipAddress: string;
  userAgent?: string | null;
  correlationId?: string | null;
  requestId?: string | null;
  createdAt: string;
  diff?: Record<string, { before: any; after: any; modified: boolean }> | null;
}

export interface LoginHistoryItem {
  id: string;
  userId?: string | null;
  adminId?: string | null;
  email: string;
  status: 'SUCCESS' | 'FAILED';
  failureReason?: string | null;
  ipAddress: string;
  userAgent?: string | null;
  browser?: string | null;
  device?: string | null;
  os?: string | null;
  createdAt: string;
}

export interface SessionItem {
  id: string;
  userId: string;
  familyId: string;
  ipAddress?: string | null;
  deviceInfo?: string | null;
  isRevoked: boolean;
  expiresAt: string;
  createdAt: string;
  user?: {
    id: string;
    email: string;
    username: string;
    displayName?: string | null;
  };
}
