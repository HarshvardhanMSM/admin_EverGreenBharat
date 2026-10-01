"use client";

import { useState, useEffect, useMemo, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { nurseryService } from "@/services/api/nursery-service";
import {
  categoryService,
  CategoryItem,
  CategoryAttributeItem,
} from "@/services/api/category-service";
import { toast } from "@/components/ui/toast";
import {
  Package,
  Plus,
  Search,
  ArrowLeft,
  X,
  Check,
  Tag,
  Pencil,
  Trash2,
  Sprout,
  Store,
  MapPin,
  Mail,
  Phone,
  ShieldCheck,
  Clock,
  XCircle,
  TrendingUp,
  Boxes,
  AlertTriangle,
  Languages,
  Save,
  ExternalLink,
  Sparkles,
  FolderTree,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { PlantImageUploader } from "@/components/common/PlantImageUploader";
import { Pagination } from "@/components/common";
import { extractPagination } from "@/utils/pagination";

export default function VendorInventoryPage({
  params,
}: {
  params: Promise<{ vendorId: string }>;
}) {
  const resolvedParams = use(params);
  const vendorId = resolvedParams.vendorId;
  const router = useRouter();

  const [vendor, setVendor] = useState<any | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState<"all" | "in_stock" | "low_stock" | "out_of_stock">("all");

  // Pagination states
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  // Quick edit modal
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [editLang, setEditLang] = useState<"en" | "hi">("en");
  const [savingEdit, setSavingEdit] = useState(false);

  // Categories & Dynamic Attributes for Editing (SOW 4a, 5.3)
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [editSubcategories, setEditSubcategories] = useState<CategoryItem[]>([]);
  const [editAttributes, setEditAttributes] = useState<CategoryAttributeItem[]>([]);
  const [loadingEditAttributes, setLoadingEditAttributes] = useState(false);
  const [showOptionalEditAttrs, setShowOptionalEditAttrs] = useState(false);

  // Fetch Categories on Mount
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await categoryService.fetchCategories({
          parentOnly: true,
          limit: 100,
        });
        const list: CategoryItem[] = Array.isArray(res?.data?.data)
          ? res.data.data
          : Array.isArray(res?.data)
          ? res.data
          : [];
        setCategories(list);
      } catch (err) {
        console.error("Failed to load categories for inventory", err);
      }
    };
    fetchCats();
  }, []);

  // Fetch Category Attributes & Subcategories whenever editingProduct?.categoryId changes
  useEffect(() => {
    if (!editingProduct?.categoryId) {
      setEditSubcategories([]);
      setEditAttributes([]);
      return;
    }

    const cat = categories.find((c) => c.id === editingProduct.categoryId);
    if (cat && Array.isArray(cat.subcategories)) {
      setEditSubcategories(cat.subcategories);
    } else {
      setEditSubcategories([]);
    }

    const loadAttrs = async () => {
      try {
        setLoadingEditAttributes(true);
        const res = await categoryService.fetchCategoryAttributes(editingProduct.categoryId);
        const attrs: CategoryAttributeItem[] = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
          ? res
          : [];
        setEditAttributes(attrs);
      } catch (err) {
        console.error("Failed to load edit attributes", err);
        setEditAttributes([]);
      } finally {
        setLoadingEditAttributes(false);
      }
    };
    loadAttrs();
  }, [editingProduct?.categoryId, categories]);

  const handleEditCategoryChange = (catId: string) => {
    const cat = categories.find((c) => c.id === catId);
    const subcats = cat?.subcategories || [];
    setEditSubcategories(subcats);
    setEditingProduct((prev: any) => ({
      ...prev,
      categoryId: catId,
      subcategoryId: subcats[0]?.id || "",
    }));
  };

  const isEditAttributeVisible = (attrName: string) => {
    const flowVal = editingProduct?.attributes?.["Flowering / Non-Flowering"];
    const isNonFlowering =
      flowVal === false ||
      flowVal === "false" ||
      flowVal === "No" ||
      flowVal === "no";

    const lower = attrName.toLowerCase();
    if (
      isNonFlowering &&
      (lower.includes("flower color") || lower.includes("flowering season"))
    ) {
      return false;
    }
    return true;
  };

  const handleEditAttributeChange = (attributeName: string, val: any) => {
    setEditingProduct((prev: any) => {
      if (!prev) return prev;
      const nextAttrs = {
        ...(prev.attributes || {}),
        [attributeName]: val,
      };
      if (
        attributeName === "Flowering / Non-Flowering" &&
        (val === false || val === "false" || val === "No" || val === "no")
      ) {
        delete nextAttrs["Flower Color"];
        delete nextAttrs["Flowering Season"];
      }
      return {
        ...prev,
        attributes: nextAttrs,
      };
    });
  };

  // Reset to page 1 on search or stock filter change
  useEffect(() => {
    setPage(1);
  }, [search, stockFilter]);

  const loadData = async () => {
    if (!vendorId) return;
    try {
      setLoading(true);
      // Fetch vendor details if not yet loaded
      if (!vendor) {
        try {
          const vendorData = await nurseryService.fetchVendorById(vendorId);
          const v = vendorData?.data || vendorData;
          setVendor(v);
        } catch (e) {
          // Fallback: fetch from vendor list if single fetch fails
          const vendorsRes = await nurseryService.fetchVendors({ limit: 100 });
          const list = Array.isArray(vendorsRes?.data) ? vendorsRes.data : vendorsRes?.data?.data || [];
          const found = list.find((item: any) => item.id === vendorId);
          if (found) setVendor(found);
        }
      }

      // Fetch vendor's products with pagination
      const prodRes = await nurseryService.fetchVendorProducts(vendorId, {
        page,
        limit: pageSize,
        q: search || undefined,
      });
      const items = Array.isArray(prodRes?.data)
        ? prodRes.data
        : Array.isArray(prodRes?.data?.data)
        ? prodRes.data.data
        : Array.isArray(prodRes)
        ? prodRes
        : [];
      setProducts(items);

      const p = extractPagination(prodRes, pageSize);
      setTotalPages(p.totalPages);
      setTotalProducts(p.total);
    } catch (err) {
      console.error("Failed to load store inventory", err);
      toast.error("Failed to load store inventory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 300);
    return () => clearTimeout(timer);
  }, [vendorId, page, pageSize, search]);

  // Stock stats calculation
  const stats = useMemo(() => {
    const total = products.length;
    const inStock = products.filter((p) => {
      const q = Number(p.stockQuantity ?? p.stock ?? 0);
      return q > 10;
    }).length;
    const lowStock = products.filter((p) => {
      const q = Number(p.stockQuantity ?? p.stock ?? 0);
      return q > 0 && q <= 10;
    }).length;
    const outOfStock = products.filter((p) => {
      const q = Number(p.stockQuantity ?? p.stock ?? 0);
      return q <= 0;
    }).length;
    return { total, inStock, lowStock, outOfStock };
  }, [products]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Stock filter
      const q = Number(p.stockQuantity ?? p.stock ?? 0);
      if (stockFilter === "in_stock" && q <= 10) return false;
      if (stockFilter === "low_stock" && (q <= 0 || q > 10)) return false;
      if (stockFilter === "out_of_stock" && q > 0) return false;

      // Search term
      if (search.trim()) {
        const s = search.toLowerCase();
        const nameMatch = p.name?.toLowerCase().includes(s);
        const hiNameMatch = p.translations?.hi?.name?.toLowerCase().includes(s);
        const catMatch = p.category?.name?.toLowerCase().includes(s) || p.suggestedCategory?.toLowerCase().includes(s);
        const masterMatch = p.masterProduct?.name?.toLowerCase().includes(s);
        return nameMatch || hiNameMatch || catMatch || masterMatch;
      }
      return true;
    });
  }, [products, stockFilter, search]);

  const handleToggleStatus = async (productId: string) => {
    try {
      await nurseryService.toggleVendorProductStatus(vendorId, productId);
      toast.success("Product active status updated!");
      loadData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update product status");
    }
  };

  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (!window.confirm(`Are you sure you want to remove "${productName}" from this nursery store?`)) {
      return;
    }
    try {
      await nurseryService.deleteVendorProduct(vendorId, productId);
      toast.success(`"${productName}" removed from store inventory`);
      loadData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete product");
    }
  };

  const handleSaveEdit = async () => {
    if (!editingProduct) return;
    try {
      setSavingEdit(true);
      const stockVal = Number(editingProduct.stockQuantity ?? editingProduct.stock ?? 0);
      const payload: any = {
        name: editingProduct.name,
        description: editingProduct.description || "",
        price: Number(editingProduct.price),
        discountPrice:
          editingProduct.discountPrice !== "" &&
          editingProduct.discountPrice !== null &&
          editingProduct.discountPrice !== undefined
            ? Number(editingProduct.discountPrice)
            : undefined,
        stock: stockVal,
        stockQuantity: stockVal,
        images: editingProduct.images || [],
        categoryId: editingProduct.categoryId || undefined,
        subcategoryId: editingProduct.subcategoryId || undefined,
        attributes: editingProduct.attributes || {},
        translations: {
          ...editingProduct.translations,
          hi: {
            name: editingProduct.translations?.hi?.name?.trim() || undefined,
            description: editingProduct.translations?.hi?.description?.trim() || undefined,
          },
        },
      };

      await nurseryService.updateVendorProduct(vendorId, editingProduct.id, payload);
      toast.success("Product updated successfully!");
      setEditingProduct(null);
      loadData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update product");
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* ─── Breadcrumb & Navigation Header ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/nursery-vendors"
            className="p-2.5 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Link
                href="/nursery-vendors"
                className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                Nursery Stores
              </Link>
              <span className="text-muted-foreground/60 text-xs">/</span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                Store Inventory
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight flex items-center gap-2.5 mt-0.5">
              <span>{vendor?.storeName || "Nursery Store"}</span>
              <span className="text-xs font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/30">
                {products.length} Plants Listed
              </span>
            </h1>
          </div>
        </div>

        {/* Action Button: Navigates to dedicated Add Plant Page */}
        <Link
          href={`/nursery-vendors/${vendorId}/inventory/new`}
          className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-sm px-5 py-3 rounded-2xl shadow-sm transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Plant to Store</span>
        </Link>
      </div>

      {/* ─── Store Profile Overview Card ────────────────────────────────────────── */}
      {vendor && (
        <div className="bg-card border border-border rounded-2xl p-5 shadow-2xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-sm flex items-center justify-center font-black text-2xl shrink-0">
                {vendor.storeName ? vendor.storeName.charAt(0).toUpperCase() : "N"}
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-bold text-foreground">{vendor.storeName}</h2>
                  <span className="text-xs font-mono bg-muted text-muted-foreground px-2 py-0.5 rounded border border-border/60">
                    {vendor.storeSlug}
                  </span>
                  {vendor.approvalStatus === "APPROVED" ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25">
                      <ShieldCheck className="w-3 h-3" /> Approved
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/25">
                      <Clock className="w-3 h-3" /> {vendor.approvalStatus}
                    </span>
                  )}
                  <span
                    className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                      vendor.isActive
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                        : "bg-muted text-muted-foreground border-border"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        vendor.isActive ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground"
                      }`}
                    />
                    {vendor.isActive ? "Online" : "Disabled"}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground font-medium">
                  {vendor.businessName && <span>Legal: {vendor.businessName}</span>}
                  {vendor.supportEmail && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      {vendor.supportEmail}
                    </span>
                  )}
                  {vendor.supportPhone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 shrink-0" />
                      {vendor.supportPhone}
                    </span>
                  )}
                  {vendor.coverageRadiusKm && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      Radius: {vendor.coverageRadiusKm} km
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start md:self-center">
              <Link
                href={`/nursery-vendors/${vendorId}/inventory/new`}
                className="inline-flex items-center gap-1.5 text-xs bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/25 border border-emerald-500/30 font-bold px-3.5 py-2 rounded-xl transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                Add New Plant
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ─── Inventory Metric Cards ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-card border border-border rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Total Plants
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Sprout className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-foreground mt-2 tracking-tight">
            {stats.total}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">Assigned to this nursery</div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              In Stock (&gt;10)
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2 tracking-tight">
            {stats.inStock}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">Sufficient inventory</div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Low Stock (1-10)
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 mt-2 tracking-tight">
            {stats.lowStock}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">Needs replenishment</div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Out of Stock (0)
            </span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 mt-2 tracking-tight">
            {stats.outOfStock}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">Currently unavailable</div>
        </div>
      </div>

      {/* ─── Search & Stock Filter Toolbar ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card border border-border rounded-2xl p-3.5 shadow-2xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search plant by English or Hindi name, category, master link..."
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

        {/* Stock Filter Tabs */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setStockFilter("all")}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl border transition-all shrink-0 cursor-pointer ${
              stockFilter === "all"
                ? "bg-foreground text-background border-foreground shadow-xs"
                : "bg-muted/40 text-muted-foreground border-border hover:bg-muted"
            }`}
          >
            All ({stats.total})
          </button>
          <button
            onClick={() => setStockFilter("in_stock")}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl border transition-all shrink-0 cursor-pointer ${
              stockFilter === "in_stock"
                ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25 hover:bg-emerald-500/20"
            }`}
          >
            In Stock ({stats.inStock})
          </button>
          <button
            onClick={() => setStockFilter("low_stock")}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl border transition-all shrink-0 cursor-pointer ${
              stockFilter === "low_stock"
                ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                : "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25 hover:bg-amber-500/20"
            }`}
          >
            Low Stock ({stats.lowStock})
          </button>
          <button
            onClick={() => setStockFilter("out_of_stock")}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl border transition-all shrink-0 cursor-pointer ${
              stockFilter === "out_of_stock"
                ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                : "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/25 hover:bg-rose-500/20"
            }`}
          >
            Out of Stock ({stats.outOfStock})
          </button>
        </div>
      </div>

      {/* ─── Store Associated Plants Table ─────────────────────────────────────── */}
      <div className="border border-border rounded-2xl overflow-hidden bg-card shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-muted/70 text-foreground/80 border-b border-border uppercase text-[11px] font-extrabold tracking-wider">
              <tr>
                <th className="py-4 px-4 sm:px-5 min-w-[220px]">Plant Product</th>
                <th className="py-4 px-4 min-w-[160px]">Master Catalog</th>
                <th className="py-4 px-4 text-right whitespace-nowrap">Selling Price</th>
                <th className="py-4 px-4 text-right whitespace-nowrap">Discount Price</th>
                <th className="py-4 px-4 text-center whitespace-nowrap">Stock Level</th>
                <th className="py-4 px-4 text-center whitespace-nowrap">Status</th>
                <th className="py-4 px-4 sm:px-5 text-right whitespace-nowrap min-w-[120px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/70">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                      <span className="font-semibold text-foreground text-sm">
                        Loading store inventory...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-3 max-w-md mx-auto">
                      <div className="w-14 h-14 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground">
                        <Package className="w-7 h-7" />
                      </div>
                      <p className="font-bold text-base text-foreground">
                        {search ? "No matching plants found" : "No plants listed in this store yet"}
                      </p>
                      <p className="text-xs text-muted-foreground text-center">
                        {search
                          ? "Try a different search keyword or clear your stock filter."
                          : "Add plants from the Master Catalog (over 76 varieties available) with pre-filled Hindi & English care guides."}
                      </p>
                      <Link
                        href={`/nursery-vendors/${vendorId}/inventory/new`}
                        className="mt-2 inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all"
                      >
                        <Plus className="w-4 h-4" /> Add Plant to Store
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const qty = Number(p.stockQuantity ?? p.stock ?? 0);
                  const thumb =
                    p.images?.[0] ||
                    p.masterProduct?.referenceImages?.[0] ||
                    null;
                  const hiName = p.translations?.hi?.name || p.masterProduct?.translations?.hi?.name;

                  return (
                    <tr key={p.id} className="hover:bg-muted/30 transition-colors group">
                      {/* Product Column */}
                      <td className="py-4 px-4 sm:px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-muted border border-border/80 overflow-hidden shrink-0 flex items-center justify-center">
                            {thumb ? (
                              <img
                                src={thumb}
                                alt={p.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Sprout className="w-5 h-5 text-emerald-600/50" />
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-foreground text-sm flex items-center gap-1.5">
                              {p.name}
                            </div>
                            {hiName && (
                              <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-1 mt-0.5">
                                <span className="text-[10px] font-bold bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                                  हिन्दी
                                </span>
                                {hiName}
                              </div>
                            )}
                            <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                              <span>{p.category?.name || p.suggestedCategory || "Plant"}</span>
                              {p.subcategory?.name && (
                                <>
                                  <span className="opacity-40">›</span>
                                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                    {p.subcategory.name}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Master Catalog Link */}
                      <td className="py-4 px-4">
                        {p.masterProduct ? (
                          <div className="inline-flex items-center gap-1.5 text-xs bg-emerald-500/10 text-emerald-800 dark:text-emerald-200 border border-emerald-500/25 px-2.5 py-1 rounded-lg font-medium">
                            <Sparkles className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span className="truncate max-w-[160px] font-semibold">
                              {p.masterProduct.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md border border-border/60">
                            Custom Listing
                          </span>
                        )}
                      </td>

                      {/* Selling Price */}
                      <td className="py-4 px-4 text-right font-black text-foreground">
                        ₹{p.price}
                      </td>

                      {/* Discount Price */}
                      <td className="py-4 px-4 text-right">
                        {p.discountPrice ? (
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            ₹{p.discountPrice}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </td>

                      {/* Stock Level */}
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${
                            qty > 10
                              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20"
                              : qty > 0
                              ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20"
                              : "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20"
                          }`}
                        >
                          <Boxes className="w-3 h-3" />
                          {qty} units
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => handleToggleStatus(p.id)}
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full transition-all border cursor-pointer ${
                            p.status === "active"
                              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25"
                              : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              p.status === "active" ? "bg-emerald-500" : "bg-muted-foreground"
                            }`}
                          />
                          {p.status === "active" ? "Active" : "Disabled"}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 sm:px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setEditingProduct({
                                ...p,
                                stock: qty,
                                stockQuantity: qty,
                                categoryId: p.categoryId || p.category?.id || "",
                                subcategoryId: p.subcategoryId || p.subcategory?.id || "",
                                attributes: p.attributes || {},
                              });
                              setEditLang("en");
                            }}
                            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent hover:border-border transition-all cursor-pointer"
                            title="Edit Plant Details"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                            className="p-2 rounded-xl text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
                            title="Delete Plant"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalProducts}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          itemName="products"
          disabled={loading}
        />
      </div>

      {/* ─── Inline Quick Edit Modal for Product ──────────────────────────────── */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="font-extrabold text-lg text-foreground">
                  Edit Plant Listing
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Update pricing, inventory stock, and bilingual details.
                </p>
              </div>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-2 text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Language Switcher */}
            <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-xl border border-border/80 w-fit">
              <button
                type="button"
                onClick={() => setEditLang("en")}
                className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  editLang === "en"
                    ? "bg-background text-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setEditLang("hi")}
                className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  editLang === "hi"
                    ? "bg-background text-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                हिन्दी (Hindi)
              </button>
            </div>

            {editLang === "en" ? (
              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    Plant Name (English)
                  </label>
                  <input
                    type="text"
                    value={editingProduct.name || ""}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, name: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border bg-background focus:ring-2 focus:ring-emerald-500/25"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    Description (English)
                  </label>
                  <textarea
                    rows={2}
                    value={editingProduct.description || ""}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, description: e.target.value })
                    }
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-background focus:ring-2 focus:ring-emerald-500/25"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    पौधे का नाम (Hindi Name)
                  </label>
                  <input
                    type="text"
                    value={editingProduct.translations?.hi?.name || ""}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        translations: {
                          ...editingProduct.translations,
                          hi: {
                            ...editingProduct.translations?.hi,
                            name: e.target.value,
                          },
                        },
                      })
                    }
                    placeholder="उदा. पीस लिली का पौधा"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border bg-background focus:ring-2 focus:ring-emerald-500/25"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    विवरण (Hindi Description)
                  </label>
                  <textarea
                    rows={2}
                    value={editingProduct.translations?.hi?.description || ""}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        translations: {
                          ...editingProduct.translations,
                          hi: {
                            ...editingProduct.translations?.hi,
                            description: e.target.value,
                          },
                        },
                      })
                    }
                    placeholder="पौधे का संक्षिप्त विवरण हिन्दी में..."
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-background focus:ring-2 focus:ring-emerald-500/25"
                  />
                </div>
              </div>
            )}

            {/* Price & Stock Inputs */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Selling Price (₹)
                </label>
                <input
                  type="number"
                  value={editingProduct.price || ""}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, price: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border bg-background font-bold text-foreground"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Discount Price (₹)
                </label>
                <input
                  type="number"
                  value={editingProduct.discountPrice ?? ""}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, discountPrice: e.target.value })
                  }
                  placeholder="Optional"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border bg-background font-bold text-emerald-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Stock (Units)
                </label>
                <input
                  type="number"
                  value={editingProduct.stockQuantity ?? editingProduct.stock ?? ""}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      stockQuantity: e.target.value,
                      stock: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border bg-background font-bold text-foreground"
                />
              </div>
            </div>

            {/* Category & Subcategory Selection */}
            <div className="pt-3 border-t border-border space-y-3">
              <div className="flex items-center gap-2">
                <FolderTree className="w-4 h-4 text-emerald-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Category & Classification
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    Primary Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={editingProduct.categoryId || ""}
                    onChange={(e) => handleEditCategoryChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border bg-background focus:ring-2 focus:ring-emerald-500/25"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    Subcategory (Optional)
                  </label>
                  <select
                    value={editingProduct.subcategoryId || ""}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        subcategoryId: e.target.value,
                      })
                    }
                    disabled={editSubcategories.length === 0}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border bg-background focus:ring-2 focus:ring-emerald-500/25 disabled:opacity-50"
                  >
                    <option value="">None / General</option>
                    {editSubcategories.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Dynamic Category Attributes */}
            {editAttributes.length > 0 && (
              <div className="pt-3 border-t border-border space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                      Category Specifications ({editAttributes.length} Attributes)
                    </h4>
                  </div>
                  {loadingEditAttributes && (
                    <span className="text-[10px] text-muted-foreground animate-pulse">
                      Loading specs...
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {editAttributes
                    .filter((a) => isEditAttributeVisible(a.attributeName))
                    .filter((a) => a.requiredLevel === "required" || a.requiredLevel === "recommended")
                    .map((attr) => {
                      const currentVal = editingProduct.attributes?.[attr.attributeName];
                      const isRequired = attr.requiredLevel === "required";

                      return (
                        <div key={attr.id} className="space-y-1">
                          <label className="flex items-center justify-between text-xs font-bold text-foreground">
                            <span className="flex items-center gap-1">
                              {attr.attributeName}
                              {isRequired && <span className="text-rose-500">*</span>}
                            </span>
                            <span className="text-[9px] uppercase font-mono px-1 rounded bg-secondary text-muted-foreground">
                              {attr.requiredLevel}
                            </span>
                          </label>

                          {/* 1. Dropdown */}
                          {attr.dataType === "dropdown" && (
                            <select
                              value={currentVal || ""}
                              onChange={(e) =>
                                handleEditAttributeChange(attr.attributeName, e.target.value)
                              }
                              className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background focus:ring-2 focus:ring-emerald-500/25"
                            >
                              <option value="">Select {attr.attributeName}</option>
                              {attr.dropdownOptions?.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          )}

                          {/* 2. Number + Unit */}
                          {attr.dataType === "number+unit" && (
                            <div className="flex gap-2">
                              <input
                                type="number"
                                min={0}
                                step="any"
                                placeholder="Value"
                                value={typeof currentVal === "object" ? currentVal?.value ?? "" : currentVal ?? ""}
                                onChange={(e) =>
                                  handleEditAttributeChange(attr.attributeName, {
                                    value: e.target.value,
                                    unit:
                                      typeof currentVal === "object" && currentVal?.unit
                                        ? currentVal.unit
                                        : attr.unitOptions?.[0] || "",
                                  })
                                }
                                className="flex-1 px-3 py-2 text-xs rounded-xl border border-border bg-background focus:ring-2 focus:ring-emerald-500/25"
                              />
                              <select
                                value={typeof currentVal === "object" ? currentVal?.unit ?? attr.unitOptions?.[0] : attr.unitOptions?.[0]}
                                onChange={(e) =>
                                  handleEditAttributeChange(attr.attributeName, {
                                    value: typeof currentVal === "object" ? currentVal?.value ?? "" : currentVal ?? "",
                                    unit: e.target.value,
                                  })
                                }
                                className="w-20 px-2 py-2 text-[11px] font-mono font-bold rounded-xl border border-border bg-secondary"
                              >
                                {attr.unitOptions?.map((u) => (
                                  <option key={u} value={u}>
                                    {u}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}

                          {/* 3. Boolean */}
                          {attr.dataType === "boolean" && (
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => handleEditAttributeChange(attr.attributeName, true)}
                                className={`flex-1 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                                  currentVal === true
                                    ? "bg-emerald-600 text-white border-emerald-600"
                                    : "bg-secondary text-muted-foreground border-border"
                                }`}
                              >
                                Yes
                              </button>
                              <button
                                type="button"
                                onClick={() => handleEditAttributeChange(attr.attributeName, false)}
                                className={`flex-1 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                                  currentVal === false
                                    ? "bg-rose-600 text-white border-rose-600"
                                    : "bg-secondary text-muted-foreground border-border"
                                }`}
                              >
                                No
                              </button>
                            </div>
                          )}

                          {/* 4. Multi-Select */}
                          {attr.dataType === "multi-select" && (
                            <div className="flex flex-wrap gap-1 p-1.5 rounded-xl border border-border bg-background/50">
                              {attr.dropdownOptions?.map((opt) => {
                                const arr = Array.isArray(currentVal) ? currentVal : [];
                                const selected = arr.includes(opt);
                                return (
                                  <button
                                    key={opt}
                                    type="button"
                                    onClick={() => {
                                      const next = selected
                                        ? arr.filter((x: string) => x !== opt)
                                        : [...arr, opt];
                                      handleEditAttributeChange(attr.attributeName, next);
                                    }}
                                    className={`px-2 py-0.5 rounded-lg text-[11px] font-medium border transition-all ${
                                      selected
                                        ? "bg-blue-500/20 text-blue-400 border-blue-500/40"
                                        : "bg-secondary text-muted-foreground border-border"
                                    }`}
                                  >
                                    {opt}
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          {/* 5. Text / Rich Text */}
                          {(attr.dataType === "text" || attr.dataType === "rich-text") && (
                            <input
                              type="text"
                              placeholder={`Enter ${attr.attributeName}...`}
                              value={currentVal || ""}
                              onChange={(e) =>
                                handleEditAttributeChange(attr.attributeName, e.target.value)
                              }
                              className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background focus:ring-2 focus:ring-emerald-500/25"
                            />
                          )}
                        </div>
                      );
                    })}
                </div>

                {/* Optional attributes accordion for Edit */}
                {editAttributes.filter((a) => isEditAttributeVisible(a.attributeName)).some((a) => a.requiredLevel === "optional") && (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setShowOptionalEditAttrs((p) => !p)}
                      className="flex items-center justify-between w-full p-2 text-xs font-bold text-muted-foreground hover:text-foreground rounded-xl bg-secondary/30 transition-colors"
                    >
                      <span className="flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5" />
                        Optional Specifications (
                        {
                          editAttributes.filter((a) => isEditAttributeVisible(a.attributeName) && a.requiredLevel === "optional")
                            .length
                        } fields)
                      </span>
                      {showOptionalEditAttrs ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {showOptionalEditAttrs && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 animate-in fade-in">
                        {editAttributes
                          .filter((a) => isEditAttributeVisible(a.attributeName) && a.requiredLevel === "optional")
                          .map((attr) => {
                            const currentVal = editingProduct.attributes?.[attr.attributeName];
                            return (
                              <div key={attr.id} className="space-y-1">
                                <label className="block text-xs font-bold text-muted-foreground">
                                  {attr.attributeName}
                                </label>
                                {attr.dataType === "dropdown" ? (
                                  <select
                                    value={currentVal || ""}
                                    onChange={(e) =>
                                      handleEditAttributeChange(attr.attributeName, e.target.value)
                                    }
                                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-border bg-background focus:ring-2 focus:ring-emerald-500/25"
                                  >
                                    <option value="">Select {attr.attributeName}</option>
                                    {attr.dropdownOptions?.map((opt) => (
                                      <option key={opt} value={opt}>
                                        {opt}
                                      </option>
                                    ))}
                                  </select>
                                ) : (
                                  <input
                                    type="text"
                                    placeholder={`Enter ${attr.attributeName}...`}
                                    value={
                                      typeof currentVal === "object"
                                        ? currentVal?.value ?? ""
                                        : currentVal || ""
                                    }
                                    onChange={(e) =>
                                      handleEditAttributeChange(attr.attributeName, e.target.value)
                                    }
                                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-border bg-background focus:ring-2 focus:ring-emerald-500/25"
                                  />
                                )}
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Plant Images Upload */}
            <div className="pt-3 border-t border-border">
              <PlantImageUploader
                images={editingProduct.images || []}
                onChange={(imgs) =>
                  setEditingProduct({ ...editingProduct, images: imgs })
                }
                title="Plant Photos & Images / पौधे की तस्वीरें"
                description="Upload or manage photos for this plant listing."
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="px-4 py-2.5 text-xs font-bold text-muted-foreground hover:text-foreground bg-muted hover:bg-muted/80 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={savingEdit}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-all disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                {savingEdit ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
