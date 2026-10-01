import { apiClient } from "./client";

export interface WalletFilterParams {
  search?: string;
  walletId?: string;
  userId?: string;
  username?: string;
  email?: string;
  creatorName?: string;
  status?: string;
  isFrozen?: boolean;
  minBalance?: number;
  maxBalance?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface TransactionFilterParams {
  search?: string;
  type?: string;
  status?: string;
  walletId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface FreezeWalletPayload {
  freezeType: "FULL" | "PARTIAL";
  reason: string;
  amount?: number;
  notes?: string;
}

export interface UnfreezeWalletPayload {
  freezeId: string;
}

export interface AdjustWalletPayload {
  adjustmentType: "CREDIT" | "DEBIT";
  amount: number;
  reason: string;
}

export interface CoinPackagePayload {
  name: string;
  coinAmount: number;
  priceUsd: number;
  bonusCoins?: number;
  badgeText?: string;
  sortOrder?: number;
  isActive?: boolean;
  isPopular?: boolean;
}

export interface PromoCodePayload {
  code: string;
  discountType: string;
  discountValue: number;
  maxRedemptions?: number | null;
  expiresAt?: string;
  isActive?: boolean;
}

export interface RefundPayload {
  originalTransactionId: string;
  amount?: number;
  reason: string;
}

export interface ChargebackPayload {
  originalTransactionId: string;
  providerReference: string;
  reason: string;
}

export interface PurchaseFilterParams {
  search?: string;
  provider?: string;
  paymentStatus?: string;
  packageId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface DailyReportFilterParams {
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export const financeService = {
  // 1. Dashboard & Analytics
  async getMetrics() {
    const res = await apiClient.get("/v1/admin/financial/dashboard/metrics");
    return res.data.data;
  },

  async getAnalytics() {
    const res = await apiClient.get("/v1/admin/financial/dashboard/analytics");
    return res.data.data;
  },

  // 2. Wallet Management
  async getWallets(params?: WalletFilterParams) {
    const res = await apiClient.get("/v1/admin/financial/wallets", { params });
    return res.data;
  },

  async getWalletById(id: string) {
    const res = await apiClient.get(`/v1/admin/financial/wallets/${id}`);
    return res.data.data;
  },

  async getWalletHistory(id: string, params?: { page?: number; limit?: number }) {
    const res = await apiClient.get(`/v1/admin/financial/wallets/${id}/history`, { params });
    return res.data;
  },

  async getWalletFreezes(id: string) {
    const res = await apiClient.get(`/v1/admin/financial/wallets/${id}/freezes`);
    return res.data;
  },

  async freezeWallet(id: string, payload: FreezeWalletPayload) {
    const res = await apiClient.post(`/v1/admin/financial/wallets/${id}/freeze`, payload);
    return res.data;
  },

  async unfreezeWallet(id: string, payload: UnfreezeWalletPayload) {
    const res = await apiClient.post(`/v1/admin/financial/wallets/${id}/unfreeze`, payload);
    return res.data;
  },

  async adjustWallet(id: string, payload: AdjustWalletPayload) {
    const res = await apiClient.post(`/v1/admin/financial/wallets/${id}/adjust`, payload);
    return res.data;
  },

  // 3. Transactions
  async getTransactions(params?: TransactionFilterParams) {
    const res = await apiClient.get("/v1/admin/financial/transactions", { params });
    return res.data;
  },

  async getTransactionDetail(idOrReference: string) {
    const res = await apiClient.get(
      `/v1/admin/financial/transactions/${encodeURIComponent(idOrReference)}`
    );
    return res.data.data;
  },

  async exportTransactions(params?: TransactionFilterParams) {
    const res = await apiClient.get("/v1/admin/financial/transactions/export", {
      params,
      responseType: "blob",
    });
    return res.data;
  },

  // 4. Coin Packages
  async getCoinPackages() {
    const res = await apiClient.get("/v1/admin/financial/coin-packages");
    return res.data.data;
  },

  async createCoinPackage(payload: CoinPackagePayload) {
    const res = await apiClient.post("/v1/admin/financial/coin-packages", payload);
    return res.data;
  },

  async updateCoinPackage(id: string, payload: Partial<CoinPackagePayload>) {
    const res = await apiClient.patch(`/v1/admin/financial/coin-packages/${id}`, payload);
    return res.data;
  },

  async deleteCoinPackage(id: string) {
    const res = await apiClient.delete(`/v1/admin/financial/coin-packages/${id}`);
    return res.data;
  },

  // 5. Promotions
  async getPromoCodes() {
    const res = await apiClient.get("/v1/admin/financial/promotions");
    return res.data.data;
  },

  async createPromoCode(payload: PromoCodePayload) {
    const res = await apiClient.post("/v1/admin/financial/promotions", payload);
    return res.data;
  },

  async updatePromoCode(id: string, payload: Partial<PromoCodePayload>) {
    const res = await apiClient.patch(`/v1/admin/financial/promotions/${id}`, payload);
    return res.data;
  },

  async deletePromoCode(id: string) {
    const res = await apiClient.delete(`/v1/admin/financial/promotions/${id}`);
    return res.data;
  },

  // 6. Reconciliation & Refunds
  async reconcileWallet(walletId: string) {
    const res = await apiClient.get(`/v1/admin/financial/reports/reconciliation/${walletId}`);
    return res.data;
  },

  async processRefund(payload: RefundPayload) {
    const res = await apiClient.post("/v1/admin/financial/refunds/refund", payload);
    return res.data;
  },

  async processChargeback(payload: ChargebackPayload) {
    const res = await apiClient.post("/v1/admin/financial/refunds/chargeback", payload);
    return res.data;
  },

  // 7. Coin Purchases
  async getPurchases(params?: PurchaseFilterParams) {
    const res = await apiClient.get("/v1/admin/financial/purchases", { params });
    return res.data;
  },

  async getPurchaseById(id: string) {
    const res = await apiClient.get(
      `/v1/admin/financial/purchases/${encodeURIComponent(id)}`
    );
    return res.data.data;
  },

  // 8. Daily Financial Reports
  async getDailyReports(params?: DailyReportFilterParams) {
    const res = await apiClient.get("/v1/admin/financial/reports/daily", { params });
    return res.data;
  },
};
