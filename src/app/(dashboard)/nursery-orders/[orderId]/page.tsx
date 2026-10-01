"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  RotateCcw,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  User,
  Phone,
  Mail,
  MapPin,
  Store,
  CreditCard,
  Printer,
  Copy,
  Check,
  ExternalLink,
  Calendar,
  DollarSign,
  Receipt,
  Sprout,
  XCircle,
  FileText,
} from "lucide-react";
import { nurseryService } from "@/services/api/nursery-service";
import { toast } from "@/components/ui/toast";
import { getMediaUrl } from "@/lib/utils";
import { PageContainer } from "@/components/common";

interface OrderItem {
  id: string;
  orderId: string;
  productId?: string;
  vendorProductId?: string;
  productName?: string;
  title?: string;
  name?: string;
  unitPrice?: number | string;
  price?: number | string;
  quantity?: number;
  totalPrice?: number | string;
  subtotal?: number | string;
  productImage?: string | null;
  image?: string | null;
  imageUrl?: string | null;
  specificationsSnapshot?: Record<string, any> | null;
  metadata?: Record<string, any> | null;
  product?: {
    id: string;
    name?: string;
    botanicalName?: string;
    commonName?: string;
    images?: string[];
    price?: number | string;
    masterProduct?: {
      id?: string;
      name?: string;
      botanicalName?: string;
      commonName?: string;
      images?: string[];
    };
  };
}

interface ShippingAddress {
  fullName?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  landmark?: string;
}

interface OrderDetail {
  id: string;
  orderNumber: string;
  userId: string;
  vendorId?: string;
  orderStatus: "placed" | "confirmed" | "processing" | "out_for_delivery" | "delivered" | "cancelled" | string;
  paymentStatus: "pending" | "success" | "failed" | "collected" | string;
  paymentMethod: string;
  subtotal: number | string;
  deliveryCharge?: number | string;
  deliveryFee?: number | string;
  tax?: number | string;
  discount?: number | string;
  total: number | string;
  shippingAddress?: ShippingAddress;
  deliveryOtpAttempts?: number;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
  user?: {
    id: string;
    displayName?: string;
    username?: string;
    email?: string;
    phone?: string;
    avatarUrl?: string;
  };
  vendor?: {
    id: string;
    storeName?: string;
    phone?: string;
    email?: string;
    address?: string;
    city?: string;
    state?: string;
  };
  payment?: {
    id: string;
    method: string;
    amount: number;
    status: string;
    gatewayOrderId?: string;
    gatewayPaymentId?: string;
    createdAt?: string;
  };
  statusHistory?: Array<{
    status: string;
    timestamp: string;
    note?: string;
    updatedBy?: string;
  }>;
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = Array.isArray(params?.orderId) ? params.orderId[0] : (params?.orderId as string);

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [resettingOtp, setResettingOtp] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);

  const fetchOrderDetail = useCallback(async () => {
    if (!orderId) return;
    try {
      setLoading(true);
      const res = await nurseryService.fetchOrderDetail(orderId);
      const data = res?.data || res;
      setOrder(data);
    } catch (err: any) {
      console.error("Failed to load order details", err);
      toast.error(err?.response?.data?.message || "Order not found or failed to load");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrderDetail();
  }, [fetchOrderDetail]);

  const handleResetOtp = async () => {
    if (!orderId) return;
    try {
      setResettingOtp(true);
      const res = await nurseryService.resetDeliveryOtp(orderId);
      toast.success(res?.message || "Delivery OTP regenerated & attempt counter unlocked successfully!");
      await fetchOrderDetail();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to reset delivery OTP");
    } finally {
      setResettingOtp(false);
    }
  };

  const handleCopyAddress = () => {
    if (!order?.shippingAddress) return;
    const a = order.shippingAddress;
    const text = [
      a.fullName,
      a.phone,
      a.addressLine1,
      a.addressLine2,
      `${a.city || ""}, ${a.state || ""} - ${a.postalCode || ""}`,
      a.country,
    ]
      .filter(Boolean)
      .join("\n");

    navigator.clipboard.writeText(text);
    setCopiedAddress(true);
    toast.success("Address copied to clipboard!");
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <PageContainer className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-24 bg-muted animate-pulse rounded-lg" />
        </div>
        <div className="h-28 bg-muted/60 animate-pulse rounded-2xl border border-border" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-64 bg-muted/60 animate-pulse rounded-2xl border border-border" />
            <div className="h-44 bg-muted/60 animate-pulse rounded-2xl border border-border" />
          </div>
          <div className="space-y-6">
            <div className="h-48 bg-muted/60 animate-pulse rounded-2xl border border-border" />
            <div className="h-48 bg-muted/60 animate-pulse rounded-2xl border border-border" />
          </div>
        </div>
      </PageContainer>
    );
  }

  if (!order) {
    return (
      <PageContainer className="p-6 max-w-4xl mx-auto text-center py-16 space-y-4">
        <Package className="w-12 h-12 text-muted-foreground mx-auto" />
        <h2 className="text-xl font-bold text-foreground">Order Not Found</h2>
        <p className="text-sm text-muted-foreground">
          The requested marketplace order ({orderId}) could not be retrieved.
        </p>
        <Link
          href="/nursery-orders"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-xs hover:bg-primary/90 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </Link>
      </PageContainer>
    );
  }

  const isDelivered = order.orderStatus === "delivered";
  const isOutForDelivery = order.orderStatus === "out_for_delivery";
  const isOtpLocked = (order.deliveryOtpAttempts || 0) >= 5;

  return (
    <PageContainer className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6 print:p-0 print:max-w-full">
      {/* ─── Breadcrumb & Navigation Bar ──────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5 print:hidden">
        <div className="flex items-center gap-3">
          <Link
            href="/nursery-orders"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border/70 bg-card hover:bg-accent text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Orders
          </Link>
          <span className="text-muted-foreground/60 text-sm">/</span>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
              <Package className="w-5 h-5 text-primary shrink-0" />
              {order.orderNumber}
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border/70 bg-card hover:bg-accent text-xs font-medium text-foreground transition-colors shadow-2xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-muted-foreground" />
            Print Receipt
          </button>

          {!isDelivered && (
            <button
              type="button"
              onClick={handleResetOtp}
              disabled={resettingOtp}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${resettingOtp ? "animate-spin" : ""}`} />
              {resettingOtp ? "Resetting..." : "Reset Delivery OTP"}
            </button>
          )}
        </div>
      </div>

      {/* ─── Top Highlights Banner ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {/* Order Status */}
        <div className="bg-card border border-border/70 rounded-2xl p-4 shadow-2xs space-y-1">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
            Fulfillment State
          </div>
          <div className="flex items-center gap-1.5 pt-0.5">
            <span
              className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full capitalize ${
                isDelivered
                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
                  : isOutForDelivery
                  ? "bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/30"
                  : order.orderStatus === "cancelled"
                  ? "bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30"
                  : "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30"
              }`}
            >
              {isDelivered && <CheckCircle2 className="w-3.5 h-3.5" />}
              {isOutForDelivery && <Truck className="w-3.5 h-3.5" />}
              {order.orderStatus === "cancelled" && <XCircle className="w-3.5 h-3.5" />}
              {order.orderStatus.replace(/_/g, " ")}
            </span>
          </div>
          <div className="text-[11px] text-muted-foreground">
            {order.deliveredAt ? `Delivered: ${new Date(order.deliveredAt).toLocaleDateString()}` : "In Progress"}
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-card border border-border/70 rounded-2xl p-4 shadow-2xs space-y-1">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5 text-muted-foreground" />
            Payment Status
          </div>
          <div className="flex items-center gap-1.5 pt-0.5">
            <span
              className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase ${
                order.paymentStatus === "success" || order.paymentStatus === "collected"
                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
                  : "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30"
              }`}
            >
              {order.paymentStatus}
            </span>
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              ({order.paymentMethod})
            </span>
          </div>
          <div className="text-[11px] font-bold text-foreground">
            Total: ₹{Number(order.total || 0).toFixed(2)}
          </div>
        </div>

        {/* OTP Security */}
        <div className="bg-card border border-border/70 rounded-2xl p-4 shadow-2xs space-y-1">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            Doorstep OTP
          </div>
          <div className="flex items-center gap-1.5 pt-0.5">
            <span
              className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${
                isDelivered
                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                  : isOtpLocked
                  ? "bg-rose-500/15 text-rose-700 dark:text-rose-400"
                  : "bg-blue-500/15 text-blue-700 dark:text-blue-400"
              }`}
            >
              {isDelivered ? "Verified ✅" : isOtpLocked ? "Locked 🔒" : "Pending Code"}
            </span>
          </div>
          <div className="text-[11px] text-muted-foreground">
            Attempts:{" "}
            <span className={isOtpLocked ? "text-rose-600 font-bold" : "font-semibold text-foreground"}>
              {order.deliveryOtpAttempts || 0} / 5
            </span>
          </div>
        </div>

        {/* Placed Date */}
        <div className="bg-card border border-border/70 rounded-2xl p-4 shadow-2xs space-y-1">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
            Order Timestamp
          </div>
          <div className="text-xs font-bold text-foreground pt-0.5">
            {order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }) : "N/A"}
          </div>
          <div className="text-[11px] text-muted-foreground">
            {order.createdAt ? new Date(order.createdAt).toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            }) : ""}
          </div>
        </div>
      </div>

      {/* ─── Two Column Layout ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Order Items & Verification Stepper (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card: Order Items List */}
          <div className="bg-card border border-border/70 rounded-2xl overflow-hidden shadow-2xs">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/60 bg-muted/20">
              <div className="flex items-center gap-2">
                <Sprout className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-foreground">
                  Purchased Botanical Plants & Nursery Goods
                </h3>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                {order.items?.length || 0} Item{order.items?.length === 1 ? "" : "s"}
              </span>
            </div>

            <div className="divide-y divide-border/60">
              {!order.items || order.items.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  No line items recorded for this order.
                </div>
              ) : (
                order.items.map((item, idx) => {
                  const itemName =
                    item.productName ||
                    item.title ||
                    item.name ||
                    item.product?.name ||
                    item.product?.commonName ||
                    item.product?.masterProduct?.name ||
                    item.product?.masterProduct?.commonName ||
                    "Live Botanical Plant";

                  const botanicalName =
                    item.product?.botanicalName ||
                    item.product?.masterProduct?.botanicalName ||
                    item.specificationsSnapshot?.botanicalName ||
                    item.metadata?.botanicalName ||
                    null;

                  const rawImg =
                    item.productImage ||
                    item.image ||
                    item.imageUrl ||
                    (Array.isArray(item.product?.images) && item.product.images.length > 0
                      ? item.product.images[0]
                      : null) ||
                    (Array.isArray(item.product?.masterProduct?.images) && item.product.masterProduct.images.length > 0
                      ? item.product.masterProduct.images[0]
                      : null) ||
                    null;

                  const qty = Math.max(1, Number(item.quantity) || 1);

                  const rawUnitPrice = item.unitPrice ?? item.price ?? item.product?.price;
                  const rawTotalPrice = item.totalPrice ?? item.subtotal;

                  const parsedUnitPrice =
                    rawUnitPrice !== undefined && rawUnitPrice !== null && !isNaN(Number(rawUnitPrice))
                      ? Number(rawUnitPrice)
                      : rawTotalPrice !== undefined && rawTotalPrice !== null && !isNaN(Number(rawTotalPrice))
                      ? Number(rawTotalPrice) / qty
                      : 0;

                  const parsedLineTotal =
                    rawTotalPrice !== undefined && rawTotalPrice !== null && !isNaN(Number(rawTotalPrice))
                      ? Number(rawTotalPrice)
                      : parsedUnitPrice * qty;

                  const specs = item.specificationsSnapshot || item.metadata || {};
                  const potSize = specs.potSize || specs.pot_size;
                  const plantHeight = specs.plantHeight || specs.height;

                  return (
                    <div
                      key={item.id || idx}
                      className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-muted/15 transition-colors"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        {/* Thumbnail */}
                        <div className="h-16 w-16 shrink-0 rounded-xl bg-emerald-500/5 border border-border/70 overflow-hidden flex items-center justify-center relative shadow-2xs">
                          {rawImg ? (
                            <img
                              src={getMediaUrl(rawImg)}
                              alt={itemName}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                (e.currentTarget as HTMLElement).style.display = "none";
                                const fallback = e.currentTarget.parentElement?.querySelector(".fallback-icon");
                                if (fallback) (fallback as HTMLElement).style.display = "flex";
                              }}
                            />
                          ) : null}
                          <div
                            className={`fallback-icon h-full w-full items-center justify-center bg-gradient-to-br from-emerald-500/10 to-teal-500/10 text-emerald-600 ${
                              rawImg ? "hidden" : "flex"
                            }`}
                          >
                            <Sprout className="w-7 h-7 text-emerald-600/80" />
                          </div>
                        </div>

                        {/* Title & Metadata */}
                        <div className="min-w-0 space-y-1">
                          <h4 className="text-sm font-bold text-foreground truncate">
                            {itemName}
                          </h4>
                          {botanicalName && (
                            <p className="text-xs italic text-muted-foreground truncate">
                              {botanicalName}
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground pt-0.5">
                            <span className="bg-muted px-2 py-0.5 rounded text-[11px] font-semibold text-foreground">
                              Qty: {qty}
                            </span>
                            <span>&times;</span>
                            <span className="font-semibold text-foreground">
                              ₹{parsedUnitPrice.toFixed(2)}
                            </span>
                            {potSize && (
                              <span className="text-[11px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-medium px-2 py-0.5 rounded-full border border-emerald-500/20">
                                Pot: {potSize}
                              </span>
                            )}
                            {plantHeight && (
                              <span className="text-[11px] bg-blue-500/10 text-blue-700 dark:text-blue-400 font-medium px-2 py-0.5 rounded-full border border-blue-500/20">
                                Height: {plantHeight}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Line Item Total */}
                      <div className="text-right shrink-0">
                        <span className="text-sm sm:text-base font-black text-foreground">
                          ₹{parsedLineTotal.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Financial Ledger Subtotal in Item Card */}
            <div className="p-4 bg-muted/20 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
              <span>Items Total (Exclusive of fees & taxes)</span>
              <span className="font-bold text-foreground text-sm">
                ₹{Number(order.subtotal || 0).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Card: Doorstep Delivery OTP Verification Security Module */}
          <div className="bg-card border border-border/70 rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4.5 h-4.5 text-primary" />
                <h3 className="text-sm font-bold text-foreground">
                  Doorstep Delivery OTP Verification Protocol
                </h3>
              </div>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  isDelivered
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                    : isOtpLocked
                    ? "bg-rose-500/15 text-rose-700 dark:text-rose-400"
                    : "bg-blue-500/15 text-blue-700 dark:text-blue-400"
                }`}
              >
                {isDelivered ? "Verified ✅" : isOtpLocked ? "Locked 🔒" : "Active Delivery"}
              </span>
            </div>

            {/* Security Explanation */}
            <p className="text-xs text-muted-foreground leading-relaxed">
              Every live plant and nursery order requires customer OTP authentication upon physical doorstep handover.
              The OTP is encrypted and securely sent directly to the customer. Delivery agents verify the code on site to prevent lost packages or fraudulent claims.
            </p>

            {/* Status Breakdown Box */}
            <div className="bg-muted/30 border border-border/60 rounded-xl p-4 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Handover Verification State:</span>
                <span className="font-bold text-foreground">
                  {isDelivered ? "Successfully Completed" : "Awaiting Physical Delivery Verification"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Delivery Partner Incorrect Attempt Count:</span>
                <span className={`font-bold ${isOtpLocked ? "text-rose-600" : "text-foreground"}`}>
                  {order.deliveryOtpAttempts || 0} / 5 attempts
                </span>
              </div>
              {order.deliveredAt && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Delivered & Verified Timestamp:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {new Date(order.deliveredAt).toLocaleString("en-IN")}
                  </span>
                </div>
              )}
            </div>

            {/* Alert if Locked */}
            {isOtpLocked && !isDelivered && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <div className="space-y-1">
                  <p className="font-bold">Delivery OTP Attempt Limit Exceeded</p>
                  <p className="text-[11px] leading-relaxed">
                    The delivery agent entered incorrect codes 5 times. The customer cannot be marked delivered until an administrator regenerates the delivery OTP.
                  </p>
                </div>
              </div>
            )}

            {/* Admin Utility Button */}
            {!isDelivered && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleResetOtp}
                  disabled={resettingOtp}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
                >
                  <RotateCcw className={`w-4 h-4 ${resettingOtp ? "animate-spin" : ""}`} />
                  {resettingOtp ? "Unlocking & Sending New Code..." : "Regenerate & Unlock Delivery OTP"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Customer, Address, Vendor, Price Breakdown (1 Col) */}
        <div className="space-y-6">
          {/* Card: Customer Details */}
          <div className="bg-card border border-border/70 rounded-2xl p-5 shadow-2xs space-y-3.5">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
              <User className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">Customer Profile</h3>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/15 text-primary font-bold flex items-center justify-center text-sm border border-primary/25 shrink-0">
                {order.user?.displayName?.charAt(0).toUpperCase() ||
                  order.shippingAddress?.fullName?.charAt(0).toUpperCase() ||
                  "C"}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-foreground truncate">
                  {order.shippingAddress?.fullName || order.user?.displayName || "Marketplace Guest"}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">
                  User ID: {order.userId?.slice(0, 12)}...
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-1 text-xs">
              {(order.user?.email || order.shippingAddress?.fullName) && (
                <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                  <Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <a href={`mailto:${order.user?.email || ""}`} className="truncate hover:underline">
                    {order.user?.email || "No email provided"}
                  </a>
                </div>
              )}
              {order.shippingAddress?.phone && (
                <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                  <Phone className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <a href={`tel:${order.shippingAddress.phone}`} className="font-semibold hover:underline">
                    {order.shippingAddress.phone}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Card: Shipping & Delivery Address */}
          <div className="bg-card border border-border/70 rounded-2xl p-5 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground">Delivery Destination</h3>
              </div>
              <button
                type="button"
                onClick={handleCopyAddress}
                className="text-[11px] text-primary hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                title="Copy Address"
              >
                {copiedAddress ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedAddress ? "Copied" : "Copy"}
              </button>
            </div>

            <div className="space-y-1.5 text-xs">
              <p className="font-bold text-foreground">
                {order.shippingAddress?.fullName || "Recipient"}
              </p>
              <p className="text-muted-foreground">
                {order.shippingAddress?.phone}
              </p>
              <p className="text-foreground leading-relaxed pt-1">
                {order.shippingAddress?.addressLine1}
                {order.shippingAddress?.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ""}
              </p>
              <p className="text-foreground font-medium">
                {order.shippingAddress?.city && `${order.shippingAddress.city}, `}
                {order.shippingAddress?.state && `${order.shippingAddress.state} `}
                {order.shippingAddress?.postalCode && `- ${order.shippingAddress.postalCode}`}
              </p>
              {order.shippingAddress?.country && (
                <p className="text-muted-foreground text-[11px]">
                  {order.shippingAddress.country}
                </p>
              )}
            </div>
          </div>

          {/* Card: Nursery Store Details */}
          <div className="bg-card border border-border/70 rounded-2xl p-5 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-foreground">Fulfilling Nursery Store</h3>
              </div>
              {order.vendorId && (
                <Link
                  href={`/nursery-vendors/${order.vendorId}`}
                  className="text-[11px] text-primary hover:underline font-semibold flex items-center gap-1"
                >
                  Store Profile
                  <ExternalLink className="w-3 h-3" />
                </Link>
              )}
            </div>

            <div className="space-y-1.5 text-xs">
              <p className="font-bold text-foreground text-sm">
                {order.vendor?.storeName || "Multi-Vendor Master Fulfillment"}
              </p>
              {order.vendor?.city && (
                <p className="text-muted-foreground">
                  Location: {order.vendor.city}{order.vendor.state ? `, ${order.vendor.state}` : ""}
                </p>
              )}
              {order.vendor?.phone && (
                <p className="text-muted-foreground">
                  Phone: <span className="font-semibold text-foreground">{order.vendor.phone}</span>
                </p>
              )}
            </div>
          </div>

          {/* Card: Payment & Pricing Ledger */}
          <div className="bg-card border border-border/70 rounded-2xl p-5 shadow-2xs space-y-3.5">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
              <Receipt className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">Billing Breakdown</h3>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Botanical Plants Subtotal</span>
                <span className="font-semibold text-foreground">
                  ₹{Number(order.subtotal || 0).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between text-muted-foreground">
                <span>Doorstep Delivery Fee</span>
                <span className="font-semibold text-foreground">
                  {Number(order.deliveryCharge ?? order.deliveryFee ?? 0) === 0
                    ? "FREE"
                    : `₹${Number(order.deliveryCharge ?? order.deliveryFee ?? 0).toFixed(2)}`}
                </span>
              </div>

              {Number(order.tax || 0) > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Applicable GST / Tax</span>
                  <span className="font-semibold text-foreground">
                    ₹{Number(order.tax || 0).toFixed(2)}
                  </span>
                </div>
              )}

              {Number(order.discount || 0) > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Promotional Coupon Discount</span>
                  <span className="font-bold">
                    -₹{Number(order.discount || 0).toFixed(2)}
                  </span>
                </div>
              )}

              <div className="border-t border-border/60 pt-2.5 flex justify-between items-center text-sm">
                <span className="font-black text-foreground">Grand Total</span>
                <span className="font-black text-emerald-700 dark:text-emerald-400 text-base">
                  ₹{Number(order.total || 0).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="p-3 bg-muted/30 rounded-xl border border-border/50 text-[11px] space-y-1 text-muted-foreground">
              <div className="flex justify-between">
                <span>Method:</span>
                <span className="font-bold text-foreground uppercase">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="font-bold text-foreground uppercase">{order.paymentStatus}</span>
              </div>
              {order.payment?.gatewayPaymentId && (
                <div className="flex justify-between truncate">
                  <span>Gateway ID:</span>
                  <span className="font-mono text-foreground truncate max-w-[140px]">
                    {order.payment.gatewayPaymentId}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
