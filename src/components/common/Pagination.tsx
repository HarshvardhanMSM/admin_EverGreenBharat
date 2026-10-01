"use client";

import React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  pageSize?: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  itemName?: string;
  disabled?: boolean;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize = 20,
  pageSizeOptions = [10, 20, 50, 100],
  onPageChange,
  onPageSizeChange,
  itemName = "items",
  disabled = false,
  className = "",
}: PaginationProps) {
  // Safe boundaries
  const validTotalPages = Math.max(1, totalPages || 1);
  const validCurrentPage = Math.min(Math.max(1, currentPage || 1), validTotalPages);

  // Compute item range for "Showing X-Y of Z"
  const startItem = totalItems && totalItems > 0 ? (validCurrentPage - 1) * pageSize + 1 : 0;
  const endItem = totalItems ? Math.min(validCurrentPage * pageSize, totalItems) : 0;

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxButtons = 5;

    if (validTotalPages <= maxButtons + 2) {
      for (let i = 1; i <= validTotalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      const start = Math.max(2, validCurrentPage - 1);
      const end = Math.min(validTotalPages - 1, validCurrentPage + 1);

      if (start > 2) {
        pages.push("...");
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < validTotalPages - 1) {
        pages.push("...");
      }

      pages.push(validTotalPages);
    }

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div
      className={`p-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-muted-foreground ${className}`}
    >
      {/* Left: Summary Count */}
      <div className="flex items-center gap-3">
        {totalItems !== undefined && totalItems > 0 ? (
          <span>
            Showing <strong className="text-foreground">{startItem}</strong>-
            <strong className="text-foreground">{endItem}</strong> of{" "}
            <strong className="text-foreground">{totalItems}</strong> {itemName}
          </span>
        ) : (
          <span>
            Page <strong className="text-foreground">{validCurrentPage}</strong> of{" "}
            <strong className="text-foreground">{validTotalPages}</strong>
          </span>
        )}

        {/* Rows per page selector */}
        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 ml-2 border-l border-border pl-3">
            <span className="text-xs">Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              disabled={disabled}
              className="px-2 py-1 rounded-lg border border-border bg-background text-foreground text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-1 sm:gap-1.5">
        {/* First Page */}
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={validCurrentPage <= 1 || disabled}
          className="p-1.5 sm:p-2 rounded-xl border border-border bg-background hover:bg-muted text-foreground transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
          title="First Page"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        {/* Previous Page */}
        <button
          type="button"
          onClick={() => onPageChange(validCurrentPage - 1)}
          disabled={validCurrentPage <= 1 || disabled}
          className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl border border-border bg-background hover:bg-muted text-foreground font-semibold text-xs transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Previous</span>
        </button>

        {/* Numeric Buttons */}
        <div className="flex items-center gap-1">
          {pages.map((p, idx) => {
            if (p === "...") {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-2 py-1 text-muted-foreground select-none"
                >
                  ...
                </span>
              );
            }

            const pageNum = Number(p);
            const isActive = pageNum === validCurrentPage;

            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => onPageChange(pageNum)}
                disabled={disabled}
                className={`min-w-8 h-8 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "border border-border bg-background hover:bg-muted text-foreground"
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Next Page */}
        <button
          type="button"
          onClick={() => onPageChange(validCurrentPage + 1)}
          disabled={validCurrentPage >= validTotalPages || disabled}
          className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl border border-border bg-background hover:bg-muted text-foreground font-semibold text-xs transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Last Page */}
        <button
          type="button"
          onClick={() => onPageChange(validTotalPages)}
          disabled={validCurrentPage >= validTotalPages || disabled}
          className="p-1.5 sm:p-2 rounded-xl border border-border bg-background hover:bg-muted text-foreground transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
          title="Last Page"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
