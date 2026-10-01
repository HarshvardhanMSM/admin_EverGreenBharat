"use client";

import { useState, useEffect } from "react";
import { nurseryService } from "@/services/api/nursery-service";
import { toast } from "@/components/ui/toast";
import Link from "next/link";
import {
  Package,
  Search,
  CheckCircle,
  Clock,
  Truck,
  RotateCcw,
  Check,
  X,
  ShieldAlert,
  Eye,
  ExternalLink,
} from "lucide-react";
import { Pagination } from "@/components/common";
import { extractPagination } from "@/utils/pagination";

export default function NurseryOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  // Pagination states
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  // Reset to page 1 on filter or search changes
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await nurseryService.fetchOrders({
        search: search || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
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
      setOrders(list);

      const p = extractPagination(res, pageSize);
      setTotalPages(p.totalPages);
      setTotalOrders(p.total);
    } catch (err) {
      console.error("Failed to load orders", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadOrders();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter, page, pageSize]);

  const handleResetOtp = async (orderId: string) => {
    try {
      const res = await nurseryService.resetDeliveryOtp(orderId);
      toast.success(res?.message || "Delivery OTP regenerated and unlocked successfully!");
      loadOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev: any) => ({ ...prev, deliveryOtpAttempts: 0 }));
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to reset delivery OTP");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Marketplace Orders & Fulfillment
            </h1>
            <span className="bg-primary/10 text-primary text-xs font-semibold px-2.5 py-0.5 rounded-full">
              Doorstep OTP Verified
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Global multi-vendor fulfillment orders with secure doorstep OTP completion and administrative unlocking.
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by order #, customer name, or nursery store..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-background focus:outline-hidden focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground"
        >
          <option value="all">All Order Statuses</option>
          <option value="placed">Placed</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="out_for_delivery">Out for Delivery</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="border border-border/70 rounded-xl overflow-hidden bg-card shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 text-muted-foreground border-b border-border/60 uppercase text-[11px] font-semibold tracking-wider">
              <tr>
                <th className="py-3 px-4 whitespace-nowrap">Order #</th>
                <th className="py-3 px-4 min-w-[180px]">Nursery Store</th>
                <th className="py-3 px-4 whitespace-nowrap">Total Amount</th>
                <th className="py-3 px-4 whitespace-nowrap">Payment</th>
                <th className="py-3 px-4 whitespace-nowrap">Delivery Status</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">OTP Attempts</th>
                <th className="py-3 px-4 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted-foreground">
                    Loading orders...
                  </td>
                </tr>
              ) : !Array.isArray(orders) || orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted-foreground">
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-foreground whitespace-nowrap">
                      <Link
                        href={`/nursery-orders/${o.id}`}
                        className="flex items-center gap-1.5 hover:text-primary transition-colors group cursor-pointer"
                      >
                        <Package className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                        <span className="hover:underline">{o.orderNumber}</span>
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground text-xs font-medium min-w-[180px]">
                      <span className="truncate block max-w-[200px]" title={o.vendor?.storeName || "Multi-Vendor Master"}>
                        {o.vendor?.storeName || "Multi-Vendor Master"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-foreground whitespace-nowrap">
                      ₹{Number(o.total).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="text-xs font-medium uppercase text-muted-foreground">
                        {o.paymentMethod}
                      </span>
                      <span className={`block text-[11px] font-semibold ${
                        o.paymentStatus === 'success' || o.paymentStatus === 'collected'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-amber-600 dark:text-amber-400'
                      }`}>
                        {o.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                        o.orderStatus === 'delivered'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : o.orderStatus === 'out_for_delivery'
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {o.orderStatus === 'delivered' && <CheckCircle className="w-3 h-3" />}
                        {o.orderStatus === 'out_for_delivery' && <Truck className="w-3 h-3" />}
                        {o.orderStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                        (o.deliveryOtpAttempts || 0) >= 5
                          ? "bg-red-500/10 text-red-600 font-bold"
                          : "text-muted-foreground"
                      }`}>
                        {o.deliveryOtpAttempts || 0} / 5
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/nursery-orders/${o.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border/70 bg-card hover:bg-primary hover:text-primary-foreground hover:border-primary text-xs font-semibold text-foreground transition-all shadow-2xs cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View Details
                        </Link>
                        <button
                          onClick={() => handleResetOtp(o.id)}
                          title="Reset & Unlock Delivery OTP"
                          className="p-1.5 rounded-lg border border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors shadow-2xs"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
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
          totalItems={totalOrders}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          itemName="orders"
          disabled={loading}
        />
      </div>

      {/* Order Detail Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-end">
          <div className="bg-card border-l border-border h-full max-w-md w-full p-6 space-y-5 shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  {selectedOrder.orderNumber}
                </h3>
                <span className="text-xs text-muted-foreground">Fulfillment Details</span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* OTP Verification Summary Banner */}
            <div className="bg-muted/40 p-4 rounded-xl border border-border/60 space-y-2">
              <div className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-primary" />
                Doorstep Delivery OTP Verification
              </div>
              <div className="text-xs text-foreground flex justify-between">
                <span>Verification State:</span>
                <span className="font-semibold">{selectedOrder.orderStatus === 'delivered' ? 'Verified ✅' : 'Pending Doorstep Code'}</span>
              </div>
              <div className="text-xs text-foreground flex justify-between">
                <span>Failed Attempt Counter:</span>
                <span className={`font-semibold ${selectedOrder.deliveryOtpAttempts >= 5 ? 'text-red-600' : ''}`}>
                  {selectedOrder.deliveryOtpAttempts || 0} attempts (Max 5)
                </span>
              </div>
              {selectedOrder.deliveredAt && (
                <div className="text-xs text-foreground flex justify-between">
                  <span>Delivered At:</span>
                  <span className="font-semibold text-emerald-600">
                    {new Date(selectedOrder.deliveredAt).toLocaleString()}
                  </span>
                </div>
              )}
              <div className="pt-2">
                <button
                  onClick={() => handleResetOtp(selectedOrder.id)}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Regenerate & Unlock Delivery OTP
                </button>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="space-y-1 text-sm bg-muted/20 p-3 rounded-lg">
              <div className="text-xs font-semibold text-muted-foreground uppercase">Delivery Address</div>
              <div className="font-medium text-foreground">{selectedOrder.shippingAddress?.fullName}</div>
              <div className="text-xs text-muted-foreground">{selectedOrder.shippingAddress?.phone}</div>
              <div className="text-xs text-foreground">
                {selectedOrder.shippingAddress?.addressLine1}, {selectedOrder.shippingAddress?.city},{" "}
                {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.postalCode}
              </div>
            </div>

            {/* Actions in Drawer */}
            <div className="pt-2">
              <Link
                href={`/nursery-orders/${selectedOrder.id}`}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs"
              >
                <Eye className="w-3.5 h-3.5" />
                Open Full Order Details Page
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
