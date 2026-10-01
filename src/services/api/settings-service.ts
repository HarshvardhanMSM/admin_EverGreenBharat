import { apiClient } from "./client";

export interface PlatformGeneralSettings {
  projectName: string;
  projectDescription: string;
  supportEmail: string;
  supportPhone: string;
  websiteUrl: string;
  currency: string;
  defaultDeliveryRadiusKm: number;
  maintenanceMode: boolean;
  logoUrl?: string;
  badgeText?: string;
  bullet1?: string;
  bullet2?: string;
  bullet3?: string;
  bullet4?: string;
  footerVersion?: string;
  footerMadeWith?: string;
}

const SETTINGS_STORAGE_KEY = "evergreen_platform_general_settings";

const DEFAULT_SETTINGS: PlatformGeneralSettings = {
  projectName: "Ever Green Bharat",
  projectDescription:
    "Empowering nursery growers, landscape creators, and millions of urban gardeners across India.",
  supportEmail: "support@evergreenbharat.com",
  supportPhone: "+91 98765 43210",
  websiteUrl: "https://evergreenbharat.com",
  currency: "INR (₹)",
  defaultDeliveryRadiusKm: 25,
  maintenanceMode: false,
  badgeText: "🌱 Unified Green Platform",
  bullet1: "Standardized Botanical Taxonomy & Care Autosuggest",
  bullet2: "Secure Doorstep Delivery OTP Verification",
  bullet3: "Institutional B2B Bulk Greenery Inquiries",
  bullet4: "Green Army Community & Plant Creator Ecosystem",
  footerVersion: "Operational Console v2.0",
  footerMadeWith: "Made with 💚 for India",
};

export const settingsService = {
  // Platform settings
  getPlatformSettings(): PlatformGeneralSettings {
    if (typeof window === "undefined") return DEFAULT_SETTINGS;
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    } catch (e) {
      console.error("Failed to parse settings from storage", e);
    }
    return DEFAULT_SETTINGS;
  },

  savePlatformSettings(settings: PlatformGeneralSettings): PlatformGeneralSettings {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
        window.dispatchEvent(
          new CustomEvent("platform_settings_updated", { detail: settings })
        );
      } catch (e) {
        console.error("Failed to save settings to storage", e);
      }
    }
    return settings;
  },

  // Admin Profile API
  async getOwnProfile() {
    try {
      const res = await apiClient.get("/v1/users/me");
      return res.data;
    } catch {
      // Fallback to admin auth me
      const res = await apiClient.get("/v1/admin/auth/me");
      return res.data;
    }
  },

  async updateOwnProfile(data: { displayName?: string; username?: string; bio?: string }) {
    const res = await apiClient.patch("/v1/users/me", data);
    return res.data;
  },

  async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    const res = await apiClient.post("/v1/users/me/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },

  async changePassword(dto: { currentPassword: string; newPassword: string }) {
    const res = await apiClient.post("/v1/users/me/change-password", dto);
    return res.data;
  },
};
