"use client";

import React from "react";

export interface TransactionItem {
  id: string;
  referenceNumber: string;
  type: string;
  status: string;
  amount: number;
  feeAmount: number;
  netAmount: number;
  currency: string;
  senderWalletId?: string | null;
  receiverWalletId?: string | null;
  description?: string | null;
  createdAt: string;
}

interface TransactionTableProps {
  transactions: TransactionItem[];
  loading?: boolean;
  onViewDetails?: (tx: TransactionItem) => void;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  loading = false,
  onViewDetails,
}) => {
  const getStatusBadge = (status: string) => {
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
  };

  return (
    <div className="overflow-x-auto rounded-xl border bg-card">
      <table className="w-full text-left text-sm">
        <thead className="border-b bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
          <tr>
            <th className="px-4 py-3">Ref Number</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Gross Amount</th>
            <th className="px-4 py-3">Net Amount</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {loading ? (
            <tr>
              <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                Loading transactions...
              </td>
            </tr>
          ) : transactions.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                No financial transactions found.
              </td>
            </tr>
          ) : (
            transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3 font-mono text-xs font-medium text-foreground whitespace-nowrap">{tx.referenceNumber}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="font-medium text-foreground">{tx.type}</span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(tx.status)}`}>
                    {tx.status}
                  </span>
                </td>
                <td className="px-4 py-3 font-semibold text-foreground whitespace-nowrap">{tx.amount} {tx.currency}</td>
                <td className="px-4 py-3 font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">{tx.netAmount} {tx.currency}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(tx.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  {onViewDetails && (
                    <button
                      onClick={() => onViewDetails(tx)}
                      className="inline-flex items-center justify-center whitespace-nowrap px-3 py-1 text-xs font-medium rounded-lg border bg-background hover:bg-muted transition-colors"
                    >
                      Details
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
