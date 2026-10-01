import apiClient from './client';
import {
  RoleItem,
  CreateRolePayload,
  EditRolePayload,
} from '@/types/rbac';

export const rbacService = {
  async fetchRoles() {
    const response = await apiClient.get<{ success: boolean; data: RoleItem[] }>(
      '/v1/admin/rbac/roles',
    );
    return response.data;
  },

  async fetchRoleById(id: string) {
    const response = await apiClient.get<{ success: boolean; data: RoleItem }>(
      `/v1/admin/rbac/roles/${id}`,
    );
    return response.data;
  },

  async createRole(payload: CreateRolePayload) {
    const response = await apiClient.post('/v1/admin/rbac/roles', payload);
    return response.data;
  },

  async editRole(id: string, payload: EditRolePayload) {
    const response = await apiClient.patch(`/v1/admin/rbac/roles/${id}`, payload);
    return response.data;
  },

  async deleteRole(id: string) {
    const response = await apiClient.delete(`/v1/admin/rbac/roles/${id}`);
    return response.data;
  },

  async cloneRole(id: string, payload: { code: string; name: string; description?: string }) {
    const response = await apiClient.post(`/v1/admin/rbac/roles/${id}/clone`, payload);
    return response.data;
  },

  async setRolePermissions(id: string, permissionKeys: string[]) {
    const response = await apiClient.put(`/v1/admin/rbac/roles/${id}/permissions`, {
      permissionKeys,
    });
    return response.data;
  },

  async fetchPermissions(params?: { module?: string; search?: string }) {
    const response = await apiClient.get('/v1/admin/rbac/permissions', { params });
    return response.data;
  },

  async fetchPermissionStats() {
    const response = await apiClient.get('/v1/admin/rbac/permissions/stats');
    return response.data;
  },

  async fetchPermissionById(id: string) {
    const response = await apiClient.get(`/v1/admin/rbac/permissions/${id}`);
    return response.data;
  },
};
