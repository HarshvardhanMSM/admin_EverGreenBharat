"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toast";
import { financeService } from "@/services/api/finance-service";
import { AlertTriangle, Loader2, RefreshCw, CheckCircle2, Clock } from "lucide-react";

interface LedgerEntry {
  id: string;
  walletId: string;
  entryType: string;
  balanceType: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  postedAt: string;
  description?: string | null;
}

interface WalletRef {
  id: string;
  userId?: string;
  availableBalance?: number;
  pendingBalance?: number;
  frozenBalance?: number;
  status?: string;
}

interface TransactionDetail {
  id: string;
  referenceNumber: string;
  idempotencyKey: string;
  type: string;
  status: string;
  amount: number;
  feeAmount: number;
  netAmount: number;
  currency: string;
  senderWalletId?: string | null;
  receiverWalletId?: string | null;
  metadata?: Record<string, any> | null;
  description?: string | null;
  failureReason?: string | null;
  createdAt: string;
  completedAt?: string | null;
  senderWallet?: WalletRef | null;
  receiverWallet?: WalletRef | null;
  ledgerEntries?: LedgerEntry[];
}

interface TransactionDetailModalProps {
  open: boolean;
  txId: string;
  onClose: () => void;
}

function statusBadgeClass(status: string) {
  switch (status) {
    case "COMPLETED":
      return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
    case "PENDING":
    case "PROCESSING":
      return "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30";
    case "FAILED":
    case "CANCELLED":
      return "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

function DetailItem({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="space-y-1">
      <span className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      {value !== null && value !== undefined && value !== "" ? (
        <span className={`text-sm text-foreground ${mono ? "font-mono text-xs" : "font-medium"}`}>{value}</span>
      ) : (
        <span className="text-sm text-muted-foreground">N/A</span>
      )}
    </div>
  );
}

function WalletPanel({ title, wallet, walletId }: { title: string; wallet?: WalletRef | null; walletId?: string | null }) {
  return (
    <div className="rounded-xl border bg-card p-4 space-y-2">
      <span className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</span>
      <p className="font-mono text-xs text-foreground break-all">{wallet?.id ?? walletId ?? "N/A"}</p>
      {wallet && (
        <div className="flex flex-wrap gap-2 text-xs">
          <Badge variant="outline">Available: {wallet.availableBalance ?? 0}</Badge>
          <Badge variant="outline">Pending: {wallet.pendingBalance ?? 0}</Badge>
          <Badge variant="outline">Frozen: {wallet.frozenBalance ?? 0}</Badge>
        </div>
      )}
      {wallet && <p className="text-xs text-muted-foreground">Status: {wallet.status ?? "N/A"}</p>}
    </div>
  );
}

export function TransactionDetailModal({ open, txId, onClose }: TransactionDetailModalProps) {
  const [detail, setDetail] = useState<TransactionDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!txId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await financeService.getTransactionDetail(txId);
      setDetail(data);
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || "Failed to load transaction details";
      setError(message);
      setDetail(null);
    } finally {
      setLoading(false);
    }
  }, [txId]);

  useEffect(() => {
    if (open && txId) {
      setDetail(null);
      fetchDetail();
    }
  }, [open, txId, fetchDetail]);

  const timeline = detail
    ? [
        { label: "Created", at: detail.createdAt, icon: Clock },
        ...(detail.completedAt ? [{ label: "Completed", at: detail.completedAt, icon: CheckCircle2 }] : []),
      ]
    : [];

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {detail ? (
              <span className="flex items-center gap-3">
                Transaction {detail.referenceNumber}
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${statusBadgeClass(detail.status)}`}>
                  {detail.status}
                </span>
              </span>
            ) : (
              "Transaction Details"
            )}
          </DialogTitle>
          <DialogDescription>Full audit trail for a single financial transaction.</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4 py-2">
            <Skeleton className="h-8 w-full" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
            <Skeleton className="h-32 w-full" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-4 py-10 text-center">
            <AlertTriangle className="h-8 w-8 text-red-500" />
            <p className="text-sm text-muted-foreground">{error}</p>
            <button
              onClick={fetchDetail}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border bg-card hover:bg-muted"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </button>
          </div>
        ) : detail ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <DetailItem label="Type" value={detail.type} />
              <DetailItem label="Gross Amount" value={`${detail.amount} ${detail.currency}`} />
              <DetailItem label="Fee" value={`${detail.feeAmount} ${detail.currency}`} />
              <DetailItem label="Net Amount" value={`${detail.netAmount} ${detail.currency}`} />
              <DetailItem label="Reference Number" value={detail.referenceNumber} mono />
              <DetailItem label="Idempotency Key" value={detail.idempotencyKey} mono />
              <DetailItem label="Created At" value={new Date(detail.createdAt).toLocaleString()} />
              <DetailItem label="Completed At" value={detail.completedAt ? new Date(detail.completedAt).toLocaleString() : null} />
              <DetailItem label="Description" value={detail.description} />
              <DetailItem label="Failure Reason" value={detail.failureReason} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <WalletPanel title="Sender Wallet" wallet={detail.senderWallet} walletId={detail.senderWalletId} />
              <WalletPanel title="Receiver Wallet" wallet={detail.receiverWallet} walletId={detail.receiverWalletId} />
            </div>

            <div className="rounded-xl border bg-card p-4 space-y-2">
              <span className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Timeline</span>
              {timeline.length === 0 ? (
                <p className="text-sm text-muted-foreground">No timeline entries recorded.</p>
              ) : (
                <ul className="space-y-2">
                  {timeline.map((step, index) => (
                    <li key={index} className="flex items-center gap-3 text-sm">
                      <step.icon className="h-4 w-4 text-primary shrink-0" />
                      <span className="font-medium text-foreground">{step.label}</span>
                      <span className="text-xs text-muted-foreground">{new Date(step.at).toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-xl border bg-card p-4 space-y-2">
              <span className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Metadata</span>
              {detail.metadata && Object.keys(detail.metadata).length > 0 ? (
                <pre className="overflow-x-auto rounded-lg bg-background p-3 text-xs font-mono text-foreground whitespace-pre-wrap break-words">
                  {JSON.stringify(detail.metadata, null, 2)}
                </pre>
              ) : (
                <p className="text-sm text-muted-foreground">No metadata recorded.</p>
              )}
            </div>

            <div className="rounded-xl border bg-card p-4 space-y-3">
              <span className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Ledger References ({detail.ledgerEntries?.length ?? 0})
              </span>
              {detail.ledgerEntries && detail.ledgerEntries.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <tr>
                        <th className="px-3 py-2">Posted At</th>
                        <th className="px-3 py-2">Entry Type</th>
                        <th className="px-3 py-2">Balance Type</th>
                        <th className="px-3 py-2">Amount</th>
                        <th className="px-3 py-2">Balance After</th>
                        <th className="px-3 py-2">Wallet</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {detail.ledgerEntries.map((entry) => (
                        <tr key={entry.id} className="hover:bg-muted/20">
                          <td className="px-3 py-2 text-xs text-muted-foreground">{new Date(entry.postedAt).toLocaleString()}</td>
                          <td className="px-3 py-2 font-medium text-foreground">{entry.entryType}</td>
                          <td className="px-3 py-2 text-xs text-muted-foreground">{entry.balanceType}</td>
                          <td className="px-3 py-2 font-semibold text-foreground">{entry.amount}</td>
                          <td className="px-3 py-2 font-medium">{entry.balanceAfter}</td>
                          <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{entry.walletId}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No ledger entries reference this transaction.</p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
