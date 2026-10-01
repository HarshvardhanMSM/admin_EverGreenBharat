import { apiClient } from "./client";

export interface CategoryAttributeItem {
  id: string;
  categoryId: string;
  attributeName: string;
  dataType:
    | "text"
    | "number"
    | "number+unit"
    | "dropdown"
    | "multi-select"
    | "boolean"
    | "rich-text";
  unitOptions: string[];
  dropdownOptions: string[];
  requiredLevel: "required" | "recommended" | "optional";
  filterable: boolean;
  displayOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  iconUrl: string | null;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  parentId: string | null;
  parent?: CategoryItem | null;
  subcategories?: CategoryItem[];
  subcategoriesCount?: number;
  attributes?: CategoryAttributeItem[];
  attributesCount?: number;
  translations?: Record<string, { name?: string; description?: string }>;
  createdAt?: string;
  updatedAt?: string;
}

export const categoryService = {
  // ─── Categories ─────────────────────────────────────────────────────────────
  async fetchCategories(params?: {
    search?: string;
    parentOnly?: boolean;
    parentId?: string;
    activeOnly?: boolean;
    page?: number;
    limit?: number;
  }) {
    try {
      const response = await apiClient.get("/v1/admin/categories", { params });
      return response.data;
    } catch (err) {
      // Fallback to public categories endpoint if admin endpoint returns error (e.g., auth expired)
      try {
        const fallback = await apiClient.get("/v1/categories");
        return fallback.data;
      } catch {
        throw err;
      }
    }
  },

  async fetchCategoryById(id: string) {
    const response = await apiClient.get(`/v1/admin/categories/${id}`);
    return response.data;
  },

  async createCategory(payload: {
    name: string;
    slug?: string;
    description?: string;
    iconUrl?: string;
    imageUrl?: string;
    parentId?: string;
    sortOrder?: number;
    translations?: Record<string, { name?: string; description?: string }>;
  }) {
    const response = await apiClient.post("/v1/admin/categories", payload);
    return response.data;
  },

  async updateCategory(
    id: string,
    payload: {
      name?: string;
      slug?: string;
      description?: string;
      iconUrl?: string;
      imageUrl?: string;
      parentId?: string;
      sortOrder?: number;
      isActive?: boolean;
      translations?: Record<string, { name?: string; description?: string }>;
    },
  ) {
    const response = await apiClient.patch(`/v1/admin/categories/${id}`, payload);
    return response.data;
  },

  async toggleCategoryStatus(id: string, isActive: boolean) {
    const response = await apiClient.patch(`/v1/admin/categories/${id}/status`, {
      isActive,
    });
    return response.data;
  },

  async reorderCategories(items: { id: string; sortOrder: number }[]) {
    const response = await apiClient.patch("/v1/admin/categories/reorder", {
      items,
    });
    return response.data;
  },

  async deleteCategory(id: string) {
    const response = await apiClient.delete(`/v1/admin/categories/${id}`);
    return response.data;
  },

  // ─── Subcategories ──────────────────────────────────────────────────────────
  async fetchSubcategories(categoryId: string) {
    try {
      const response = await apiClient.get(
        `/v1/admin/categories/${categoryId}/subcategories`,
      );
      return response.data;
    } catch (err) {
      try {
        const fallback = await apiClient.get(
          `/v1/categories/${categoryId}/subcategories`,
        );
        return fallback.data;
      } catch {
        throw err;
      }
    }
  },

  async createSubcategory(
    categoryId: string,
    payload: {
      name: string;
      slug?: string;
      description?: string;
      iconUrl?: string;
      imageUrl?: string;
      sortOrder?: number;
      translations?: Record<string, { name?: string; description?: string }>;
    },
  ) {
    const response = await apiClient.post(
      `/v1/admin/categories/${categoryId}/subcategories`,
      payload,
    );
    return response.data;
  },

  async reorderSubcategories(
    categoryId: string,
    items: { id: string; sortOrder: number }[],
  ) {
    const response = await apiClient.patch(
      `/v1/admin/categories/${categoryId}/subcategories/reorder`,
      { items },
    );
    return response.data;
  },

  // ─── Category Dynamic Attributes (SOW 4a, 5.3, 10.7) ────────────────────────
  async fetchCategoryAttributes(categoryId: string) {
    try {
      const response = await apiClient.get(
        `/v1/admin/categories/${categoryId}/attributes`,
      );
      return response.data;
    } catch (err) {
      try {
        const fallback = await apiClient.get(
          `/v1/categories/${categoryId}/attributes`,
        );
        return fallback.data;
      } catch {
        throw err;
      }
    }
  },

  async createCategoryAttribute(
    categoryId: string,
    payload: {
      attributeName: string;
      dataType:
        | "text"
        | "number"
        | "number+unit"
        | "dropdown"
        | "multi-select"
        | "boolean"
        | "rich-text";
      unitOptions?: string[];
      dropdownOptions?: string[];
      requiredLevel?: "required" | "recommended" | "optional";
      filterable?: boolean;
      displayOrder?: number;
    },
  ) {
    const response = await apiClient.post(
      `/v1/admin/categories/${categoryId}/attributes`,
      payload,
    );
    return response.data;
  },

  async updateCategoryAttribute(
    categoryId: string,
    attributeId: string,
    payload: {
      attributeName?: string;
      dataType?: string;
      unitOptions?: string[];
      dropdownOptions?: string[];
      requiredLevel?: string;
      filterable?: boolean;
      displayOrder?: number;
    },
  ) {
    const response = await apiClient.patch(
      `/v1/admin/categories/${categoryId}/attributes/${attributeId}`,
      payload,
    );
    return response.data;
  },

  async toggleAttributeFilterable(
    categoryId: string,
    attributeId: string,
    filterable?: boolean,
  ) {
    const response = await apiClient.patch(
      `/v1/admin/categories/${categoryId}/attributes/${attributeId}/filterable`,
      { filterable },
    );
    return response.data;
  },

  async reorderCategoryAttributes(
    categoryId: string,
    items: { id: string; displayOrder: number }[],
  ) {
    const response = await apiClient.patch(
      `/v1/admin/categories/${categoryId}/attributes/reorder`,
      { items },
    );
    return response.data;
  },

  async deleteCategoryAttribute(categoryId: string, attributeId: string) {
    const response = await apiClient.delete(
      `/v1/admin/categories/${categoryId}/attributes/${attributeId}`,
    );
    return response.data;
  },
};
