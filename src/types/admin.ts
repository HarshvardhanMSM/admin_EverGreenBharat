export interface AdminProfile {
  id: string;
  userId: string;
  isSuperAdmin: boolean;
  department?: string | null;
  notes?: string | null;
  status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
  lastLoginAt?: string | null;
  lastLoginIp?: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    username: string;
    displayName?: string | null;
    avatarUrl?: string | null;
    status: string;
  };
  adminRoles?: Array<{
    adminId: string;
    roleId: string;
    role: {
      id: string;
      code: string;
      name: string;
      description?: string | null;
      isSystem: boolean;
    };
  }>;
}

export interface CreateAdminPayload {
  email: string;
  username: string;
  password: string;
  displayName?: string;
  department?: string;
  notes?: string;
  avatarUrl?: string;
  isSuperAdmin?: boolean;
  roleCodes?: string[];
}

export interface UpdateAdminPayload {
  displayName?: string;
  department?: string;
  notes?: string;
  avatarUrl?: string;
  status?: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
}
