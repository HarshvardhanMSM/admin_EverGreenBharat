"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldAlert, X } from "lucide-react";

interface BanUserDialogProps {
  user: any;
  onClose: () => void;
  onConfirm: (userId: string, reason: string) => void;
}

export function BanUserDialog({ user, onClose, onConfirm }: BanUserDialogProps) {
  const [reason, setReason] = useState("Severe abuse and terms of service violation");

  if (!user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-card text-card-foreground border border-rose-500/30 rounded-xl shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-rose-500">
            <ShieldAlert className="w-6 h-6" />
            <h3 className="text-lg font-bold">Permanently Ban User</h3>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">
          Warning: Permanently banning <strong className="text-foreground">@{user.username}</strong> will terminate all active sessions and block the account from platform access.
        </p>

        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase">Reason for Permanent Ban</label>
          <Input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="mt-1"
            placeholder="Specify reason"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" onClick={() => onConfirm(user.id, reason)}>
            Confirm Permanent Ban
          </Button>
        </div>
      </div>
    </div>
  );
}
