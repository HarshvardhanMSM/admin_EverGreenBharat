"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { nurseryService } from "@/services/api/nursery-service";
import { toast } from "@/components/ui/toast";
import {
  Store,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Check,
  X,
  Phone,
  Mail,
  MapPin,
  Package,
  ShieldCheck,
  RefreshCw,
  Sprout,
  Pencil,
} from "lucide-react";
import { Pagination } from "@/components/common";
import { extractPagination } from "@/utils/pagination";

export default function NurseryVendorsPage() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [approvalFilter, setApprovalFilter] = useState<string>("all");
  const [selectedVendor, setSelectedVendor] = useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalVendors, setTotalVendors] = useState(0);

  // Reset page when filter or search changes
  useEffect(() => {
    setPage(1);
  }, [search, approvalFilter]);

  const loadVendors = async () => {
    try {
      setLoading(true);
      const res = await nurseryService.fetchVendors({
        search: search || undefined,
        approvalStatus: approvalFilter !== "all" ? approvalFilter : undefined,
        page,
        limit: pageSize,
      });
      const list = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.data)
        ? res.data.data
        : Array.isArray(res?.data?.items)
        ? res.data.items
        : Array.isArray(res)
        ? res
        : [];
      setVendors(list);

      const p = extractPagination(res, pageSize);
      setTotalPages(p.totalPages);
      setTotalVendors(p.total);
    } catch (err) {
      console.error("Failed to load vendors", err);
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadVendors();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, approvalFilter, page, pageSize]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = vendors.length;
    const approved = vendors.filter((v) => v.approvalStatus === "APPROVED").length;
    const pending = vendors.filter((v) => v.approvalStatus === "PENDING").length;
    const rejected = vendors.filter((v) => v.approvalStatus === "REJECTED").length;
    const active = vendors.filter((v) => v.isActive).length;
    return { total, approved, pending, rejected, active };
  }, [vendors]);

  const handleApproval = async (status: "APPROVED" | "REJECTED") => {
    if (!selectedVendor) return;
    try {
      await nurseryService.updateVendorApproval(
        selectedVendor.id,
        status,
        status === "REJECTED" ? rejectionReason : undefined,
      );
      toast.success(`Vendor store successfully ${status.toLowerCase()}!`);
      setSelectedVendor(null);
      setRejectionReason("");
      loadVendors();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update vendor approval");
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      await nurseryService.toggleVendorActive(id);
      toast.success("Vendor online status updated!");
      loadVendors();
    } catch (err: any) {
      toast.error("Failed to toggle vendor active status");
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* ─── Modern Page Header ───────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-950/40 via-emerald-900/20 to-teal-950/30 border border-emerald-500/25 rounded-3xl p-6 sm:p-7 shadow-sm">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shadow-inner shrink-0">
              <Store className="w-7 h-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                  Nursery Vendors & Storefronts
                </h1>
                <span className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1.5">
                  <Sprout className="w-3.5 h-3.5" />
                  1 Vendor = 1 Store
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
                Supervise nursery onboardings, review KYC legal compliance, and directly manage live plant inventories with stock & price controls.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadVendors}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border border-border/80 bg-background/80 hover:bg-background text-foreground shadow-2xs transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh Data
            </button>
          </div>
        </div>
      </div>

      {/* ─── High-Contrast KPI Metrics Bar ──────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Stores */}
        <div className="bg-card border border-border/90 rounded-2xl p-4.5 shadow-2xs hover:shadow-md transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Total Stores
            </span>
            <div className="p-2 rounded-xl bg-muted/80 text-foreground">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-foreground mt-2.5 tracking-tight">
            {stats.total}
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {stats.active} stores currently online
          </div>
        </div>

        {/* Approved Stores */}
        <div className="bg-card border border-border/90 rounded-2xl p-4.5 shadow-2xs hover:shadow-md transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Active / Approved
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2.5 tracking-tight">
            {stats.approved}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Active certified marketplace sellers
          </div>
        </div>

        {/* Pending Verification */}
        <div className="bg-card border border-border/90 rounded-2xl p-4.5 shadow-2xs hover:shadow-md transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Pending KYC
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-600 dark:text-amber-400 mt-2.5 tracking-tight">
            {stats.pending}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Requires admin verification
          </div>
        </div>

        {/* Rejected Stores */}
        <div className="bg-card border border-border/90 rounded-2xl p-4.5 shadow-2xs hover:shadow-md transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Rejected
            </span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-rose-600 dark:text-rose-400 mt-2.5 tracking-tight">
            {stats.rejected}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Non-compliant or incomplete stores
          </div>
        </div>
      </div>

      {/* ─── Search & High-Visibility Filter Bar ────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card border border-border rounded-2xl p-3.5 shadow-2xs">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by store name, registered business, email, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 text-sm rounded-xl border border-border/80 bg-background/60 focus:bg-background focus:outline-hidden focus:ring-2 focus:ring-emerald-500/25 transition-all font-medium"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-md"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setApprovalFilter("all")}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl border transition-all shrink-0 cursor-pointer ${
              approvalFilter === "all"
                ? "bg-foreground text-background border-foreground shadow-xs"
                : "bg-muted/40 text-muted-foreground border-border hover:bg-muted"
            }`}
          >
            All Stores ({stats.total})
          </button>
          <button
            onClick={() => setApprovalFilter("PENDING")}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl border transition-all shrink-0 cursor-pointer ${
              approvalFilter === "PENDING"
                ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                : "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25 hover:bg-amber-500/20"
            }`}
          >
            Pending ({stats.pending})
          </button>
          <button
            onClick={() => setApprovalFilter("APPROVED")}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl border transition-all shrink-0 cursor-pointer ${
              approvalFilter === "APPROVED"
                ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25 hover:bg-emerald-500/20"
            }`}
          >
            Approved ({stats.approved})
          </button>
          <button
            onClick={() => setApprovalFilter("REJECTED")}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl border transition-all shrink-0 cursor-pointer ${
              approvalFilter === "REJECTED"
                ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                : "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/25 hover:bg-rose-500/20"
            }`}
          >
            Rejected ({stats.rejected})
          </button>
        </div>
      </div>

      {/* ─── Main Vendors Table ──────────────────────────────────────────────── */}
      <div className="border border-border rounded-2xl overflow-hidden bg-card shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-muted/70 text-foreground/80 border-b border-border uppercase text-[11px] font-extrabold tracking-wider">
              <tr>
                <th className="py-4 px-4 sm:px-5 min-w-[260px]">Nursery Storefront</th>
                <th className="py-4 px-4 min-w-[190px]">Contact Details</th>
                <th className="py-4 px-4 min-w-[190px]">Coverage & Hub</th>
                <th className="py-4 px-4 min-w-[130px] text-center">KYC Status</th>
                <th className="py-4 px-4 min-w-[100px] text-center">Store Online</th>
                <th className="py-4 px-4 sm:px-5 min-w-[240px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/70">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                      <span className="font-semibold text-foreground text-sm">Loading nursery store directories...</span>
                    </div>
                  </td>
                </tr>
              ) : !Array.isArray(vendors) || vendors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-muted-foreground">
                    <Store className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="font-bold text-base text-foreground">No nursery vendors found</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Try searching with another keyword or change your filter selection
                    </p>
                  </td>
                </tr>
              ) : (
                vendors.map((v) => (
                  <tr key={v.id} className="hover:bg-muted/30 transition-colors group">
                    {/* Store Column */}
                    <td className="py-4 px-4 sm:px-5 min-w-[260px]">
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-xs flex items-center justify-center font-black text-base shrink-0">
                          {v.storeName ? v.storeName.charAt(0).toUpperCase() : "N"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/nursery-vendors/${v.id}/edit`}
                            className="font-bold text-foreground text-sm hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer truncate block max-w-[220px]"
                            title={v.storeName}
                          >
                            {v.storeName}
                          </Link>
                          <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5 whitespace-nowrap">
                            <span className="font-medium text-foreground/80 truncate max-w-[130px]" title={v.businessName}>
                              {v.businessName}
                            </span>
                            <span className="shrink-0">•</span>
                            <span className="font-mono text-[11px] bg-muted/80 text-foreground/70 px-1.5 py-0.5 rounded border border-border/60 shrink-0">
                              {v.storeSlug}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Contact Column */}
                    <td className="py-4 px-4 min-w-[190px]">
                      <div className="space-y-1">
                        <div className="text-xs flex items-center gap-1.5 text-foreground font-semibold">
                          <Mail className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span className="truncate max-w-[170px]" title={v.supportEmail}>{v.supportEmail}</span>
                        </div>
                        <div className="text-xs flex items-center gap-1.5 text-muted-foreground font-medium whitespace-nowrap">
                          <Phone className="w-3.5 h-3.5 shrink-0" />
                          <span>{v.supportPhone || "N/A"}</span>
                        </div>
                      </div>
                    </td>

                    {/* Coverage Hub Column */}
                    <td className="py-4 px-4 min-w-[190px]">
                      <div>
                        <div className="text-xs font-bold text-foreground flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span className="truncate max-w-[160px] inline-block" title={`${v.address?.city || "City"}, ${v.address?.state || "State"}`}>
                            {v.address?.city || "City"}, {v.address?.state || "State"}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5 font-medium flex items-center gap-1.5 whitespace-nowrap">
                          <span className="text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20 text-[11px] shrink-0">
                            {Array.isArray(v.serviceablePincodes) ? v.serviceablePincodes.length : 0} pincodes
                          </span>
                          <span className="shrink-0">({v.coverageRadiusKm || 15} km radius)</span>
                        </div>
                      </div>
                    </td>

                    {/* KYC Status Badge */}
                    <td className="py-4 px-4 text-center min-w-[130px] whitespace-nowrap">
                      {v.approvalStatus === "APPROVED" && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 rounded-full">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Approved
                        </span>
                      )}
                      {v.approvalStatus === "PENDING" && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-500/15 border border-amber-500/30 px-3 py-1 rounded-full">
                          <Clock className="w-3.5 h-3.5" />
                          Pending Review
                        </span>
                      )}
                      {v.approvalStatus === "REJECTED" && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-500/15 border border-rose-500/30 px-3 py-1 rounded-full">
                          <XCircle className="w-3.5 h-3.5" />
                          Rejected
                        </span>
                      )}
                    </td>

                    {/* Online / Offline Toggle */}
                    <td className="py-4 px-4 text-center min-w-[100px] whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(v.id)}
                        className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-bold transition-all border shadow-2xs cursor-pointer ${
                          v.isActive
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25"
                            : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            v.isActive ? "bg-emerald-500 animate-ping" : "bg-muted-foreground"
                          }`}
                        />
                        {v.isActive ? "Online" : "Disabled"}
                      </button>
                    </td>

                    {/* Action Buttons: Unified, sleek, non-wrapping toolbar */}
                    <td className="py-4 px-4 sm:px-5 text-right min-w-[240px] whitespace-nowrap">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <Link
                          href={`/nursery-vendors/${v.id}/edit`}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-border bg-background hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:border-emerald-500/40 text-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-all shadow-2xs whitespace-nowrap cursor-pointer active:scale-95"
                          title="Edit complete vendor details"
                        >
                          <Pencil className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>Edit</span>
                        </Link>
                        <Link
                          href={`/nursery-vendors/${v.id}/inventory`}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-2xs hover:shadow-xs whitespace-nowrap cursor-pointer active:scale-95"
                          title="Manage plant catalog & inventory"
                        >
                          <Package className="w-3.5 h-3.5 text-white" />
                          <span>Inventory</span>
                        </Link>
                        <button
                          onClick={() => setSelectedVendor(v)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-foreground transition-all shadow-2xs whitespace-nowrap cursor-pointer active:scale-95"
                          title="Review vendor KYC documents"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>Review KYC</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalVendors}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          itemName="vendors"
          disabled={loading}
        />
      </div>

      {/* ─── High-Contrast KYC Review Modal ──────────────────────────────────── */}
      {selectedVendor && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border pb-3.5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-foreground">
                    KYC Review: {selectedVendor.storeName}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Verify legal business identity & storefront location
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedVendor(null)}
                className="text-muted-foreground hover:text-foreground p-1.5 rounded-xl hover:bg-muted cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-sm space-y-3 bg-muted/40 p-4.5 rounded-2xl border border-border/80">
              <div>
                <span className="text-[11px] text-muted-foreground uppercase font-extrabold tracking-wider block">
                  Registered Business Name
                </span>
                <span className="font-bold text-foreground text-sm">
                  {selectedVendor.businessName}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-muted-foreground uppercase font-extrabold tracking-wider block">
                  Store Description
                </span>
                <span className="text-muted-foreground text-xs leading-relaxed">
                  {selectedVendor.description || "No description provided"}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-muted-foreground uppercase font-extrabold tracking-wider block">
                  Physical Store Address
                </span>
                <span className="text-xs text-foreground font-semibold">
                  {selectedVendor.address?.street}, {selectedVendor.address?.city},{" "}
                  {selectedVendor.address?.state} - {selectedVendor.address?.postalCode}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground block">
                Rejection Reason / Feedback (Mandatory if rejecting)
              </label>
              <textarea
                rows={2}
                placeholder="State the reason if documents/store info is incomplete..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-background focus:ring-2 focus:ring-emerald-500/25 focus:outline-hidden font-medium"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
              <button
                onClick={() => handleApproval("REJECTED")}
                className="px-4 py-2.5 text-xs font-bold rounded-xl bg-rose-500/15 text-rose-700 dark:text-rose-300 hover:bg-rose-500/25 border border-rose-500/30 transition-colors cursor-pointer"
              >
                Reject Store
              </button>
              <button
                onClick={() => handleApproval("APPROVED")}
                className="px-5 py-2.5 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs transition-colors cursor-pointer"
              >
                Approve & Verify Store
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
