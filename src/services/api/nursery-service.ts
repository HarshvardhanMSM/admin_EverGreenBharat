import { apiClient } from "./client";

export const nurseryService = {
  // ─── Master Product Catalog ──────────────────────────────────────────────────
  async searchMasterProducts(q: string) {
    const response = await apiClient.get("/v1/master-products/search", {
      params: { q },
    });
    return response.data;
  },

  async fetchMasterProducts(params?: {
    q?: string;
    source?: string;
    status?: string;
    categoryId?: string;
    subcategoryId?: string;
    page?: number;
    limit?: number;
  }) {
    const response = await apiClient.get("/v1/admin/master-products", { params });
    return response.data;
  },

  async fetchMasterProductById(id: string) {
    const response = await apiClient.get(`/v1/master-products/${id}`);
    return response.data;
  },

  async createMasterProduct(payload: Record<string, any>) {
    const response = await apiClient.post("/v1/admin/master-products", payload);
    return response.data;
  },

  async updateMasterProduct(id: string, payload: Record<string, any>) {
    const response = await apiClient.put(`/v1/admin/master-products/${id}`, payload);
    return response.data;
  },

  async mergeMasterProducts(canonicalId: string, duplicateId: string) {
    const response = await apiClient.post(
      `/v1/admin/master-products/${canonicalId}/merge/${duplicateId}`,
    );
    return response.data;
  },

  // ─── Vendors & Nurseries ─────────────────────────────────────────────────────
  async fetchVendors(params?: {
    search?: string;
    approvalStatus?: string;
    page?: number;
    limit?: number;
  }) {
    const response = await apiClient.get("/v1/admin/vendors", { params });
    return response.data;
  },

  async updateVendorApproval(
    vendorId: string,
    status: "APPROVED" | "REJECTED",
    rejectionReason?: string,
  ) {
    const response = await apiClient.patch(`/v1/admin/vendors/${vendorId}/approval`, {
      status,
      rejectionReason,
    });
    return response.data;
  },

  async toggleVendorActive(vendorId: string) {
    const response = await apiClient.patch(`/v1/admin/vendors/${vendorId}/status`);
    return response.data;
  },

  async fetchVendorById(vendorId: string) {
    const response = await apiClient.get(`/v1/admin/vendors/${vendorId}`);
    return response.data;
  },

  async updateVendor(vendorId: string, payload: Record<string, any>) {
    const response = await apiClient.put(`/v1/admin/vendors/${vendorId}`, payload);
    return response.data;
  },

  async fetchVendorProducts(vendorId: string, params?: Record<string, any>) {
    const response = await apiClient.get(`/v1/admin/vendors/${vendorId}/products`, {
      params,
    });
    return response.data;
  },

  async createVendorProduct(vendorId: string, payload: Record<string, any>) {
    const response = await apiClient.post(
      `/v1/admin/vendors/${vendorId}/products`,
      payload,
    );
    return response.data;
  },

  async updateVendorProduct(
    vendorId: string,
    productId: string,
    payload: Record<string, any>,
  ) {
    const response = await apiClient.put(
      `/v1/admin/vendors/${vendorId}/products/${productId}`,
      payload,
    );
    return response.data;
  },

  async toggleVendorProductStatus(vendorId: string, productId: string) {
    const response = await apiClient.patch(
      `/v1/admin/vendors/${vendorId}/products/${productId}/status`,
    );
    return response.data;
  },

  async deleteVendorProduct(vendorId: string, productId: string) {
    const response = await apiClient.delete(
      `/v1/admin/vendors/${vendorId}/products/${productId}`,
    );
    return response.data;
  },

  // ─── Products & Catalog ──────────────────────────────────────────────────────
  async fetchProducts(params?: Record<string, any>) {
    const response = await apiClient.get("/v1/products", { params });
    return response.data;
  },

  async fetchProductDetail(id: string) {
    const response = await apiClient.get(`/v1/products/${id}`);
    return response.data;
  },

  // ─── Orders & Delivery OTP ───────────────────────────────────────────────────
  async fetchOrders(params?: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const response = await apiClient.get("/v1/admin/orders", { params });
    return response.data;
  },

  async fetchOrderDetail(orderId: string) {
    const response = await apiClient.get(`/v1/admin/orders/${orderId}`);
    return response.data;
  },

  async resetDeliveryOtp(orderId: string) {
    const response = await apiClient.post(`/v1/admin/orders/${orderId}/reset-delivery-otp`);
    return response.data;
  },

  // ─── Institutional Inquiries ─────────────────────────────────────────────────
  async fetchInquiries(params?: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const response = await apiClient.get("/v1/admin/inquiries", { params });
    return response.data;
  },

  async updateInquiryStatus(
    id: string,
    payload: {
      status: string;
      note?: string;
      assignedAdminId?: string;
    },
  ) {
    const response = await apiClient.patch(`/v1/admin/inquiries/${id}/status`, payload);
    return response.data;
  },

  async addInquiryNote(id: string, text: string) {
    const response = await apiClient.post(`/v1/admin/inquiries/${id}/notes`, { text });
    return response.data;
  },

  // ─── Green Army & Content Moderation ─────────────────────────────────────────
  async fetchInfluencers(params?: { page?: number; limit?: number }) {
    const response = await apiClient.get("/v1/admin/influencers", { params });
    return response.data;
  },

  async updateInfluencerApproval(
    id: string,
    status: "APPROVED" | "REJECTED",
    rejectionReason?: string,
  ) {
    const response = await apiClient.patch(`/v1/admin/influencers/${id}/approval`, {
      status,
      rejectionReason,
    });
    return response.data;
  },

  async fetchReportedContent(params?: { page?: number; limit?: number }) {
    const response = await apiClient.get("/v1/admin/content/reported", { params });
    return response.data;
  },

  async resolveContentReport(id: string, action: "remove" | "dismiss") {
    const response = await apiClient.patch(`/v1/admin/content/reports/${id}/resolve`, {
      action,
    });
    return response.data;
  },

  // ─── Templates & Notification Aliases ─────────────────────────────────────────
  async getNotificationTemplates() {
    try {
      const response = await apiClient.get("/v1/admin/notification-templates");
      return response.data;
    } catch {
      return { data: [1, 2, 3, 4, 5] };
    }
  },

  // ─── Plant Media Uploads ───────────────────────────────────────────────────
  async uploadPlantImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiClient.post("/v1/uploads/products", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    const url =
      response.data?.data?.url ||
      response.data?.url ||
      response.data?.data?.fileUrl ||
      response.data?.fileUrl ||
      "";
    return url;
  },

  async uploadPlantImages(files: File[]): Promise<string[]> {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    const response = await apiClient.post("/v1/uploads/products/multiple", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    const urls =
      response.data?.data?.urls ||
      response.data?.urls ||
      (Array.isArray(response.data?.data) ? response.data.data.map((x: any) => x.url || x) : []) ||
      [];
    return urls;
  },

  // ─── Dashboard Aliases ───────────────────────────────────────────────────────
  getMasterProducts(params?: any) {
    return this.fetchMasterProducts(params);
  },
  getVendors(params?: any) {
    return this.fetchVendors(params);
  },
  getOrders(params?: any) {
    return this.fetchOrders(params);
  },
  getInquiries(params?: any) {
    return this.fetchInquiries(params);
  },
  getInfluencerProfiles(params?: any) {
    return this.fetchInfluencers(params);
  },
};


