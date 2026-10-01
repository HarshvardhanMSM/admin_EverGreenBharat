"use client";

import { useState, useEffect } from "react";
import {
  categoryService,
  CategoryItem,
  CategoryAttributeItem,
} from "@/services/api/category-service";
import { toast } from "@/components/ui/toast";
import {
  Layers,
  FolderTree,
  Tag,
  Plus,
  Search,
  Pencil,
  Trash2,
  Check,
  X,
  Filter,
  ArrowUpDown,
  MoveUp,
  MoveDown,
  RefreshCw,
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle,
  Hash,
  ListFilter,
  SlidersHorizontal,
} from "lucide-react";

export default function CategoryMasterPage() {
  const [activeTab, setActiveTab] = useState<"categories" | "subcategories" | "attributes">("categories");

  // Data states
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");

  // Filters
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("all");
  const [attributeCategoryFilter, setAttributeCategoryFilter] = useState<string>("");

  // Subcategories state (cached or loaded)
  const [subcategories, setSubcategories] = useState<CategoryItem[]>([]);

  // Attributes state
  const [attributes, setAttributes] = useState<CategoryAttributeItem[]>([]);
  const [attributesLoading, setAttributesLoading] = useState(false);

  // Modals state
  const [showCatModal, setShowCatModal] = useState(false);
  const [editingCat, setEditingCat] = useState<CategoryItem | null>(null);
  const [catName, setCatName] = useState("");
  const [catSlug, setCatSlug] = useState("");
  const [catDesc, setCatDesc] = useState("");
  const [catImageUrl, setCatImageUrl] = useState("");
  const [catSortOrder, setCatSortOrder] = useState(0);

  const [showSubModal, setShowSubModal] = useState(false);
  const [editingSub, setEditingSub] = useState<CategoryItem | null>(null);
  const [subParentId, setSubParentId] = useState("");
  const [subName, setSubName] = useState("");
  const [subSlug, setSubSlug] = useState("");
  const [subDesc, setSubDesc] = useState("");
  const [subSortOrder, setSubSortOrder] = useState(0);

  const [showAttrModal, setShowAttrModal] = useState(false);
  const [editingAttr, setEditingAttr] = useState<CategoryAttributeItem | null>(null);
  const [attrCategoryId, setAttrCategoryId] = useState("");
  const [attrName, setAttrName] = useState("");
  const [attrDataType, setAttrDataType] = useState<
    "text" | "number" | "number+unit" | "dropdown" | "multi-select" | "boolean" | "rich-text"
  >("text");
  const [attrRequiredLevel, setAttrRequiredLevel] = useState<"required" | "recommended" | "optional">("optional");
  const [attrFilterable, setAttrFilterable] = useState(true);
  const [attrDisplayOrder, setAttrDisplayOrder] = useState(1);
  const [attrUnitOptionsStr, setAttrUnitOptionsStr] = useState("");
  const [attrDropdownOptionsStr, setAttrDropdownOptionsStr] = useState("");

  // ─── Fetch Categories & Subcategories ─────────────────────────────────────
  const loadCategories = async () => {
    try {
      setLoading(true);
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

      // Extract all subcategories from loaded parents
      const allSubs: CategoryItem[] = [];
      list.forEach((parent) => {
        if (Array.isArray(parent.subcategories)) {
          parent.subcategories.forEach((s) => {
            allSubs.push({ ...s, parent });
          });
        }
      });
      setSubcategories(allSubs);

      // Default attribute category selection if none selected
      if (!attributeCategoryFilter && list.length > 0) {
        setAttributeCategoryFilter(list[0].id);
      }
    } catch (err: any) {
      console.error("Failed to load categories", err);
      toast.error(err?.response?.data?.message || "Failed to load categories");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ─── Fetch Attributes for active category ─────────────────────────────────
  const loadAttributes = async (catId: string) => {
    if (!catId) return;
    try {
      setAttributesLoading(true);
      const res = await categoryService.fetchCategoryAttributes(catId);
      const list: CategoryAttributeItem[] = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
        ? res
        : [];
      setAttributes(list);
    } catch (err: any) {
      console.error("Failed to load category attributes", err);
      setAttributes([]);
    } finally {
      setAttributesLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (attributeCategoryFilter) {
      loadAttributes(attributeCategoryFilter);
    }
  }, [attributeCategoryFilter]);

  // ─── Category Handlers ────────────────────────────────────────────────────
  const handleOpenAddCat = () => {
    setEditingCat(null);
    setCatName("");
    setCatSlug("");
    setCatDesc("");
    setCatImageUrl("");
    setCatSortOrder(categories.length + 1);
    setShowCatModal(true);
  };

  const handleOpenEditCat = (cat: CategoryItem) => {
    setEditingCat(cat);
    setCatName(cat.name);
    setCatSlug(cat.slug);
    setCatDesc(cat.description || "");
    setCatImageUrl(cat.imageUrl || cat.iconUrl || "");
    setCatSortOrder(cat.sortOrder);
    setShowCatModal(true);
  };

  const handleSaveCat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      if (editingCat) {
        await categoryService.updateCategory(editingCat.id, {
          name: catName.trim(),
          slug: catSlug.trim() || undefined,
          description: catDesc.trim() || undefined,
          imageUrl: catImageUrl.trim() || undefined,
          sortOrder: Number(catSortOrder),
        });
        toast.success(`Category "${catName}" updated successfully`);
      } else {
        await categoryService.createCategory({
          name: catName.trim(),
          slug: catSlug.trim() || undefined,
          description: catDesc.trim() || undefined,
          imageUrl: catImageUrl.trim() || undefined,
          sortOrder: Number(catSortOrder),
        });
        toast.success(`Category "${catName}" created successfully`);
      }
      setShowCatModal(false);
      loadCategories();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save category");
    }
  };

  const handleToggleCatStatus = async (cat: CategoryItem) => {
    try {
      const nextStatus = !cat.isActive;
      await categoryService.toggleCategoryStatus(cat.id, nextStatus);
      toast.success(
        `Category "${cat.name}" is now ${nextStatus ? "Active" : "Inactive"}`,
      );
      setCategories((prev) =>
        prev.map((c) => (c.id === cat.id ? { ...c, isActive: nextStatus } : c)),
      );
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update status");
    }
  };

  const handleDeleteCat = async (cat: CategoryItem) => {
    if (!confirm(`Are you sure you want to delete category "${cat.name}"?`))
      return;
    try {
      await categoryService.deleteCategory(cat.id);
      toast.success(`Category "${cat.name}" deleted successfully`);
      loadCategories();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          "Cannot delete category. Check if subcategories or products exist.",
      );
    }
  };

  const handleReorderCat = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const newCats = [...categories];
    const temp = newCats[index];
    newCats[index] = newCats[targetIndex];
    newCats[targetIndex] = temp;

    // reassign sortOrder
    const payload = newCats.map((item, idx) => ({
      id: item.id,
      sortOrder: idx + 1,
    }));

    setCategories(
      newCats.map((item, idx) => ({ ...item, sortOrder: idx + 1 })),
    );

    try {
      await categoryService.reorderCategories(payload);
      toast.success("Categories reordered");
    } catch (err: any) {
      toast.error("Failed to reorder categories");
      loadCategories();
    }
  };

  // ─── Subcategory Handlers ─────────────────────────────────────────────────
  const handleOpenAddSub = () => {
    setEditingSub(null);
    setSubParentId(
      selectedCategoryFilter !== "all"
        ? selectedCategoryFilter
        : categories[0]?.id || "",
    );
    setSubName("");
    setSubSlug("");
    setSubDesc("");
    setSubSortOrder(subcategories.length + 1);
    setShowSubModal(true);
  };

  const handleOpenEditSub = (sub: CategoryItem) => {
    setEditingSub(sub);
    setSubParentId(sub.parentId || "");
    setSubName(sub.name);
    setSubSlug(sub.slug);
    setSubDesc(sub.description || "");
    setSubSortOrder(sub.sortOrder);
    setShowSubModal(true);
  };

  const handleSaveSub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subParentId) {
      toast.error("Please select a parent category");
      return;
    }
    if (!subName.trim()) {
      toast.error("Subcategory name is required");
      return;
    }

    try {
      if (editingSub) {
        await categoryService.updateCategory(editingSub.id, {
          name: subName.trim(),
          slug: subSlug.trim() || undefined,
          description: subDesc.trim() || undefined,
          parentId: subParentId,
          sortOrder: Number(subSortOrder),
        });
        toast.success(`Subcategory "${subName}" updated successfully`);
      } else {
        await categoryService.createSubcategory(subParentId, {
          name: subName.trim(),
          slug: subSlug.trim() || undefined,
          description: subDesc.trim() || undefined,
          sortOrder: Number(subSortOrder),
        });
        toast.success(`Subcategory "${subName}" created successfully`);
      }
      setShowSubModal(false);
      loadCategories();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save subcategory");
    }
  };

  const handleDeleteSub = async (sub: CategoryItem) => {
    if (!confirm(`Are you sure you want to delete subcategory "${sub.name}"?`))
      return;
    try {
      await categoryService.deleteCategory(sub.id);
      toast.success(`Subcategory "${sub.name}" deleted successfully`);
      loadCategories();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          "Cannot delete subcategory. Check if products exist.",
      );
    }
  };

  // ─── Attribute Handlers (SOW 4a, 5.3, 10.7) ──────────────────────────────
  const handleOpenAddAttr = () => {
    setEditingAttr(null);
    setAttrCategoryId(attributeCategoryFilter || categories[0]?.id || "");
    setAttrName("");
    setAttrDataType("text");
    setAttrRequiredLevel("optional");
    setAttrFilterable(true);
    setAttrDisplayOrder(attributes.length + 1);
    setAttrUnitOptionsStr("");
    setAttrDropdownOptionsStr("");
    setShowAttrModal(true);
  };

  const handleOpenEditAttr = (attr: CategoryAttributeItem) => {
    setEditingAttr(attr);
    setAttrCategoryId(attr.categoryId);
    setAttrName(attr.attributeName);
    setAttrDataType(attr.dataType);
    setAttrRequiredLevel(attr.requiredLevel);
    setAttrFilterable(attr.filterable);
    setAttrDisplayOrder(attr.displayOrder);
    setAttrUnitOptionsStr((attr.unitOptions || []).join(", "));
    setAttrDropdownOptionsStr((attr.dropdownOptions || []).join(", "));
    setShowAttrModal(true);
  };

  const handleSaveAttr = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attrCategoryId) {
      toast.error("Please select a category");
      return;
    }
    if (!attrName.trim()) {
      toast.error("Attribute name is required");
      return;
    }

    const unitOptions = attrUnitOptionsStr
      ? attrUnitOptionsStr.split(",").map((s) => s.trim()).filter(Boolean)
      : [];
    const dropdownOptions = attrDropdownOptionsStr
      ? attrDropdownOptionsStr.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    try {
      if (editingAttr) {
        await categoryService.updateCategoryAttribute(
          editingAttr.categoryId,
          editingAttr.id,
          {
            attributeName: attrName.trim(),
            dataType: attrDataType,
            requiredLevel: attrRequiredLevel,
            filterable: attrFilterable,
            displayOrder: Number(attrDisplayOrder),
            unitOptions,
            dropdownOptions,
          },
        );
        toast.success(`Attribute "${attrName}" updated successfully`);
      } else {
        await categoryService.createCategoryAttribute(attrCategoryId, {
          attributeName: attrName.trim(),
          dataType: attrDataType,
          requiredLevel: attrRequiredLevel,
          filterable: attrFilterable,
          displayOrder: Number(attrDisplayOrder),
          unitOptions,
          dropdownOptions,
        });
        toast.success(`Attribute "${attrName}" created successfully`);
      }
      setShowAttrModal(false);
      loadAttributes(attrCategoryId);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save attribute");
    }
  };

  const handleToggleAttributeFilterable = async (
    attr: CategoryAttributeItem,
  ) => {
    const nextVal = !attr.filterable;
    try {
      await categoryService.toggleAttributeFilterable(
        attr.categoryId,
        attr.id,
        nextVal,
      );
      toast.success(
        `Attribute "${attr.attributeName}" is ${nextVal ? "now Filterable in Marketplace" : "removed from Filters"}`,
      );
      setAttributes((prev) =>
        prev.map((a) => (a.id === attr.id ? { ...a, filterable: nextVal } : a)),
      );
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to toggle filterable state",
      );
    }
  };

  const handleDeleteAttr = async (attr: CategoryAttributeItem) => {
    if (!confirm(`Are you sure you want to delete attribute "${attr.attributeName}"?`))
      return;
    try {
      await categoryService.deleteCategoryAttribute(attr.categoryId, attr.id);
      toast.success(`Attribute "${attr.attributeName}" deleted successfully`);
      loadAttributes(attr.categoryId);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete attribute");
    }
  };

  // ─── Filtered Data ────────────────────────────────────────────────────────
  const filteredCategories = categories.filter((c) =>
    search ? c.name.toLowerCase().includes(search.toLowerCase()) : true,
  );

  const filteredSubcategories = subcategories.filter((s) => {
    const matchCat =
      selectedCategoryFilter === "all" || s.parentId === selectedCategoryFilter;
    const matchSearch = search
      ? s.name.toLowerCase().includes(search.toLowerCase())
      : true;
    return matchCat && matchSearch;
  });

  const activeCategoryObj = categories.find(
    (c) => c.id === attributeCategoryFilter,
  );

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 pb-12">
      {/* Header & Stats Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-950/40 via-background to-teal-950/20 border border-emerald-500/20 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400">
              <Layers className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Category & Attribute Master
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Configure primary plant categories, subcategories, and dynamic attribute schemas that power product listings and marketplace filters.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setRefreshing(true);
              loadCategories();
              if (attributeCategoryFilter) {
                loadAttributes(attributeCategoryFilter);
              }
            }}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-secondary/80 hover:bg-secondary border border-border rounded-xl transition-all"
            title="Refresh Catalog Data"
          >
            <RefreshCw
              className={`w-4 h-4 text-muted-foreground ${refreshing ? "animate-spin text-emerald-400" : ""}`}
            />
            <span>Refresh</span>
          </button>

          {activeTab === "categories" && (
            <button
              onClick={handleOpenAddCat}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-xl shadow-lg shadow-emerald-900/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Category</span>
            </button>
          )}

          {activeTab === "subcategories" && (
            <button
              onClick={handleOpenAddSub}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-xl shadow-lg shadow-emerald-900/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Subcategory</span>
            </button>
          )}

          {activeTab === "attributes" && (
            <button
              onClick={handleOpenAddAttr}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-xl shadow-lg shadow-emerald-900/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Attribute</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-card border border-border/60 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Primary Categories
            </p>
            <p className="text-2xl font-bold mt-1 text-emerald-400">
              {categories.length}
            </p>
          </div>
          <span className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <FolderTree className="w-5 h-5" />
          </span>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border/60 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Subcategories
            </p>
            <p className="text-2xl font-bold mt-1 text-teal-400">
              {subcategories.length}
            </p>
          </div>
          <span className="p-2.5 bg-teal-500/10 text-teal-400 rounded-xl">
            <Tag className="w-5 h-5" />
          </span>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border/60 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Dynamic Attributes
            </p>
            <p className="text-2xl font-bold mt-1 text-cyan-400">
              {attributes.length}
            </p>
          </div>
          <span className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-xl">
            <SlidersHorizontal className="w-5 h-5" />
          </span>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border/60 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Marketplace Filters
            </p>
            <p className="text-2xl font-bold mt-1 text-amber-400">
              {attributes.filter((a) => a.filterable).length}
            </p>
          </div>
          <span className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl">
            <Filter className="w-5 h-5" />
          </span>
        </div>
      </div>

      {/* Linked Navigation Tabs */}
      <div className="flex border-b border-border/60">
        <button
          onClick={() => setActiveTab("categories")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "categories"
              ? "border-emerald-500 text-emerald-400"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <FolderTree className="w-4 h-4" />
          <span>7a. Categories ({categories.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("subcategories")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "subcategories"
              ? "border-emerald-500 text-emerald-400"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>7b. Subcategories ({subcategories.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("attributes")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "attributes"
              ? "border-emerald-500 text-emerald-400"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>7c. Dynamic Attributes ({activeCategoryObj?.name || "Category"})</span>
        </button>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          TAB 1: PRIMARY CATEGORIES (7a)
      ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === "categories" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search categories by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-secondary/40 border border-border/80 rounded-xl text-sm focus:outline-none focus:border-emerald-500/60"
              />
            </div>
            <div className="text-xs text-muted-foreground">
              Showing {filteredCategories.length} categories
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary/40 text-xs uppercase font-medium text-muted-foreground border-b border-border/60">
                <tr>
                  <th className="px-4 py-3.5 w-16 text-center">Order</th>
                  <th className="px-6 py-3.5">Category Name</th>
                  <th className="px-6 py-3.5">Slug</th>
                  <th className="px-4 py-3.5 text-center">Subcategories</th>
                  <th className="px-4 py-3.5 text-center">Attributes</th>
                  <th className="px-4 py-3.5 text-center">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                      No categories found. Click &quot;Add Category&quot; to create one.
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((cat, idx) => (
                    <tr
                      key={cat.id}
                      className="hover:bg-secondary/20 transition-colors group"
                    >
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <span className="font-mono text-xs font-semibold text-muted-foreground w-5">
                            {cat.sortOrder || idx + 1}
                          </span>
                          <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              disabled={idx === 0}
                              onClick={() => handleReorderCat(idx, "up")}
                              className="text-muted-foreground hover:text-emerald-400 disabled:opacity-30"
                              title="Move Up"
                            >
                              <MoveUp className="w-3 h-3" />
                            </button>
                            <button
                              disabled={idx === filteredCategories.length - 1}
                              onClick={() => handleReorderCat(idx, "down")}
                              className="text-muted-foreground hover:text-emerald-400 disabled:opacity-30"
                              title="Move Down"
                            >
                              <MoveDown className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3 font-semibold text-foreground">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm shrink-0">
                            {cat.imageUrl ? (
                              <img
                                src={cat.imageUrl}
                                alt={cat.name}
                                className="w-full h-full object-cover rounded-xl"
                              />
                            ) : (
                              cat.name.slice(0, 2).toUpperCase()
                            )}
                          </div>
                          <div>
                            <span className="text-foreground">{cat.name}</span>
                            {cat.description && (
                              <p className="text-xs text-muted-foreground line-clamp-1 max-w-sm">
                                {cat.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3 font-mono text-xs text-muted-foreground">
                        {cat.slug}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => {
                            setSelectedCategoryFilter(cat.id);
                            setActiveTab("subcategories");
                          }}
                          className="px-2.5 py-1 text-xs rounded-full bg-secondary/80 hover:bg-emerald-500/10 hover:text-emerald-400 border border-border/80 transition-colors font-semibold"
                        >
                          {cat.subcategories?.length || 0} subcategories
                        </button>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => {
                            setAttributeCategoryFilter(cat.id);
                            setActiveTab("attributes");
                          }}
                          className="px-2.5 py-1 text-xs rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 transition-colors font-semibold"
                        >
                          Configure Schema →
                        </button>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleToggleCatStatus(cat)}
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 transition-all ${
                            cat.isActive
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                              : "bg-red-500/10 text-red-400 border border-red-500/30"
                          }`}
                        >
                          {cat.isActive ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              Active
                            </>
                          ) : (
                            <>
                              <X className="w-3 h-3" />
                              Inactive
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditCat(cat)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-emerald-400 hover:bg-secondary transition-all"
                            title="Edit Category"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCat(cat)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-secondary transition-all"
                            title="Delete Category"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          TAB 2: SUBCATEGORIES (7b)
      ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === "subcategories" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search subcategories..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-secondary/40 border border-border/80 rounded-xl text-sm focus:outline-none focus:border-emerald-500/60"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className="px-3 py-2 bg-secondary/40 border border-border/80 rounded-xl text-sm focus:outline-none focus:border-emerald-500/60"
                >
                  <option value="all">All Parent Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              Showing {filteredSubcategories.length} subcategories
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary/40 text-xs uppercase font-medium text-muted-foreground border-b border-border/60">
                <tr>
                  <th className="px-4 py-3.5 w-16 text-center">Order</th>
                  <th className="px-6 py-3.5">Subcategory Name</th>
                  <th className="px-6 py-3.5">Parent Category</th>
                  <th className="px-6 py-3.5">Slug</th>
                  <th className="px-4 py-3.5 text-center">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredSubcategories.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                      No subcategories match the selected filter.
                    </td>
                  </tr>
                ) : (
                  filteredSubcategories.map((sub, idx) => (
                    <tr
                      key={sub.id}
                      className="hover:bg-secondary/20 transition-colors"
                    >
                      <td className="px-4 py-3 text-center font-mono text-xs text-muted-foreground">
                        {sub.sortOrder || idx + 1}
                      </td>
                      <td className="px-6 py-3 font-semibold text-foreground">
                        {sub.name}
                      </td>
                      <td className="px-6 py-3">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          {sub.parent?.name || "Parent"}
                        </span>
                      </td>
                      <td className="px-6 py-3 font-mono text-xs text-muted-foreground">
                        {sub.slug}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleToggleCatStatus(sub)}
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            sub.isActive
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          {sub.isActive ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditSub(sub)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-emerald-400 hover:bg-secondary transition-all"
                            title="Edit Subcategory"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSub(sub)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-secondary transition-all"
                            title="Delete Subcategory"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          TAB 3: DYNAMIC ATTRIBUTES (7c - SOW 4a, 5.3, 10.7)
      ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === "attributes" && (
        <div className="space-y-4">
          {/* Category Selector Tabs for Attributes */}
          <div className="flex flex-wrap gap-2 p-1.5 bg-secondary/40 border border-border/60 rounded-2xl">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setAttributeCategoryFilter(c.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  attributeCategoryFilter === c.id
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/40"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* SOW Highlight Banner */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-xs text-cyan-200">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-cyan-300">
                Dynamic Schema Engine:
              </span>{" "}
              Attributes configured here drive the product listing form for vendors. Any attribute marked as{" "}
              <strong className="text-cyan-300 font-bold">Filterable: Yes</strong>{" "}
              is automatically exposed to the marketplace search & browse filter sidebar with zero deployment required.
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary/40 text-xs uppercase font-medium text-muted-foreground border-b border-border/60">
                <tr>
                  <th className="px-4 py-3.5 w-16 text-center">Order</th>
                  <th className="px-6 py-3.5">Attribute Name</th>
                  <th className="px-4 py-3.5">Data Type</th>
                  <th className="px-4 py-3.5">Required Level</th>
                  <th className="px-6 py-3.5">Options / Units</th>
                  <th className="px-4 py-3.5 text-center">
                    <div className="inline-flex items-center gap-1" title="Inline toggle: auto-updates marketplace search filters">
                      <span>Filterable</span>
                      <Filter className="w-3.5 h-3.5 text-amber-400" />
                    </div>
                  </th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {attributesLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                      Loading attribute schema...
                    </td>
                  </tr>
                ) : attributes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                      No attributes configured for this category yet. Click &quot;Add Attribute&quot; to start.
                    </td>
                  </tr>
                ) : (
                  attributes.map((attr, idx) => (
                    <tr
                      key={attr.id}
                      className="hover:bg-secondary/20 transition-colors"
                    >
                      <td className="px-4 py-3 text-center font-mono text-xs text-muted-foreground">
                        {attr.displayOrder || idx + 1}
                      </td>
                      <td className="px-6 py-3 font-semibold text-foreground">
                        {attr.attributeName}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-md text-xs font-mono font-medium border ${
                            attr.dataType === "number+unit"
                              ? "bg-purple-500/10 text-purple-400 border-purple-500/30"
                              : attr.dataType === "dropdown" || attr.dataType === "multi-select"
                              ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                              : attr.dataType === "boolean"
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                              : "bg-secondary text-muted-foreground border-border"
                          }`}
                        >
                          {attr.dataType}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            attr.requiredLevel === "required"
                              ? "bg-red-500/10 text-red-400"
                              : attr.requiredLevel === "recommended"
                              ? "bg-amber-500/10 text-amber-400"
                              : "bg-secondary text-muted-foreground"
                          }`}
                        >
                          {attr.requiredLevel}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-xs text-muted-foreground max-w-xs">
                        {attr.unitOptions && attr.unitOptions.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            <span className="font-semibold text-purple-400">Units:</span>
                            {attr.unitOptions.map((u) => (
                              <span key={u} className="px-1.5 py-0.2 bg-purple-500/10 rounded font-mono">
                                {u}
                              </span>
                            ))}
                          </div>
                        )}
                        {attr.dropdownOptions && attr.dropdownOptions.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-0.5">
                            {attr.dropdownOptions.slice(0, 4).map((d) => (
                              <span key={d} className="px-1.5 py-0.2 bg-secondary rounded">
                                {d}
                              </span>
                            ))}
                            {attr.dropdownOptions.length > 4 && (
                              <span className="text-muted-foreground font-mono">
                                +{attr.dropdownOptions.length - 4} more
                              </span>
                            )}
                          </div>
                        )}
                        {(!attr.unitOptions || attr.unitOptions.length === 0) &&
                          (!attr.dropdownOptions || attr.dropdownOptions.length === 0) && (
                            <span className="text-muted-foreground/60">—</span>
                          )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleToggleAttributeFilterable(attr)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 transition-all shadow-sm ${
                            attr.filterable
                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/25"
                              : "bg-secondary text-muted-foreground/80 border border-border hover:text-foreground"
                          }`}
                          title="Click to toggle marketplace filter availability"
                        >
                          {attr.filterable ? (
                            <>
                              <Check className="w-3 h-3" />
                              <span>Filterable</span>
                            </>
                          ) : (
                            <>
                              <X className="w-3 h-3" />
                              <span>Hidden</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditAttr(attr)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-emerald-400 hover:bg-secondary transition-all"
                            title="Edit Attribute"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAttr(attr)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-secondary transition-all"
                            title="Delete Attribute"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          MODAL: ADD / EDIT CATEGORY
      ────────────────────────────────────────────────────────────────────────── */}
      {showCatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h2 className="text-lg font-bold text-foreground">
                {editingCat ? "Edit Category" : "Add Primary Category"}
              </h2>
              <button
                onClick={() => setShowCatModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCat} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Plants, Seeds, Gardening Tools"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="w-full px-3 py-2 bg-secondary/40 border border-border rounded-xl text-sm focus:outline-none focus:border-emerald-500/60"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    Slug (URL Key)
                  </label>
                  <input
                    type="text"
                    placeholder="auto-generated if blank"
                    value={catSlug}
                    onChange={(e) => setCatSlug(e.target.value)}
                    className="w-full px-3 py-2 bg-secondary/40 border border-border rounded-xl text-sm focus:outline-none focus:border-emerald-500/60 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    Display Sort Order
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={catSortOrder}
                    onChange={(e) => setCatSortOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-secondary/40 border border-border rounded-xl text-sm focus:outline-none focus:border-emerald-500/60"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Image or Icon URL
                </label>
                <input
                  type="text"
                  placeholder="https://... or /uploads/..."
                  value={catImageUrl}
                  onChange={(e) => setCatImageUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-secondary/40 border border-border rounded-xl text-sm focus:outline-none focus:border-emerald-500/60"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Brief description of this nursery category..."
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-secondary/40 border border-border rounded-xl text-sm focus:outline-none focus:border-emerald-500/60"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => setShowCatModal(false)}
                  className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded-xl shadow-lg shadow-emerald-950/40"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          MODAL: ADD / EDIT SUBCATEGORY
      ────────────────────────────────────────────────────────────────────────── */}
      {showSubModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h2 className="text-lg font-bold text-foreground">
                {editingSub ? "Edit Subcategory" : "Add Subcategory"}
              </h2>
              <button
                onClick={() => setShowSubModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSub} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Parent Category *
                </label>
                <select
                  required
                  value={subParentId}
                  onChange={(e) => setSubParentId(e.target.value)}
                  className="w-full px-3 py-2 bg-secondary/40 border border-border rounded-xl text-sm focus:outline-none focus:border-emerald-500/60"
                >
                  <option value="">Select a Parent Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Subcategory Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Indoor Plants, Terracotta Pots, Pruning Tools"
                  value={subName}
                  onChange={(e) => setSubName(e.target.value)}
                  className="w-full px-3 py-2 bg-secondary/40 border border-border rounded-xl text-sm focus:outline-none focus:border-emerald-500/60"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    Slug
                  </label>
                  <input
                    type="text"
                    placeholder="auto-generated"
                    value={subSlug}
                    onChange={(e) => setSubSlug(e.target.value)}
                    className="w-full px-3 py-2 bg-secondary/40 border border-border rounded-xl text-sm focus:outline-none focus:border-emerald-500/60 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    Display Sort Order
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={subSortOrder}
                    onChange={(e) => setSubSortOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-secondary/40 border border-border rounded-xl text-sm focus:outline-none focus:border-emerald-500/60"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief subcategory description..."
                  value={subDesc}
                  onChange={(e) => setSubDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-secondary/40 border border-border rounded-xl text-sm focus:outline-none focus:border-emerald-500/60"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => setShowSubModal(false)}
                  className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded-xl shadow-lg shadow-emerald-950/40"
                >
                  Save Subcategory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          MODAL: ADD / EDIT DYNAMIC ATTRIBUTE (SOW 4a, 5.3, 10.7)
      ────────────────────────────────────────────────────────────────────────── */}
      {showAttrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-card border border-border rounded-2xl w-full max-w-xl p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h2 className="text-lg font-bold text-foreground">
                {editingAttr ? "Edit Dynamic Attribute" : "Add Dynamic Attribute"}
              </h2>
              <button
                onClick={() => setShowAttrModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAttr} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Target Category *
                </label>
                <select
                  required
                  value={attrCategoryId}
                  onChange={(e) => setAttrCategoryId(e.target.value)}
                  className="w-full px-3 py-2 bg-secondary/40 border border-border rounded-xl text-sm focus:outline-none focus:border-emerald-500/60"
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    Attribute Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Plant Height, Sunlight Requirement"
                    value={attrName}
                    onChange={(e) => setAttrName(e.target.value)}
                    className="w-full px-3 py-2 bg-secondary/40 border border-border rounded-xl text-sm focus:outline-none focus:border-emerald-500/60"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    Data Type *
                  </label>
                  <select
                    value={attrDataType}
                    onChange={(e) => setAttrDataType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-secondary/40 border border-border rounded-xl text-sm focus:outline-none focus:border-emerald-500/60 font-mono"
                  >
                    <option value="text">text (free text)</option>
                    <option value="number">number</option>
                    <option value="number+unit">number+unit (e.g. 30 cm, 5 ft)</option>
                    <option value="dropdown">dropdown (single select)</option>
                    <option value="multi-select">multi-select</option>
                    <option value="boolean">boolean (Yes / No)</option>
                    <option value="rich-text">rich-text</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    Required Level *
                  </label>
                  <select
                    value={attrRequiredLevel}
                    onChange={(e) => setAttrRequiredLevel(e.target.value as any)}
                    className="w-full px-3 py-2 bg-secondary/40 border border-border rounded-xl text-sm focus:outline-none focus:border-emerald-500/60"
                  >
                    <option value="required">Required (mandatory on product listing)</option>
                    <option value="recommended">Recommended</option>
                    <option value="optional">Optional</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={attrDisplayOrder}
                    onChange={(e) => setAttrDisplayOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-secondary/40 border border-border rounded-xl text-sm focus:outline-none focus:border-emerald-500/60"
                  />
                </div>
              </div>

              {attrDataType === "number+unit" && (
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    Unit Options (comma-separated) *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. cm, inch, ft, gm, kg, litre"
                    value={attrUnitOptionsStr}
                    onChange={(e) => setAttrUnitOptionsStr(e.target.value)}
                    className="w-full px-3 py-2 bg-secondary/40 border border-border rounded-xl text-sm focus:outline-none focus:border-emerald-500/60 font-mono"
                  />
                </div>
              )}

              {(attrDataType === "dropdown" || attrDataType === "multi-select") && (
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    Dropdown Options (comma-separated) *
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Indoor, Outdoor, Flowering, Foliage, Succulent"
                    value={attrDropdownOptionsStr}
                    onChange={(e) => setAttrDropdownOptionsStr(e.target.value)}
                    className="w-full px-3 py-2 bg-secondary/40 border border-border rounded-xl text-sm focus:outline-none focus:border-emerald-500/60 font-mono"
                  />
                </div>
              )}

              <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-xl border border-border">
                <input
                  type="checkbox"
                  id="attrFilterableCheck"
                  checked={attrFilterable}
                  onChange={(e) => setAttrFilterable(e.target.checked)}
                  className="w-4 h-4 text-emerald-500 rounded focus:ring-emerald-400"
                />
                <label htmlFor="attrFilterableCheck" className="text-sm font-medium cursor-pointer">
                  Enable as Marketplace Search Filter
                  <span className="block text-xs text-muted-foreground font-normal">
                    When enabled, this attribute automatically appears in public category filter sidebars.
                  </span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => setShowAttrModal(false)}
                  className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded-xl shadow-lg shadow-emerald-950/40"
                >
                  Save Attribute
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
