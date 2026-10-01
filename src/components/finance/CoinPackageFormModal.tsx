"use client";

import React, { useState, useEffect } from "react";

export interface CoinPackageFormData {
  id?: string;
  name: string;
  coinAmount: number;
  priceUsd: number;
  bonusCoins: number;
  badgeText: string;
  sortOrder: number;
  isActive: boolean;
  isPopular: boolean;
}

interface CoinPackageFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CoinPackageFormData) => Promise<void>;
  initialData?: CoinPackageFormData | null;
}

export const CoinPackageFormModal: React.FC<CoinPackageFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [formData, setFormData] = useState<CoinPackageFormData>({
    name: "",
    coinAmount: 100,
    priceUsd: 0.99,
    bonusCoins: 0,
    badgeText: "",
    sortOrder: 0,
    isActive: true,
    isPopular: false,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        name: "",
        coinAmount: 100,
        priceUsd: 0.99,
        bonusCoins: 0,
        badgeText: "",
        sortOrder: 0,
        isActive: true,
        isPopular: false,
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-card rounded-2xl border shadow-xl p-6 text-foreground">
        <h3 className="text-lg font-bold">{initialData ? "Edit Coin Package" : "Create Coin Package"}</h3>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase mb-1">Package Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Starter Pack"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase mb-1">Base Coins</label>
              <input
                type="number"
                min="1"
                required
                value={formData.coinAmount}
                onChange={(e) => setFormData({ ...formData, coinAmount: parseInt(e.target.value) || 0 })}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase mb-1">Price (USD $)</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                required
                value={formData.priceUsd}
                onChange={(e) => setFormData({ ...formData, priceUsd: parseFloat(e.target.value) || 0 })}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase mb-1">Bonus Coins</label>
              <input
                type="number"
                min="0"
                value={formData.bonusCoins}
                onChange={(e) => setFormData({ ...formData, bonusCoins: parseInt(e.target.value) || 0 })}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase mb-1">Badge Text</label>
              <input
                type="text"
                value={formData.badgeText}
                onChange={(e) => setFormData({ ...formData, badgeText: e.target.value })}
                placeholder="e.g. POPULAR"
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="isActiveCheck"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="h-4 w-4 rounded border-border"
            />
            <label htmlFor="isActiveCheck" className="text-sm font-medium">Package Active & Available</label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isPopularCheck"
              checked={formData.isPopular}
              onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
              className="h-4 w-4 rounded border-border"
            />
            <label htmlFor="isPopularCheck" className="text-sm font-medium">Mark as Popular (promoted tier)</label>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded-lg border bg-muted hover:bg-muted/80"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Saving..." : initialData ? "Update Package" : "Create Package"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
