"use client";

import { useState, useEffect } from "react";
import { nurseryService } from "@/services/api/nursery-service";
import {
  Sparkles,
  ShieldAlert,
  CheckCircle,
  XCircle,
  Flag,
  Trash2,
  Check,
  User,
} from "lucide-react";
import { toast } from "@/components/ui/toast";
import { Pagination } from "@/components/common";
import { extractPagination } from "@/utils/pagination";

export default function GreenArmyPage() {
  const [activeTab, setActiveTab] = useState<"influencers" | "reports">("influencers");
  const [influencers, setInfluencers] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Reset to page 1 on tab switch
  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeTab === "influencers") {
        const res = await nurseryService.fetchInfluencers({ page, limit: pageSize });
        const list = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.data)
          ? res.data.data
          : Array.isArray(res?.data?.items)
          ? res.data.items
          : Array.isArray(res)
          ? res
          : [];
        setInfluencers(list);

        const p = extractPagination(res, pageSize);
        setTotalPages(p.totalPages);
        setTotalItems(p.total);
      } else {
        const res = await nurseryService.fetchReportedContent({ page, limit: pageSize });
        const list = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.data)
          ? res.data.data
          : Array.isArray(res?.data?.items)
          ? res.data.items
          : Array.isArray(res)
          ? res
          : [];
        setReports(list);

        const p = extractPagination(res, pageSize);
        setTotalPages(p.totalPages);
        setTotalItems(p.total);
      }
    } catch (err) {
      console.error("Failed to load green army data", err);
      setInfluencers([]);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab, page, pageSize]);

  const handleApproval = async (id: string, status: "APPROVED" | "REJECTED") => {
    try {
      await nurseryService.updateInfluencerApproval(id, status);
      toast.success(`Green Army badge application ${status.toLowerCase()}!`);
      loadData();
    } catch (err: any) {
      toast.error("Failed to update influencer badge status");
    }
  };

  const handleResolveReport = async (id: string, action: "remove" | "dismiss") => {
    try {
      await nurseryService.resolveContentReport(id, action);
      toast.success(action === "remove" ? "Post removed from community feed" : "Report dismissed");
      loadData();
    } catch (err: any) {
      toast.error("Failed to resolve moderation report");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Green Army Community & Moderation
            </h1>
            <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              Influencers & Safety
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Review community gardening influencer applications, grant verified badges, and moderate reported posts.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-muted/60 p-1 rounded-lg border border-border">
          <button
            onClick={() => setActiveTab("influencers")}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === "influencers"
                ? "bg-background text-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Influencer Applications
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === "reports"
                ? "bg-background text-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Reported Content Queue
          </button>
        </div>
      </div>



      {/* Content */}
      {activeTab === "influencers" ? (
        <div className="border border-border/70 rounded-xl overflow-hidden bg-card shadow-2xs">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 text-muted-foreground border-b border-border/60 uppercase text-[11px] font-semibold tracking-wider">
              <tr>
                <th className="py-3 px-4">Gardener Profile</th>
                <th className="py-3 px-4">Bio & Gardening Focus</th>
                <th className="py-3 px-4 text-center">Followers</th>
                <th className="py-3 px-4">Badge Status</th>
                <th className="py-3 px-4 text-right">Review Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">
                    Loading applications...
                  </td>
                </tr>
              ) : !Array.isArray(influencers) || influencers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">
                    No influencer applications currently pending review.
                  </td>
                </tr>
              ) : (
                influencers.map((inf) => (
                  <tr key={inf.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-foreground flex items-center gap-2">
                        <User className="w-4 h-4 text-primary" />
                        {inf.user?.fullName || inf.user?.username || "Gardener"}
                      </div>
                      <div className="text-xs text-muted-foreground">{inf.user?.email}</div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-muted-foreground max-w-sm">
                      <p className="line-clamp-2 text-foreground font-medium mb-1">{inf.bio || "No bio provided"}</p>
                      <div className="flex flex-wrap gap-1">
                        {(inf.gardeningInterests || []).map((interest: string, idx: number) => (
                          <span key={idx} className="bg-muted px-1.5 py-0.5 rounded text-[10px]">
                            {interest}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-foreground">
                      {inf.followersCount || 0}
                    </td>
                    <td className="py-3.5 px-4">
                      {inf.approvalStatus === "APPROVED" ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          <Sparkles className="w-3 h-3" />
                          Verified Badge
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-xs font-medium text-amber-600 dark:text-amber-400">
                          Pending Admin Review
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {inf.approvalStatus !== "APPROVED" ? (
                        <div className="inline-flex gap-2">
                          <button
                            onClick={() => handleApproval(inf.id, "REJECTED")}
                            className="px-2.5 py-1 rounded text-xs text-red-600 hover:bg-red-500/10 font-medium"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleApproval(inf.id, "APPROVED")}
                            className="px-2.5 py-1 rounded text-xs bg-emerald-600 text-white hover:bg-emerald-700 font-medium"
                          >
                            Grant Badge
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Active Creator</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            itemName="influencers"
            disabled={loading}
          />
        </div>
      ) : (
        <div className="border border-border/70 rounded-xl overflow-hidden bg-card shadow-2xs">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 text-muted-foreground border-b border-border/60 uppercase text-[11px] font-semibold tracking-wider">
              <tr>
                <th className="py-3 px-4">Post & Caption</th>
                <th className="py-3 px-4">Influencer</th>
                <th className="py-3 px-4">Flagged Reason</th>
                <th className="py-3 px-4 text-right">Moderation Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-muted-foreground">
                    Loading reported media...
                  </td>
                </tr>
              ) : !Array.isArray(reports) || reports.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-muted-foreground">
                    No reported content in moderation queue.
                  </td>
                </tr>
              ) : (
                reports.map((rep) => (
                  <tr key={rep.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3.5 px-4 text-xs">
                      <p className="font-semibold text-foreground line-clamp-1">{rep.post?.caption || "No caption"}</p>
                      <span className="text-[11px] text-muted-foreground">Type: {rep.post?.type}</span>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-foreground">
                      {rep.post?.influencer?.user?.fullName || "Creator"}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-red-600 font-medium flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 shrink-0" />
                      {rep.reason}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex gap-2">
                        <button
                          onClick={() => handleResolveReport(rep.id, "dismiss")}
                          className="px-2.5 py-1 text-xs border border-border rounded hover:bg-muted font-medium"
                        >
                          Dismiss
                        </button>
                        <button
                          onClick={() => handleResolveReport(rep.id, "remove")}
                          className="px-2.5 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 font-medium flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          Remove Post
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            itemName="reports"
            disabled={loading}
          />
        </div>
      )}
    </div>
  );
}
