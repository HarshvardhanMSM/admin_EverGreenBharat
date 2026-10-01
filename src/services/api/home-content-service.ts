import apiClient from './client';

export interface BannerItem {
  id: string;
  title: string;
  imageUrl: string;
  targetType: 'CREATOR' | 'STREAM' | 'CATEGORY' | 'EXTERNAL_LINK';
  targetValue?: string;
  sortOrder: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  clickCount: number;
  impressionCount: number;
  createdAt: string;
}

export interface HomeSectionItem {
  id: string;
  sectionKey: string;
  title: string;
  sortOrder: number;
  isEnabled: boolean;
  settings?: Record<string, any>;
}

export const homeContentService = {
  // ─── Banners ─────────────────────────────────────────────────────────────
  async fetchBanners(params?: { page?: number; limit?: number; search?: string; isActiveOnly?: boolean }) {
    const response = await apiClient.get('/v1/admin/content/banners', { params });
    return response.data;
  },

  async createBanner(payload: Partial<BannerItem>) {
    const response = await apiClient.post('/v1/admin/content/banners', payload);
    return response.data;
  },

  async updateBanner(id: string, payload: Partial<BannerItem>) {
    const response = await apiClient.patch(`/v1/admin/content/banners/${id}`, payload);
    return response.data;
  },

  async deleteBanner(id: string) {
    const response = await apiClient.delete(`/v1/admin/content/banners/${id}`);
    return response.data;
  },

  // ─── Featured Creators ───────────────────────────────────────────────────
  async toggleFeaturedCreator(id: string, isFeatured: boolean, featuredOrder?: number) {
    const response = await apiClient.patch(`/v1/admin/creators/${id}/feature`, { isFeatured, featuredOrder });
    return response.data;
  },

  async reorderFeaturedCreators(items: { id: string; featuredOrder: number }[]) {
    const response = await apiClient.patch('/v1/admin/creators/featured/reorder', { items });
    return response.data;
  },

  // ─── Home Sections Config ────────────────────────────────────────────────
  async fetchHomeSections() {
    const response = await apiClient.get('/v1/admin/content/home-sections');
    return response.data;
  },

  async updateHomeSection(key: string, payload: { title?: string; sortOrder?: number; isEnabled?: boolean }) {
    const response = await apiClient.patch(`/v1/admin/content/home-sections/${key}`, payload);
    return response.data;
  },

  async reorderHomeSections(items: { sectionKey: string; sortOrder: number }[]) {
    const response = await apiClient.patch('/v1/admin/content/home-sections/reorder', { items });
    return response.data;
  },

  // ─── User Follow Moderation ─────────────────────────────────────────────
  async fetchUserFollowing(userId: string, params?: { page?: number; limit?: number }) {
    const response = await apiClient.get(`/v1/admin/users/${userId}/following`, { params });
    return response.data;
  },

  async fetchUserFollowers(userId: string, params?: { page?: number; limit?: number }) {
    const response = await apiClient.get(`/v1/admin/users/${userId}/followers`, { params });
    return response.data;
  },
};
