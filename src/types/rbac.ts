export interface PermissionItem {
  id: string;
  key: string;
  module: string;
  description?: string | null;
}

export interface RoleItem {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  isSystem: boolean;
  createdAt: string;
  rolePermissions?: Array<{
    roleId: string;
    permissionId: string;
    permission: PermissionItem;
  }>;
  adminRoles?: Array<{
    adminId: string;
    roleId: string;
  }>;
}

export interface CreateRolePayload {
  code: string;
  name: string;
  description?: string;
  permissionKeys?: string[];
}

export interface EditRolePayload {
  name?: string;
  description?: string;
  permissionKeys?: string[];
}

export interface PermissionStats {
  id: string;
  key: string;
  module: string;
  description?: string | null;
  roleCount: number;
  adminCount: number;
}
