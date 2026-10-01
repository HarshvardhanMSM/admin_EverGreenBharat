"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle, X } from "lucide-react";

interface SuspendUserDialogProps {
  user: any;
  onClose: () => void;
  onConfirm: (userId: string, reason: string, durationDays: number) => void;
}

export function SuspendUserDialog({ user, onClose, onConfirm }: SuspendUserDialogProps) {
  const [reason, setReason] = useState("Violation of platform community standards");
  const [durationDays, setDurationDays] = useState(7);

  if (!user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-card text-card-foreground border border-border rounded-xl shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-amber-500">
            <AlertTriangle className="w-6 h-6" />
            <h3 className="text-lg font-bold">Suspend User Account</h3>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">
          You are temporarily suspending <strong className="text-foreground">@{user.username}</strong>. The user will be unable to log in during the suspension period.
        </p>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase">Reason for Suspension</label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-1"
              placeholder="Specify violation reason"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase">Duration (Days)</label>
            <Input
              type="number"
              min={1}
              max={365}
              value={durationDays}
              onChange={(e) => setDurationDays(Number(e.target.value))}
              className="mt-1"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            className="bg-amber-600 hover:bg-amber-700 text-white"
            onClick={() => onConfirm(user.id, reason, durationDays)}
          >
            Confirm Suspension
          </Button>
        </div>
      </div>
    </div>
  );
}
