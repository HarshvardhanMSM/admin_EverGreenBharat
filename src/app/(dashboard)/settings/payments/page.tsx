"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import {
  Coins,
  Percent,
  DollarSign,
  Loader2,
  Save,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import apiClient from "@/services/api/client";
import { useAuth } from "@/hooks/useAuth";

export default function SettingsPaymentsPage() {
  const { hasPermission } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Economy Form State
  const [coinsPerUsd, setCoinsPerUsd] = useState<number>(100);
  const [withdrawalCommissionRate, setWithdrawalCommissionRate] = useState<number>(30);
  const [minimumWithdrawalCoins, setMinimumWithdrawalCoins] = useState<number>(100);

  const canRead = hasPermission("finance:read") || hasPermission("finance:settings");
  const canEdit = hasPermission("finance:settings");

  // Load Economy Config from Backend
  useEffect(() => {
    async function fetchConfig() {
      try {
        setLoading(true);
        const res = await apiClient.get("/v1/admin/economy-config");
        const data = res?.data?.data || res?.data;
        if (data) {
          if (data.coinsPerUsd !== undefined) setCoinsPerUsd(Number(data.coinsPerUsd));
          if (data.withdrawalCommissionRate !== undefined)
            setWithdrawalCommissionRate(Number(data.withdrawalCommissionRate));
          if (data.minimumWithdrawalCoins !== undefined)
            setMinimumWithdrawalCoins(Number(data.minimumWithdrawalCoins));
        }
      } catch (err: any) {
        console.warn("Using default economy configuration", err);
      } finally {
        setLoading(false);
      }
    }

    fetchConfig();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) {
      (toast as any).error("Permission denied", { description: "You do not have permission to modify finance settings." });
      return;
    }

    if (coinsPerUsd < 1) {
      (toast as any).error("Validation Error", { description: "Coins per $1 USD must be at least 1." });
      return;
    }

    if (withdrawalCommissionRate < 0 || withdrawalCommissionRate > 100) {
      (toast as any).error("Validation Error", { description: "Commission rate must be between 0% and 100%." });
      return;
    }

    if (minimumWithdrawalCoins < 1) {
      (toast as any).error("Validation Error", { description: "Minimum withdrawal must be at least 1 coin." });
      return;
    }

    try {
      setSaving(true);
      const res = await apiClient.patch("/v1/admin/economy-config", {
        coinsPerUsd,
        withdrawalCommissionRate,
        minimumWithdrawalCoins,
      });

      const updated = res?.data?.data || res?.data;
      if (updated) {
        if (updated.coinsPerUsd !== undefined) setCoinsPerUsd(Number(updated.coinsPerUsd));
        if (updated.withdrawalCommissionRate !== undefined)
          setWithdrawalCommissionRate(Number(updated.withdrawalCommissionRate));
        if (updated.minimumWithdrawalCoins !== undefined)
          setMinimumWithdrawalCoins(Number(updated.minimumWithdrawalCoins));
      }

      (toast as any).success("Settings Saved", {
        description: "Platform economy configuration has been updated successfully.",
      });
    } catch (err: any) {
      (toast as any).error("Failed to update settings", {
        description: err?.response?.data?.message || err?.message || "Server error",
      });
    } finally {
      setSaving(false);
    }
  };

  const usdPerCoin = coinsPerUsd > 0 ? (1 / coinsPerUsd).toFixed(4) : "0.0100";
  const creatorPayoutPercent = Math.max(0, 100 - withdrawalCommissionRate).toFixed(1);
  const minWithdrawalUsd = (minimumWithdrawalCoins / (coinsPerUsd || 100)).toFixed(2);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-sm text-muted-foreground">Loading economy configuration...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Payment & Economy Settings</h1>
        <p className="text-sm text-muted-foreground">
          Centralized configuration for platform coin rates, creator withdrawal commissions, and payout thresholds.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Card 1: Coin Conversion Rate */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
              <Coins className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Coin Economy Rate</h2>
              <p className="text-xs text-muted-foreground">
                Defines the in-app coin conversion value relative to USD.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Coins per $1.00 USD
              </label>
              <Input
                type="number"
                min={1}
                max={100000}
                value={coinsPerUsd}
                onChange={(e) => setCoinsPerUsd(parseFloat(e.target.value) || 0)}
                disabled={!canEdit || saving}
                className="font-mono"
                required
              />
            </div>
            <div className="p-3 rounded-md bg-muted/40 text-xs text-muted-foreground space-y-1">
              <div className="flex items-center justify-between">
                <span>Equivalent Coin Value:</span>
                <span className="font-mono font-semibold text-foreground">
                  1 Coin = ${usdPerCoin} USD
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Example ($10.00 purchase):</span>
                <span className="font-mono font-semibold text-foreground">
                  {(10 * coinsPerUsd).toLocaleString()} Coins
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Card 2: Creator Withdrawal Commission */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
              <Percent className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Creator Withdrawal Commission</h2>
              <p className="text-xs text-muted-foreground">
                Platform fee percentage deducted when a creator withdraws earned coins.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Admin Commission Rate (%)
              </label>
              <div className="relative">
                <Input
                  type="number"
                  step="0.1"
                  min={0}
                  max={100}
                  value={withdrawalCommissionRate}
                  onChange={(e) => setWithdrawalCommissionRate(parseFloat(e.target.value) || 0)}
                  disabled={!canEdit || saving}
                  className="font-mono pr-8"
                  required
                />
                <span className="absolute right-3 top-2.5 text-xs text-muted-foreground font-mono">%</span>
              </div>
            </div>
            <div className="p-3 rounded-md bg-muted/40 text-xs text-muted-foreground space-y-1">
              <div className="flex items-center justify-between">
                <span>Platform Fee:</span>
                <span className="font-mono font-semibold text-rose-500">{withdrawalCommissionRate}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Creator Payout Share:</span>
                <span className="font-mono font-semibold text-emerald-500">{creatorPayoutPercent}%</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Card 3: Minimum Creator Withdrawal */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Minimum Withdrawal Threshold</h2>
              <p className="text-xs text-muted-foreground">
                Minimum coin balance a creator must request per payout withdrawal.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Minimum Request Size (Coins)
              </label>
              <Input
                type="number"
                min={1}
                value={minimumWithdrawalCoins}
                onChange={(e) => setMinimumWithdrawalCoins(parseFloat(e.target.value) || 0)}
                disabled={!canEdit || saving}
                className="font-mono"
                required
              />
            </div>
            <div className="p-3 rounded-md bg-muted/40 text-xs text-muted-foreground space-y-1">
              <div className="flex items-center justify-between">
                <span>Minimum USD Equivalent:</span>
                <span className="font-mono font-semibold text-foreground">
                  ${minWithdrawalUsd} USD
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Coins Threshold:</span>
                <span className="font-mono font-semibold text-foreground">
                  {minimumWithdrawalCoins.toLocaleString()} Coins
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Action Button */}
        {canEdit && (
          <div className="flex justify-end gap-3 pt-2">
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving Settings...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Economy Settings
                </>
              )}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
