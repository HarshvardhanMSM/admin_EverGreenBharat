"use client";

import React, { useState } from "react";
import { toast } from "@/components/ui/toast";
import { financeService } from "@/services/api/finance-service";

interface WalletAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  walletId: string;
}

export const WalletAdjustmentModal: React.FC<WalletAdjustmentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  walletId,
}) => {
  const [adjustmentType, setAdjustmentType] = useState<"CREDIT" | "DEBIT">("CREDIT");
  const [amount, setAmount] = useState<number>(100);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    setLoading(true);
    try {
      await financeService.adjustWallet(walletId, {
        adjustmentType,
        amount,
        reason,
      });
      toast.success(`Manual ${adjustmentType} adjustment executed successfully`);
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Adjustment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-card rounded-2xl border shadow-xl p-6 text-foreground">
        <h3 className="text-lg font-bold">Manual Wallet Adjustment</h3>
        <p className="text-xs font-mono text-muted-foreground mt-1">Wallet ID: {walletId}</p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase mb-1">Adjustment Action</label>
            <select
              value={adjustmentType}
              onChange={(e) => setAdjustmentType(e.target.value as "CREDIT" | "DEBIT")}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="CREDIT">CREDIT (Add coins to balance)</option>
              <option value="DEBIT">DEBIT (Deduct coins from balance)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase mb-1">Coins Amount</label>
            <input
              type="number"
              min="0.01"
              step="any"
              required
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase mb-1">Justification Reason</label>
            <input
              type="text"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Customer support compensation"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
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
              disabled={loading || !reason.trim()}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Processing..." : `Execute ${adjustmentType}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
