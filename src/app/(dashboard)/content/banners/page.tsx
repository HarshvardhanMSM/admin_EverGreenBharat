"use client";

import { useEffect, useState } from "react";
import { homeContentService, BannerItem } from "@/services/api/home-content-service";
import { FilterDropdown } from "@/components/common/filters/FilterDropdown";
import { Pagination } from "@/components/common";
import { extractPagination } from "@/utils/pagination";
import { Plus, Edit2, Trash2, ExternalLink, Image as ImageIcon, Eye, MousePointer } from "lucide-react";
import { toast } from "@/components/ui/toast";

export default function ContentBannersPage() {
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Pagination states
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBanners, setTotalBanners] = useState(0);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerItem | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    imageUrl: "",
    targetType: "EXTERNAL_LINK" as BannerItem["targetType"],
    targetValue: "",
    sortOrder: 0,
    isActive: true,
  });

  // Delete State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Reset to page 1 on filter or search change
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await homeContentService.fetchBanners({
        search: search || undefined,
        isActiveOnly: statusFilter === "ACTIVE" ? true : undefined,
        page,
        limit: pageSize,
      });
      const list = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.data)
        ? res.data.data
        : Array.isArray(res)
        ? res
        : [];
      setBanners(list);

      const p = extractPagination(res, pageSize);
      setTotalPages(p.totalPages);
      setTotalBanners(p.total);
    } catch (err: any) {
      toast.add({ type: "error", description: err?.response?.data?.message || "Failed to fetch banners" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBanners();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter, page, pageSize]);

  const handleOpenCreate = () => {
    setEditingBanner(null);
    setFormData({
      title: "",
      imageUrl: "",
      targetType: "EXTERNAL_LINK",
      targetValue: "",
      sortOrder: banners.length + 1,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (banner: BannerItem) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      imageUrl: banner.imageUrl,
      targetType: banner.targetType,
      targetValue: banner.targetValue || "",
      sortOrder: banner.sortOrder,
      isActive: banner.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBanner) {
        await homeContentService.updateBanner(editingBanner.id, formData);
        toast.add({ type: "success", description: "Banner updated successfully." });
      } else {
        await homeContentService.createBanner(formData);
        toast.add({ type: "success", description: "Banner created successfully." });
      }
      setIsModalOpen(false);
      fetchBanners();
    } catch (err: any) {
      toast.add({ type: "error", description: err?.response?.data?.message || "Operation failed" });
    }
  };

  const handleToggleActive = async (banner: BannerItem) => {
    try {
      await homeContentService.updateBanner(banner.id, { isActive: !banner.isActive });
      toast.add({
        type: "success",
        description: `Banner ${!banner.isActive ? "activated" : "deactivated"}.`,
      });
      fetchBanners();
    } catch (err: any) {
      toast.add({ type: "error", description: "Failed to update banner status" });
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await homeContentService.deleteBanner(deletingId);
      toast.add({ type: "success", description: "Banner deleted successfully." });
      setDeletingId(null);
      fetchBanners();
    } catch (err: any) {
      toast.add({ type: "error", description: "Failed to delete banner" });
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Home Promotional Banners</h1>
          <p className="text-sm text-muted-foreground">
            Manage carousel banners and promotional creatives displayed on the mobile Home feed.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-md transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Banner
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-card p-4 rounded-lg border border-border shadow-sm">
        <input
          type="text"
          placeholder="Search banners by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-80 px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <FilterDropdown
          label="Status"
          value={statusFilter}
          onValueChange={setStatusFilter}
          options={[
            { label: "All Statuses", value: "ALL" },
            { label: "Active Only", value: "ACTIVE" },
          ]}
        />
      </div>

      {/* Banners Table */}
      <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-muted-foreground">Loading promotional banners...</div>
        ) : banners.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">No promotional banners found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-xs font-semibold text-muted-foreground border-b border-border uppercase">
                <tr>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Creative</th>
                  <th className="px-4 py-3">Title & Target</th>
                  <th className="px-4 py-3">Metrics</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {banners.map((b) => (
                  <tr key={b.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-muted-foreground">#{b.sortOrder}</td>
                    <td className="px-4 py-3">
                      <div className="w-24 h-12 rounded overflow-hidden border border-border bg-muted flex items-center justify-center">
                        {b.imageUrl ? (
                          <img src={b.imageUrl} alt={b.title} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-foreground">{b.title}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <span className="font-medium bg-muted px-1.5 py-0.5 rounded uppercase text-[10px]">
                          {b.targetType}
                        </span>
                        {b.targetValue && <span className="truncate max-w-[200px]">{b.targetValue}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {b.impressionCount}</span>
                        <span className="flex items-center gap-1"><MousePointer className="w-3.5 h-3.5" /> {b.clickCount}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleActive(b)}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-full border transition-colors ${
                          b.isActive
                            ? "bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20"
                            : "bg-gray-500/10 text-gray-500 border-gray-500/20 hover:bg-gray-500/20"
                        }`}
                      >
                        {b.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(b)}
                          className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
                          title="Edit Banner"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingId(b.id)}
                          className="p-1.5 text-red-500 hover:bg-red-500/10 rounded transition-colors"
                          title="Delete Banner"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalBanners}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          itemName="banners"
          disabled={loading}
        />
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card border border-border rounded-lg max-w-md w-full p-6 space-y-4 shadow-xl">
            <h2 className="text-lg font-semibold">{editingBanner ? "Edit Banner" : "New Promotional Banner"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1">Banner Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Summer Esports Tournament"
                  className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Image URL</label>
                <input
                  type="text"
                  required
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://cdn.example.com/banner.jpg"
                  className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1">Target Type</label>
                  <select
                    value={formData.targetType}
                    onChange={(e) => setFormData({ ...formData, targetType: e.target.value as any })}
                    className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="EXTERNAL_LINK">External Link</option>
                    <option value="CREATOR">Creator Profile</option>
                    <option value="STREAM">Live Stream</option>
                    <option value="CATEGORY">Category</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Sort Order</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Target Value / URL</label>
                <input
                  type="text"
                  value={formData.targetValue}
                  onChange={(e) => setFormData({ ...formData, targetValue: e.target.value })}
                  placeholder="https://... or UUID / Slug"
                  className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-input text-primary focus:ring-primary"
                />
                <label htmlFor="isActiveToggle" className="text-sm font-medium">Active Immediately</label>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm border border-input rounded-md hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-primary text-white font-medium rounded-md hover:bg-primary/90"
                >
                  {editingBanner ? "Save Changes" : "Create Banner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card border border-border rounded-lg max-w-sm w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-semibold text-foreground">Confirm Banner Deletion</h3>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete this promotional banner? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 text-sm border border-input rounded-md hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm bg-red-600 text-white font-medium rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
