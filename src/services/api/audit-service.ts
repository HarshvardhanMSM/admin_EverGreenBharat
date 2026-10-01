import apiClient from './client';

export const auditService = {
  async fetchAuditLogs(params?: {
    page?: number;
    limit?: number;
    adminId?: string;
    action?: string;
    resource?: string;
    httpMethod?: string;
    correlationId?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }) {
    const response = await apiClient.get('/v1/admin/audit-logs', { params });
    return response.data;
  },

  async fetchAuditLogById(id: string) {
    const response = await apiClient.get(`/v1/admin/audit-logs/${id}`);
    return response.data;
  },

  async exportAuditLogs(params?: Record<string, any>) {
    const response = await apiClient.get('/v1/admin/audit-logs/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },

  async fetchLoginHistory(params?: {
    page?: number;
    limit?: number;
    userId?: string;
    adminId?: string;
    email?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }) {
    const response = await apiClient.get('/v1/admin/login-history', { params });
    return response.data;
  },

  async exportLoginHistory(params?: Record<string, any>) {
    const response = await apiClient.get('/v1/admin/login-history/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },

  async fetchSessions(params?: { page?: number; limit?: number; search?: string }) {
    const response = await apiClient.get('/v1/admin/sessions', { params });
    return response.data;
  },

  async revokeSession(sessionId: string) {
    const response = await apiClient.delete(`/v1/admin/sessions/${sessionId}`);
    return response.data;
  },

  async forceLogoutAdminSessions(adminId: string) {
    const response = await apiClient.delete(`/v1/admin/sessions/admin/${adminId}`);
    return response.data;
  },
};
