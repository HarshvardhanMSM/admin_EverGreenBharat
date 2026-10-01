import apiClient from './client';

// ─── Creator Channel Service ──────────────────────────────────────────────────

export const creatorService = {
  async fetchCreators(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    categoryId?: string;
    isVerified?: boolean;
  }) {
    const response = await apiClient.get('/v1/admin/creators', { params });
    return response.data;
  },

  async fetchCreatorById(id: string) {
    const response = await apiClient.get(`/v1/admin/creators/${id}`);
    return response.data;
  },

  async updateCreator(id: string, payload: Record<string, any>) {
    const response = await apiClient.patch(`/v1/admin/creators/${id}`, payload);
    return response.data;
  },

  async suspendCreator(id: string, reason: string, durationDays?: number) {
    const response = await apiClient.post(`/v1/admin/creators/${id}/suspend`, {
      reason,
      ...(durationDays ? { durationDays } : {}),
    });
    return response.data;
  },

  async unsuspendCreator(id: string) {
    const response = await apiClient.post(`/v1/admin/creators/${id}/unsuspend`);
    return response.data;
  },

  async banCreator(id: string, reason: string) {
    const response = await apiClient.post(`/v1/admin/creators/${id}/ban`, { reason });
    return response.data;
  },

  async regenerateStreamKey(id: string) {
    const response = await apiClient.post(`/v1/admin/creators/${id}/stream-key/regenerate`);
    return response.data;
  },

  async getPayoutSettings(id: string) {
    const response = await apiClient.get(`/v1/admin/creators/${id}/payout-settings`);
    return response.data;
  },

  async updatePayoutSettings(id: string, payload: Record<string, any>) {
    const response = await apiClient.patch(`/v1/admin/creators/${id}/payout-settings`, payload);
    return response.data;
  },

  async getVerifications(id: string) {
    const response = await apiClient.get(`/v1/admin/creators/${id}/verifications`);
    return response.data;
  },

  async approveVerification(creatorId: string, verificationId: string) {
    const response = await apiClient.post(
      `/v1/admin/creators/${creatorId}/verifications/${verificationId}/approve`,
    );
    return response.data;
  },

  async rejectVerification(creatorId: string, verificationId: string, reason: string) {
    const response = await apiClient.post(
      `/v1/admin/creators/${creatorId}/verifications/${verificationId}/reject`,
      { reason },
    );
    return response.data;
  },

  async getNotes(id: string) {
    const response = await apiClient.get(`/v1/admin/creators/${id}/notes`);
    return response.data;
  },

  async createNote(id: string, body: string) {
    const response = await apiClient.post(`/v1/admin/creators/${id}/notes`, { body });
    return response.data;
  },

  async deleteNote(creatorId: string, noteId: string) {
    const response = await apiClient.delete(`/v1/admin/creators/${creatorId}/notes/${noteId}`);
    return response.data;
  },

  async exportCsv() {
    const response = await apiClient.get('/v1/admin/creators/export', { responseType: 'blob' });
    return response.data;
  },

  async fetchPublicCreators(params?: { page?: number; limit?: number; search?: string; categoryId?: string; language?: string; sort?: string }) {
    const response = await apiClient.get('/v1/creators', { params });
    return response.data;
  },

  async getDashboardSummary() {
    const response = await apiClient.get('/v1/me/creator/dashboard');
    return response.data;
  },

  async uploadDocument(payload: { type: string; fileUrl: string; fileMetadata?: any }) {
    const response = await apiClient.post('/v1/me/creator/documents', payload);
    return response.data;
  },

  async fetchMyDocuments() {
    const response = await apiClient.get('/v1/me/creator/documents');
    return response.data;
  },

  async deleteDocument(id: string) {
    const response = await apiClient.delete(`/v1/me/creator/documents/${id}`);
    return response.data;
  },

  async submitVerification(payload: { type: string; documentId?: string; phoneNumber?: string }) {
    const response = await apiClient.post('/v1/me/creator/verifications', payload);
    return response.data;
  },

  async fetchMyVerifications() {
    const response = await apiClient.get('/v1/me/creator/verifications');
    return response.data;
  },

  async getPricing(id: string) {
    const response = await apiClient.get(`/v1/admin/creators/${id}/pricing`);
    return response.data;
  },

  async updateChatPricing(id: string, chatPricePerMessageCoins: number) {
    const response = await apiClient.patch(`/v1/admin/creators/${id}/pricing/chat`, {
      chatPricePerMessageCoins,
    });
    return response.data;
  },

  async updateStreamEntryFee(id: string, defaultStreamEntryFeeCoins: number) {
    const response = await apiClient.patch(`/v1/admin/creators/${id}/pricing/stream-entry`, {
      defaultStreamEntryFeeCoins,
    });
    return response.data;
  },

  async getVideoPackages(id: string) {
    const response = await apiClient.get(`/v1/admin/creators/${id}/video-packages`);
    return response.data;
  },

  async getPhotos(id: string) {
    const response = await apiClient.get(`/v1/admin/creators/${id}/photos`);
    return response.data;
  },
};

// ─── Creator Applications Service ─────────────────────────────────────────────

export const creatorApplicationService = {
  async fetchApplications(params?: {
    page?: number;
    limit?: number;
    status?: string;
    reviewerId?: string;
  }) {
    const response = await apiClient.get('/v1/admin/creator-applications', { params });
    return response.data;
  },

  async fetchApplicationById(id: string) {
    const response = await apiClient.get(`/v1/admin/creator-applications/${id}`);
    return response.data;
  },

  async pickup(id: string) {
    const response = await apiClient.post(`/v1/admin/creator-applications/${id}/pickup`);
    return response.data;
  },

  async requestInfo(id: string, requestedInfo: Array<{ field: string; reason: string }>, comment?: string) {
    const response = await apiClient.post(`/v1/admin/creator-applications/${id}/request-info`, {
      requestedInfo,
      comment,
    });
    return response.data;
  },

  async approve(id: string, comment?: string) {
    const response = await apiClient.post(`/v1/admin/creator-applications/${id}/approve`, { comment });
    return response.data;
  },

  async reject(id: string, reason: string) {
    const response = await apiClient.post(`/v1/admin/creator-applications/${id}/reject`, { reason });
    return response.data;
  },
};

// ─── Categories Service ────────────────────────────────────────────────────────

export const categoryService = {
  async fetchCategories(params?: { page?: number; limit?: number; activeOnly?: boolean }) {
    const response = await apiClient.get('/v1/admin/categories', { params });
    return response.data;
  },

  async fetchPublicCategories() {
    const response = await apiClient.get('/v1/categories');
    return response.data;
  },

  async createCategory(payload: { name: string; description?: string; iconUrl?: string; sortOrder?: number }) {
    const response = await apiClient.post('/v1/admin/categories', payload);
    return response.data;
  },

  async updateCategory(id: string, payload: Record<string, any>) {
    const response = await apiClient.patch(`/v1/admin/categories/${id}`, payload);
    return response.data;
  },

  async deleteCategory(id: string) {
    const response = await apiClient.delete(`/v1/admin/categories/${id}`);
    return response.data;
  },
};
