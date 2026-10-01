import apiClient from './client';
import { AdminProfile, CreateAdminPayload, UpdateAdminPayload } from '@/types/admin';

export const adminService = {
  async fetchAdmins(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    department?: string;
    roleCode?: string;
  }) {
    const response = await apiClient.get('/v1/admin/admins', { params });
    return response.data;
  },

  async fetchAdminById(id: string) {
    const response = await apiClient.get<{ success: boolean; data: AdminProfile }>(
      `/v1/admin/admins/${id}`,
    );
    return response.data;
  },

  async createAdmin(payload: CreateAdminPayload) {
    const response = await apiClient.post('/v1/admin/admins', payload);
    return response.data;
  },

  async updateAdmin(id: string, payload: UpdateAdminPayload) {
    const response = await apiClient.patch(`/v1/admin/admins/${id}`, payload);
    return response.data;
  },

  async suspendAdmin(id: string, reason: string) {
    const response = await apiClient.post(`/v1/admin/admins/${id}/suspend`, { reason });
    return response.data;
  },

  async activateAdmin(id: string) {
    const response = await apiClient.post(`/v1/admin/admins/${id}/activate`);
    return response.data;
  },

  async softDeleteAdmin(id: string) {
    const response = await apiClient.delete(`/v1/admin/admins/${id}`);
    return response.data;
  },

  async restoreAdmin(id: string) {
    const response = await apiClient.post(`/v1/admin/admins/${id}/restore`);
    return response.data;
  },

  async resetAdminPassword(id: string, newPassword: string) {
    const response = await apiClient.post(`/v1/admin/admins/${id}/reset-password`, {
      newPassword,
    });
    return response.data;
  },

  async forceLogoutAdmin(id: string) {
    const response = await apiClient.post(`/v1/admin/admins/${id}/force-logout`);
    return response.data;
  },

  async assignAdminRoles(id: string, roleCodes: string[]) {
    const response = await apiClient.post(`/v1/admin/admins/${id}/roles`, { roleCodes });
    return response.data;
  },

  async removeAdminRole(id: string, roleId: string) {
    const response = await apiClient.delete(`/v1/admin/admins/${id}/roles/${roleId}`);
    return response.data;
  },

  async fetchAdminSessions(id: string) {
    const response = await apiClient.get(`/v1/admin/admins/${id}/sessions`);
    return response.data;
  },

  async fetchAdminLoginHistory(id: string, page = 1, limit = 20) {
    const response = await apiClient.get(`/v1/admin/admins/${id}/login-history`, {
      params: { page, limit },
    });
    return response.data;
  },
};
