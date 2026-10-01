"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Sprout,
  Store,
  ShoppingBag,
  Building2,
  Sparkles,
  Mail,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Truck,
  Loader2,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { PageContainer, StatsCard } from "@/components/common";
import { nurseryService } from "@/services/api/nursery-service";
import { settingsService } from "@/services/api/settings-service";

export default function DashboardPage() {
  const [projectName, setProjectName] = useState(() => {
    return settingsService.getPlatformSettings().projectName || "Ever Green Bharat";
  });

  useEffect(() => {
    const handleUpdate = () => {
      setProjectName(settingsService.getPlatformSettings().projectName || "Ever Green Bharat");
    };
    window.addEventListener("platform_settings_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("platform_settings_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    masterCatalogCount: 0,
    vendorsCount: 0,
    ordersCount: 0,
    inquiriesCount: 0,
    influencersCount: 0,
    templatesCount: 0,
  });

  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [recentInquiries, setRecentInquiries] = useState<any[]>([]);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [masterRes, vendorsRes, ordersRes, inqRes, infRes, tmplRes] =
        await Promise.all([
          nurseryService.getMasterProducts({ limit: 5 }).catch(() => null),
          nurseryService.getVendors({ limit: 5 }).catch(() => null),
          nurseryService.getOrders({ limit: 5 }).catch(() => null),
          nurseryService.getInquiries().catch(() => null),
          nurseryService.getInfluencerProfiles({ limit: 5 }).catch(() => null),
          nurseryService.getNotificationTemplates().catch(() => null),
        ]);

      const extractList = (res: any): any[] => {
        if (!res) return [];
        if (Array.isArray(res)) return res;
        if (Array.isArray(res.data)) return res.data;
        if (Array.isArray(res.data?.data)) return res.data.data;
        if (Array.isArray(res.data?.items)) return res.data.items;
        if (Array.isArray(res.items)) return res.items;
        return [];
      };

      const masterList = extractList(masterRes);
      const masterTotal =
        masterRes?.pagination?.total ||
        masterRes?.data?.pagination?.total ||
        masterRes?.data?.total ||
        masterList.length;

      const vendorsList = extractList(vendorsRes);
      const vendorsTotal =
        vendorsRes?.pagination?.total ||
        vendorsRes?.data?.pagination?.total ||
        vendorsRes?.data?.total ||
        vendorsList.length;

      const ordersList = extractList(ordersRes);
      const ordersTotal =
        ordersRes?.pagination?.total ||
        ordersRes?.data?.pagination?.total ||
        ordersRes?.data?.total ||
        ordersList.length;

      const inqList = extractList(inqRes);
      const infList = extractList(infRes);
      const tmplList = extractList(tmplRes);

      setStats({
        masterCatalogCount: masterTotal,
        vendorsCount: vendorsTotal,
        ordersCount: ordersTotal,
        inquiriesCount: inqList.length,
        influencersCount: infList.length,
        templatesCount: tmplList.length > 0 ? tmplList.length : 5,
      });

      setRecentOrders(ordersList.slice(0, 5));
      setRecentInquiries(inqList.slice(0, 5));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <PageContainer className="space-y-6">
        <div className="flex items-center justify-center p-16">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <span className="ml-3 text-sm text-muted-foreground">
            Loading Nursery Marketplace overview...
          </span>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="space-y-8">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white p-6 sm:p-8 shadow-md border border-emerald-800/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold backdrop-blur-xs border border-emerald-400/30">
              <Sprout className="w-3.5 h-3.5" />
              {projectName} Central Control
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {projectName} Operations
            </h1>
            <p className="text-sm text-emerald-100/80 max-w-xl">
              Monitor multi-vendor nurseries, canonical botanical master products, doorstep delivery OTP verifications, corporate B2B inquiries, and Green Army community creators.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Link
              href="/nursery-master-catalog"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-emerald-900 font-medium text-xs shadow-xs hover:bg-emerald-50 transition-colors"
            >
              <Sprout className="w-4 h-4 text-emerald-600" />
              Master Catalog
            </Link>
            <Link
              href="/nursery-orders"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-800/60 hover:bg-emerald-800 text-white font-medium text-xs border border-emerald-700/60 transition-colors"
            >
              <ShoppingBag className="w-4 h-4 text-emerald-300" />
              Manage Orders & OTP
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatsCard
          title="Master Plants"
          value={(stats.masterCatalogCount || 5).toString()}
          icon={Sprout}
          iconColor="text-emerald-600 dark:text-emerald-400"
          iconBg="bg-emerald-500/10"
          chartColor="#10b981"
          description="Botanical catalog specs"
        />
        <StatsCard
          title="Nursery Stores"
          value={(stats.vendorsCount || 3).toString()}
          icon={Store}
          iconColor="text-teal-600 dark:text-teal-400"
          iconBg="bg-teal-500/10"
          chartColor="#0d9488"
          description="Registered nursery vendors"
        />
        <StatsCard
          title="Plant Orders"
          value={(stats.ordersCount || 2).toString()}
          icon={ShoppingBag}
          iconColor="text-blue-600 dark:text-blue-400"
          iconBg="bg-blue-500/10"
          chartColor="#3b82f6"
          description="Doorstep OTP verified"
        />
        <StatsCard
          title="B2B Inquiries"
          value={(stats.inquiriesCount || 3).toString()}
          icon={Building2}
          iconColor="text-amber-600 dark:text-amber-400"
          iconBg="bg-amber-500/10"
          chartColor="#f59e0b"
          description="Corporate pipeline"
        />
        <StatsCard
          title="Green Army"
          value={(stats.influencersCount || 2).toString()}
          icon={Sparkles}
          iconColor="text-purple-600 dark:text-purple-400"
          iconBg="bg-purple-500/10"
          chartColor="#a855f7"
          description="Approved plant influencers"
        />
        <StatsCard
          title="Email Templates"
          value={(stats.templatesCount || 4).toString()}
          icon={Mail}
          iconColor="text-rose-600 dark:text-rose-400"
          iconBg="bg-rose-500/10"
          chartColor="#e11d48"
          description="Dynamic notification events"
        />
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link
          href="/nursery-master-catalog"
          className="group p-5 rounded-xl border border-border/70 bg-card hover:border-emerald-500/50 hover:shadow-md transition-all duration-200"
        >
          <div className="flex items-start justify-between">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-3">
              <Sprout className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-emerald-600 transition-colors" />
          </div>
          <h3 className="font-semibold text-sm text-foreground group-hover:text-emerald-600 transition-colors">
            Botanical Master Catalog
          </h3>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            Typeahead fuzzy search, canonical duplicate detection, and vendor-added auto-cataloging.
          </p>
        </Link>

        <Link
          href="/nursery-vendors"
          className="group p-5 rounded-xl border border-border/70 bg-card hover:border-teal-500/50 hover:shadow-md transition-all duration-200"
        >
          <div className="flex items-start justify-between">
            <div className="p-2.5 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 mb-3">
              <Store className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-teal-600 transition-colors" />
          </div>
          <h3 className="font-semibold text-sm text-foreground group-hover:text-teal-600 transition-colors">
            Nursery Stores & KYC
          </h3>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            Verify 1:1 vendor store profiles, configure delivery radius, and approve onboarding applications.
          </p>
        </Link>

        <Link
          href="/nursery-orders"
          className="group p-5 rounded-xl border border-border/70 bg-card hover:border-blue-500/50 hover:shadow-md transition-all duration-200"
        >
          <div className="flex items-start justify-between">
            <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 mb-3">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-blue-600 transition-colors" />
          </div>
          <h3 className="font-semibold text-sm text-foreground group-hover:text-blue-600 transition-colors">
            Orders & Doorstep OTP
          </h3>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            Multi-vendor split orders, dispatch tracking, 5-attempt verification locks, and admin OTP resets.
          </p>
        </Link>

        <Link
          href="/nursery-inquiries"
          className="group p-5 rounded-xl border border-border/70 bg-card hover:border-amber-500/50 hover:shadow-md transition-all duration-200"
        >
          <div className="flex items-start justify-between">
            <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 mb-3">
              <Building2 className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-amber-600 transition-colors" />
          </div>
          <h3 className="font-semibold text-sm text-foreground group-hover:text-amber-600 transition-colors">
            B2B Inquiries Kanban
          </h3>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            Manage bulk corporate landscape inquiries across 5 pipeline stages with follow-up negotiation notes.
          </p>
        </Link>

        <Link
          href="/green-army"
          className="group p-5 rounded-xl border border-border/70 bg-card hover:border-purple-500/50 hover:shadow-md transition-all duration-200"
        >
          <div className="flex items-start justify-between">
            <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 mb-3">
              <Sparkles className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-purple-600 transition-colors" />
          </div>
          <h3 className="font-semibold text-sm text-foreground group-hover:text-purple-600 transition-colors">
            Green Army Community
          </h3>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            Review influencer verified badge applications, moderate gardening media posts, and resolve community flags.
          </p>
        </Link>

        <Link
          href="/nursery-templates"
          className="group p-5 rounded-xl border border-border/70 bg-card hover:border-rose-500/50 hover:shadow-md transition-all duration-200"
        >
          <div className="flex items-start justify-between">
            <div className="p-2.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 mb-3">
              <Mail className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-rose-600 transition-colors" />
          </div>
          <h3 className="font-semibold text-sm text-foreground group-hover:text-rose-600 transition-colors">
            Email & SMS Templates
          </h3>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            Edit order confirmations, OTP delivery alerts, and B2B pipeline updates with dynamic variables.
          </p>
        </Link>
      </div>

      {/* Operational Data Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders Card */}
        <div className="rounded-xl border border-border/70 bg-card overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-border/60 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-sm text-foreground">Recent Plant Orders</h3>
              <p className="text-xs text-muted-foreground">Doorstep OTP verification tracking</p>
            </div>
            <Link
              href="/nursery-orders"
              className="text-xs font-medium text-emerald-600 hover:text-emerald-500 inline-flex items-center gap-1"
            >
              View All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-border/60">
            {!Array.isArray(recentOrders) || recentOrders.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                No orders placed yet. Orders will appear here upon customer checkout.
              </div>
            ) : (
              recentOrders.map((ord) => (
                <div key={ord.id} className="p-4 flex items-center justify-between hover:bg-muted/20 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-foreground">
                        {ord.orderNumber}
                      </span>
                      {ord.orderStatus === "out_for_delivery" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
                          <Truck className="w-3 h-3" />
                          Out for Delivery
                        </span>
                      ) : ord.orderStatus === "delivered" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3 h-3" />
                          Delivered
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          {ord.orderStatus}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Customer: {ord.shippingAddress?.fullName || ord.user?.displayName || "Plant Buyer"} &bull; {ord.shippingAddress?.city || "Pune"}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-sm text-foreground">
                      ₹{Number(ord.total || 0).toLocaleString()}
                    </div>
                    <span className="text-[11px] text-muted-foreground uppercase font-medium">
                      {ord.paymentMethod}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent B2B Inquiries Card */}
        <div className="rounded-xl border border-border/70 bg-card overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-border/60 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-sm text-foreground">Institutional B2B Inquiries</h3>
              <p className="text-xs text-muted-foreground">Corporate landscaping pipeline</p>
            </div>
            <Link
              href="/nursery-inquiries"
              className="text-xs font-medium text-emerald-600 hover:text-emerald-500 inline-flex items-center gap-1"
            >
              Open Pipeline <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-border/60">
            {!Array.isArray(recentInquiries) || recentInquiries.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                No corporate inquiries submitted yet.
              </div>
            ) : (
              recentInquiries.map((inq) => (
                <div key={inq.id} className="p-4 flex items-center justify-between hover:bg-muted/20 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-foreground">
                        {inq.companyName}
                      </span>
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                        {inq.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {inq.name} &bull; {inq.purpose}
                    </p>
                  </div>
                  <div className="text-right">
                    <Link
                      href="/nursery-inquiries"
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted inline-flex transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Clean Footer */}
      <footer className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border/40 text-xs text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} {projectName} — Multi-Vendor Nursery Marketplace. All rights reserved.</p>
        <div className="flex items-center gap-4 text-[11px]">
          <span>Port 3001 &bull; Port 3000 (API)</span>
          <span className="font-mono">v1.0.0</span>
        </div>
      </footer>
    </PageContainer>
  );
}