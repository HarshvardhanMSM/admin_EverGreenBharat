import apiClient from "@/services/api/client";
import { AdminUser, LoginCredentials, AuthResponseData } from "@/types/auth";
import {
  setAccessToken,
  setRefreshToken,
  clearTokens,
  getAccessToken,
  getRefreshToken,
} from "./token";

export const AuthService = {
  async login(credentials: LoginCredentials): Promise<AuthResponseData> {
    const { data } = await apiClient.post<any>("/v1/admin/auth/login", credentials);

    const rawData = data?.data || data;
    const accessToken =
      rawData?.accessToken || rawData?.tokens?.accessToken || "";
    const refreshToken =
      rawData?.refreshToken || rawData?.tokens?.refreshToken || "";
    const user = rawData?.user;

    if (accessToken) {
      setAccessToken(accessToken);
    }
    if (refreshToken) {
      setRefreshToken(refreshToken);
    }

    return {
      accessToken,
      refreshToken,
      user,
    };
  },

  async logout(): Promise<void> {
    const refreshToken = getRefreshToken();
    try {
      if (getAccessToken()) {
        await apiClient.post("/v1/admin/auth/logout", { refreshToken });
      }
    } catch {
      // Ignore network failure on logout
    } finally {
      clearTokens();
    }
  },

  async getCurrentUser(): Promise<AdminUser | null> {
    const token = getAccessToken();
    if (!token) return null;

    try {
      const { data } = await apiClient.get<{
        success: boolean;
        data: AdminUser;
      }>("/v1/admin/auth/me");

      return data.data;
    } catch {
      clearTokens();
      return null;
    }
  },

  async verifySession(): Promise<boolean> {
    const token = getAccessToken();
    if (!token) return false;

    const user = await this.getCurrentUser();
    return Boolean(user);
  },
};
