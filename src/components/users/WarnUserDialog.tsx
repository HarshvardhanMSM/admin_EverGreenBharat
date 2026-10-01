"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquareWarning, X } from "lucide-react";

interface WarnUserDialogProps {
  user: any;
  onClose: () => void;
  onConfirm: (userId: string, reason: string) => void;
}

export function WarnUserDialog({ user, onClose, onConfirm }: WarnUserDialogProps) {
  const [reason, setReason] = useState("Repeated violation of platform community standards");

  if (!user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-card text-card-foreground border border-amber-500/30 rounded-xl shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-amber-500">
            <MessageSquareWarning className="w-6 h-6" />
            <h3 className="text-lg font-bold">Issue Formal Warning</h3>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">
          You are issuing a formal warning to <strong className="text-foreground">@{user.username}</strong>.
          The warning is recorded in the user&apos;s moderation history and does not restrict account access.
        </p>

        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase">Warning Reason</label>
          <Input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="mt-1"
            placeholder="Specify reason"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            className="bg-amber-600 hover:bg-amber-700 text-white"
            onClick={() => onConfirm(user.id, reason)}
          >
            Confirm Warning
          </Button>
        </div>
      </div>
    </div>
  );
}
