"use client";

import React, { useState } from "react";
import { toast } from "@/components/ui/toast";
import { financeService } from "@/services/api/finance-service";

interface WalletFreezeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  walletId: string;
}

export const WalletFreezeModal: React.FC<WalletFreezeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  walletId,
}) => {
  const [freezeType, setFreezeType] = useState<"FULL" | "PARTIAL">("FULL");
  const [reason, setReason] = useState("ADMIN_DISPUTE");
  const [amount, setAmount] = useState<number>(0);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await financeService.freezeWallet(walletId, {
        freezeType,
        reason,
        amount: freezeType === "PARTIAL" ? amount : 0,
        notes,
      });
      toast.success("Wallet balance frozen successfully");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to freeze wallet");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-card rounded-2xl border shadow-xl p-6 text-foreground">
        <h3 className="text-lg font-bold">Freeze Wallet Balance</h3>
        <p className="text-xs font-mono text-muted-foreground mt-1">Wallet ID: {walletId}</p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase mb-1">Freeze Type</label>
            <select
              value={freezeType}
              onChange={(e) => setFreezeType(e.target.value as "FULL" | "PARTIAL")}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="FULL">FULL (Freeze entire available balance)</option>
              <option value="PARTIAL">PARTIAL (Freeze specific amount)</option>
            </select>
          </div>

          {freezeType === "PARTIAL" && (
            <div>
              <label className="block text-xs font-semibold uppercase mb-1">Amount to Freeze</label>
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
          )}

          <div>
            <label className="block text-xs font-semibold uppercase mb-1">Freeze Reason</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="ADMIN_DISPUTE">ADMIN DISPUTE</option>
              <option value="FRAUD_SUSPICION">FRAUD SUSPICION</option>
              <option value="CHARGEBACK_RISK">CHARGEBACK RISK</option>
              <option value="SECURITY_HOLD">SECURITY HOLD</option>
              <option value="COMPLIANCE_REVIEW">COMPLIANCE REVIEW</option>
              <option value="OTHER">OTHER</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase mb-1">Admin Notes</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Reasoning or notes..."
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
              disabled={loading}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? "Processing..." : "Freeze Wallet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
