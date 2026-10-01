"use client";

import React, { useState, useEffect } from "react";

export interface PromoCodeFormData {
  id?: string;
  code: string;
  discountType: string;
  discountValue: number;
  maxRedemptions?: number | null;
  expiresAt?: string;
  isActive: boolean;
}

interface PromoCodeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PromoCodeFormData) => Promise<void>;
  initialData?: PromoCodeFormData | null;
}

export const PromoCodeFormModal: React.FC<PromoCodeFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [formData, setFormData] = useState<PromoCodeFormData>({
    code: "",
    discountType: "FIXED_COINS",
    discountValue: 50,
    maxRedemptions: null,
    expiresAt: "",
    isActive: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        code: "",
        discountType: "FIXED_COINS",
        discountValue: 50,
        maxRedemptions: null,
        expiresAt: "",
        isActive: true,
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
        <h3 className="text-lg font-bold">{initialData ? "Edit Promo Code" : "Create Promo Code"}</h3>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase mb-1">Promo Code</label>
            <input
              type="text"
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="e.g. WELCOME100"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm uppercase font-mono focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase mb-1">Type</label>
              <select
                value={formData.discountType}
                onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="FIXED_COINS">FIXED COINS</option>
                <option value="PERCENTAGE">PERCENTAGE</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase mb-1">Bonus Value</label>
              <input
                type="number"
                min="1"
                required
                value={formData.discountValue}
                onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) || 0 })}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase mb-1">Max Redemptions Limit (Optional)</label>
            <input
              type="number"
              min="1"
              value={formData.maxRedemptions ?? ""}
              onChange={(e) => setFormData({ ...formData, maxRedemptions: e.target.value ? parseInt(e.target.value) : null })}
              placeholder="Unlimited if empty"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase mb-1">Expiration Date (Optional)</label>
            <input
              type="date"
              value={formData.expiresAt ? formData.expiresAt.split("T")[0] : ""}
              onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="isActiveCheckPromo"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="h-4 w-4 rounded border-border"
            />
            <label htmlFor="isActiveCheckPromo" className="text-sm font-medium">Code Active & Redeemable</label>
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
              {loading ? "Saving..." : initialData ? "Update Code" : "Create Code"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
