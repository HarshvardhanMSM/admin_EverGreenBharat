"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { nurseryService } from "@/services/api/nursery-service";
import {
  categoryService,
  CategoryItem,
  CategoryAttributeItem,
} from "@/services/api/category-service";
import { toast } from "@/components/ui/toast";
import {
  Sparkles,
  Search,
  Plus,
  ArrowRightLeft,
  CheckCircle,
  Clock,
  Layers,
  Sprout,
  Check,
  X,
  Languages,
  Pencil,
  Save,
  Globe,
  Tag,
  FolderTree,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { PlantImageUploader } from "@/components/common/PlantImageUploader";
import { Pagination } from "@/components/common";
import { extractPagination, resolveImageUrl } from "@/utils";

export default function MasterCatalogPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [langFilter, setLangFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedCanonical, setSelectedCanonical] = useState<string>("");
  const [selectedDuplicate, setSelectedDuplicate] = useState<string>("");
  const [showMergeModal, setShowMergeModal] = useState(false);

  // Categories
  const [categories, setCategories] = useState<CategoryItem[]>([]);

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Fetch categories on mount
  useEffect(() => {
    categoryService
      .fetchCategories({ parentOnly: true, limit: 100 })
      .then((res) => {
        const list: CategoryItem[] = Array.isArray(res?.data?.data)
          ? res.data.data
          : Array.isArray(res?.data)
          ? res.data
          : [];
        setCategories(list);
      })
      .catch(console.error);
  }, []);



  const loadCatalog = async () => {
    try {
      setLoading(true);
      const res = await nurseryService.fetchMasterProducts({
        q: search || undefined,
        source: sourceFilter !== "all" ? sourceFilter : undefined,
        categoryId: categoryFilter !== "all" ? categoryFilter : undefined,
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
      setItems(list);

      const p = extractPagination(res, pageSize);
      setTotalPages(p.totalPages);
      setTotalItems(p.total);
    } catch (err) {
      console.error("Failed to load catalog", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadCatalog();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, sourceFilter, categoryFilter, page, pageSize]);







  const handleMerge = async () => {
    if (!selectedCanonical || !selectedDuplicate) {
      toast.warning("Please select both a canonical entry and a duplicate entry to merge");
      return;
    }
    try {
      const res = await nurseryService.mergeMasterProducts(
        selectedCanonical,
        selectedDuplicate,
      );
      setShowMergeModal(false);
      setSelectedCanonical("");
      setSelectedDuplicate("");
      toast.success(res?.message || "Entries merged successfully!");
      loadCatalog();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to merge entries");
    }
  };

  // Filter items by language availability if selected
  const filteredItems = items.filter((item) => {
    if (langFilter === "has_hindi") {
      return Boolean(item.translations?.hi?.name);
    }
    if (langFilter === "needs_hindi") {
      return !item.translations?.hi?.name;
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 animate-in fade-in duration-300">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/10 border border-emerald-500/20 text-emerald-600 flex items-center justify-center font-bold">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
                Master Plant Catalog
                <span className="text-xs bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                  Bilingual (EN + HI)
                </span>
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Admin-controlled canonical plant database with botanical care specs, multi-language names, and auto-catalog deduplication.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowMergeModal(true)}
            className="inline-flex items-center gap-2 text-xs font-bold px-3.5 py-2 rounded-xl border border-border bg-card hover:bg-muted text-foreground transition-colors cursor-pointer shadow-xs"
          >
            <ArrowRightLeft className="w-4 h-4 text-emerald-600" />
            Merge Duplicates
          </button>
          <Link
            href="/nursery-master-catalog/new"
            className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Add Master Plant (EN / HI)
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-card border border-border rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search in English or Hindi (e.g. Snake Plant, मनी प्लांट)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-border bg-background focus:ring-2 focus:ring-emerald-500/25 focus:outline-hidden"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Language Translation Filter */}
          <div className="flex items-center gap-1.5 text-xs bg-muted/60 p-1 rounded-xl border border-border">
            <Languages className="w-3.5 h-3.5 text-muted-foreground ml-1.5" />
            <button
              onClick={() => setLangFilter("all")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                langFilter === "all"
                  ? "bg-foreground text-background shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All Plants ({items.length})
            </button>
            <button
              onClick={() => setLangFilter("has_hindi")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                langFilter === "has_hindi"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10"
              }`}
            >
              🇮🇳 Has Hindi ({items.filter((i) => i.translations?.hi?.name).length})
            </button>
            <button
              onClick={() => setLangFilter("needs_hindi")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                langFilter === "needs_hindi"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "text-amber-700 dark:text-amber-400 hover:bg-amber-500/10"
              }`}
            >
              Needs Hindi ({items.filter((i) => !i.translations?.hi?.name).length})
            </button>
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-border bg-background font-medium focus:outline-hidden"
          >
            <option value="all">Category: All</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Source Filter */}
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-border bg-background font-medium focus:outline-hidden"
          >
            <option value="all">Source: All</option>
            <option value="admin">Admin Curated</option>
            <option value="vendor-added">Vendor Submitted</option>
          </select>
        </div>
      </div>

      {/* Master Catalog Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 min-w-[220px]">Plant Name (EN & HI)</th>
                <th className="py-3 px-4 min-w-[150px]">Scientific Name</th>
                <th className="py-3 px-4 min-w-[160px]">Care & Specs</th>
                <th className="py-3 px-4 min-w-[130px]">Catalog Source</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Nursery Usage</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Status</th>
                <th className="py-3 px-4 text-right whitespace-nowrap min-w-[210px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                      <span>Loading Master Plant Catalog...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-muted-foreground">
                    No plants found matching the selected filters.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-muted overflow-hidden shrink-0 flex items-center justify-center border border-border/80 relative">
                          {item.referenceImages?.[0] ? (
                            <>
                              <img
                                src={resolveImageUrl(item.referenceImages[0])}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.currentTarget;
                                  target.style.display = "none";
                                  const fallback = target.nextElementSibling as HTMLElement;
                                  if (fallback) fallback.style.display = "flex";
                                }}
                              />
                              <div className="hidden w-full h-full items-center justify-center bg-muted">
                                <Sprout className="w-5 h-5 text-emerald-600/50" />
                              </div>
                            </>
                          ) : (
                            <Sprout className="w-5 h-5 text-emerald-600/50" />
                          )}
                        </div>
                        <div>
                          <Link
                            href={`/nursery-master-catalog/${item.id}/edit`}
                            className="font-bold text-foreground text-sm flex items-center gap-1.5 hover:text-emerald-600 transition-colors"
                          >
                            {item.name}
                          </Link>
                          {item.translations?.hi?.name ? (
                            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-0.5 flex items-center gap-1">
                              <span>🇮🇳</span>
                              <span>{item.translations.hi.name}</span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 inline-flex items-center gap-1 mt-1">
                              <Languages className="w-2.5 h-2.5" /> No Hindi translation
                            </span>
                          )}
                          <div className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                            <FolderTree className="w-3 h-3 text-emerald-600/70 shrink-0" />
                            <span>{item.category?.name || item.suggestedCategory || "Plants"}</span>
                            {item.subcategory?.name && (
                              <>
                                <span className="opacity-40">›</span>
                                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                  {item.subcategory.name}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {item.scientificName ? (
                        <div className="italic font-mono text-muted-foreground text-xs">
                          {item.scientificName}
                        </div>
                      ) : (
                        <span className="text-muted-foreground/60">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 text-[11px]">
                        {item.specifications?.careLevel && (
                          <span className="bg-muted px-2 py-0.5 rounded text-muted-foreground font-medium">
                            Care: {item.specifications.careLevel}
                          </span>
                        )}
                        {item.specifications?.sunlight && (
                          <span className="bg-muted px-2 py-0.5 rounded text-muted-foreground font-medium">
                            {item.specifications.sunlight}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {item.source === "admin" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
                          <Sparkles className="w-3 h-3" />
                          Admin Curated
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                          <Clock className="w-3 h-3" />
                          Vendor Added
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-foreground">
                      <span className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-500/20">
                        {item.usageCount || 0} stores
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle className="w-3.5 h-3.5 mr-1" />
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap min-w-[210px]">
                      <div className="inline-flex items-center justify-end gap-2">
                        <Link
                          href={`/nursery-master-catalog/${item.id}/edit`}
                          className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground font-bold border border-border cursor-pointer transition-colors whitespace-nowrap"
                        >
                          <Pencil className="w-3 h-3" /> Edit / Hindi
                        </Link>
                        <button
                          onClick={() => {
                            setSelectedCanonical(item.id);
                            setShowMergeModal(true);
                          }}
                          className="text-xs text-primary hover:underline font-bold whitespace-nowrap cursor-pointer"
                        >
                          Merge Target
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
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          itemName="plants"
          disabled={loading}
        />
      </div>





      {/* ─── MERGE DUPLICATES MODAL ────────────────────────────────────────────── */}
      {showMergeModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-black text-foreground flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-emerald-600" />
                Merge Duplicate Entries
              </h3>
              <button
                onClick={() => setShowMergeModal(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              When vendors submit custom products, slight variations in spelling or language can occur. Merging rewires all linked vendor products to the canonical entry and deactivates the duplicate.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  Canonical (Keep this entry)
                </label>
                <select
                  value={selectedCanonical}
                  onChange={(e) => setSelectedCanonical(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background font-medium focus:outline-hidden"
                >
                  <option value="">Select target entry...</option>
                  {items.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name} {i.translations?.hi?.name ? `(${i.translations.hi.name})` : ""} — uses: {i.usageCount || 0}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  Duplicate (Merge & Deactivate this entry)
                </label>
                <select
                  value={selectedDuplicate}
                  onChange={(e) => setSelectedDuplicate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background font-medium focus:outline-hidden"
                >
                  <option value="">Select duplicate entry to absorb...</option>
                  {items
                    .filter((i) => i.id !== selectedCanonical)
                    .map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.name} {i.translations?.hi?.name ? `(${i.translations.hi.name})` : ""} — uses: {i.usageCount || 0}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <button
                onClick={() => setShowMergeModal(false)}
                className="px-4 py-2 text-xs font-bold rounded-xl border border-border hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={handleMerge}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
              >
                Confirm Merge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
