"use client";

import { useState, useEffect, use } from "react";
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
  ArrowLeft,
  Sprout,
  Search,
  Check,
  X,
  Sparkles,
  Languages,
  Plus,
  Save,
  Tag,
  DollarSign,
  Boxes,
  HelpCircle,
  AlertCircle,
  Sun,
  Droplets,
  Heart,
  Thermometer,
  ImageIcon,
  FolderTree,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { PlantImageUploader } from "@/components/common/PlantImageUploader";

export default function AddPlantToStorePage({
  params,
}: {
  params: Promise<{ vendorId: string }>;
}) {
  const resolvedParams = use(params);
  const vendorId = resolvedParams.vendorId;
  const router = useRouter();

  const [vendor, setVendor] = useState<any | null>(null);
  const [loadingVendor, setLoadingVendor] = useState(true);

  // Categories & Dynamic Attributes (SOW 4a, 5.3)
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [subcategories, setSubcategories] = useState<CategoryItem[]>([]);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string>("");
  const [categoryAttributes, setCategoryAttributes] = useState<CategoryAttributeItem[]>([]);
  const [loadingAttributes, setLoadingAttributes] = useState(false);
  const [attributeValues, setAttributeValues] = useState<Record<string, any>>({});
  const [showOptionalAttributes, setShowOptionalAttributes] = useState(false);

  // Form Language Tabs
  const [formLang, setFormLang] = useState<"en" | "hi">("en");

  // Form Fields
  const [productName, setProductName] = useState("");
  const [productNameHi, setProductNameHi] = useState("");
  const [description, setDescription] = useState("");
  const [descriptionHi, setDescriptionHi] = useState("");
  const [careInstructionsHi, setCareInstructionsHi] = useState("");
  const [images, setImages] = useState<string[]>([]);

  const [price, setPrice] = useState<number | string>("");
  const [discountPrice, setDiscountPrice] = useState<number | string>("");
  const [stock, setStock] = useState<number | string>(10);
  const [submitting, setSubmitting] = useState(false);

  // Master Catalog Typeahead Autosuggest
  const [masterQuery, setMasterQuery] = useState("");
  const [masterSuggestions, setMasterSuggestions] = useState<any[]>([]);
  const [selectedMaster, setSelectedMaster] = useState<any | null>(null);
  const [searchingMaster, setSearchingMaster] = useState(false);

  // 1. Fetch Vendor Information
  useEffect(() => {
    const fetchVendor = async () => {
      try {
        setLoadingVendor(true);
        try {
          const res = await nurseryService.fetchVendorById(vendorId);
          setVendor(res?.data || res);
        } catch {
          const vendorsRes = await nurseryService.fetchVendors({ limit: 100 });
          const list = Array.isArray(vendorsRes?.data) ? vendorsRes.data : vendorsRes?.data?.data || [];
          const found = list.find((item: any) => item.id === vendorId);
          if (found) setVendor(found);
        }
      } catch (err) {
        console.error("Failed to load vendor", err);
      } finally {
        setLoadingVendor(false);
      }
    };
    if (vendorId) fetchVendor();
  }, [vendorId]);

  // 2. Fetch Categories on Mount
  useEffect(() => {
    const loadCategories = async () => {
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

        // Default to "Plants" category or first available
        if (list.length > 0) {
          const defaultCat = list.find((c) => c.slug === "plants") || list[0];
          setSelectedCategoryId(defaultCat.id);
          setSubcategories(defaultCat.subcategories || []);
          if (defaultCat.subcategories && defaultCat.subcategories.length > 0) {
            setSelectedSubcategoryId(defaultCat.subcategories[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load categories for product form", err);
      }
    };
    loadCategories();
  }, []);

  // 3. Load Category Attributes whenever selectedCategoryId changes (SOW 5.3)
  useEffect(() => {
    if (!selectedCategoryId) return;

    const loadAttrs = async () => {
      try {
        setLoadingAttributes(true);
        const res = await categoryService.fetchCategoryAttributes(selectedCategoryId);
        const attrs: CategoryAttributeItem[] = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
          ? res
          : [];
        setCategoryAttributes(attrs);

        // Initialize default attribute values for attributes that have units or default options
        setAttributeValues((prev) => {
          const initial: Record<string, any> = { ...prev };
          attrs.forEach((a) => {
            if (a.dataType === "number+unit" && a.unitOptions?.length > 0) {
              if (!initial[a.attributeName] || typeof initial[a.attributeName] !== "object") {
                initial[a.attributeName] = {
                  value: initial[a.attributeName] || "",
                  unit: a.unitOptions[0],
                };
              }
            }
          });
          return initial;
        });
      } catch (err) {
        console.error("Failed to load category attributes", err);
        setCategoryAttributes([]);
      } finally {
        setLoadingAttributes(false);
      }
    };

    loadAttrs();
  }, [selectedCategoryId]);

  // Handle Category selection change
  const handleCategoryChange = (catId: string) => {
    setSelectedCategoryId(catId);
    const cat = categories.find((c) => c.id === catId);
    if (cat && Array.isArray(cat.subcategories)) {
      setSubcategories(cat.subcategories);
      setSelectedSubcategoryId(cat.subcategories[0]?.id || "");
    } else {
      setSubcategories([]);
      setSelectedSubcategoryId("");
    }
  };

  // Helper to update individual attribute value
  const handleAttributeChange = (attributeName: string, val: any) => {
    setAttributeValues((prev) => {
      const next = {
        ...prev,
        [attributeName]: val,
      };
      if (
        attributeName === "Flowering / Non-Flowering" &&
        (val === false || val === "false" || val === "No" || val === "no")
      ) {
        delete next["Flower Color"];
        delete next["Flowering Season"];
      }
      return next;
    });
  };

  // 4. Debounced Master Catalog Search
  useEffect(() => {
    if (!masterQuery || masterQuery.trim().length < 2) {
      setMasterSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        setSearchingMaster(true);
        const res = await nurseryService.searchMasterProducts(masterQuery.trim());
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setMasterSuggestions(list);
      } catch (err) {
        console.error("Master catalog search failed", err);
      } finally {
        setSearchingMaster(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [masterQuery]);

  // 5. Select from Master Catalog (Autofills name, images, specs & category)
  const handleSelectMaster = (master: any) => {
    setSelectedMaster(master);
    setProductName(master.name || "");
    if (master.translations?.hi?.name) {
      setProductNameHi(master.translations.hi.name);
    }
    if (master.translations?.hi?.description) {
      setDescriptionHi(master.translations.hi.description);
    }
    if (master.translations?.hi?.careInstructions) {
      setCareInstructionsHi(master.translations.hi.careInstructions);
    }
    if (master.description) {
      setDescription(master.description);
    }
    if (Array.isArray(master.referenceImages) && master.referenceImages.length > 0) {
      setImages(master.referenceImages);
    } else if (master.thumbnailUrl) {
      setImages([master.thumbnailUrl]);
    }

    // Auto-match Category if suggestedCategory matches
    if (master.suggestedCategory && categories.length > 0) {
      const matchCat = categories.find(
        (c) =>
          c.name.toLowerCase() === master.suggestedCategory.toLowerCase() ||
          c.slug === master.suggestedCategory.toLowerCase(),
      );
      if (matchCat) {
        setSelectedCategoryId(matchCat.id);
        setSubcategories(matchCat.subcategories || []);
      }
    }

    // Auto-fill specifications into attributeValues
    if (master.specifications && typeof master.specifications === "object") {
      setAttributeValues((prev) => ({
        ...prev,
        ...master.specifications,
      }));
    }

    setMasterSuggestions([]);
    setMasterQuery("");
    toast.success(`Autofilled from Master Catalog: "${master.name}"`);
  };

  const handleClearMasterLink = () => {
    setSelectedMaster(null);
  };

  // 6. Submit Product
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!productName.trim()) {
      toast.error("Please provide a plant name (English)");
      return;
    }
    if (!price || Number(price) <= 0) {
      toast.error("Please provide a valid selling price");
      return;
    }
    if (stock === "" || Number(stock) < 0) {
      toast.error("Please provide a valid stock quantity");
      return;
    }

    // Validate Required Category Attributes
    const missingRequired = categoryAttributes.filter((attr) => {
      if (attr.requiredLevel !== "required") return false;
      const val = attributeValues[attr.attributeName];
      if (val === undefined || val === null || val === "") return true;
      if (attr.dataType === "number+unit" && (!val.value || val.value === "")) return true;
      return false;
    });

    if (missingRequired.length > 0) {
      toast.error(
        `Please fill mandatory attribute: ${missingRequired[0].attributeName}`,
      );
      return;
    }

    try {
      setSubmitting(true);
      const stockNumber = Number(stock);
      const payload: any = {
        name: productName.trim(),
        description: description.trim() || undefined,
        categoryId: selectedCategoryId || undefined,
        subcategoryId: selectedSubcategoryId || undefined,
        attributes: attributeValues,
        price: Number(price),
        discountPrice:
          discountPrice !== "" && discountPrice !== null && discountPrice !== undefined
            ? Number(discountPrice)
            : undefined,
        stock: stockNumber,
        stockQuantity: stockNumber,
        masterProductId: selectedMaster?.id || undefined,
        images:
          images.length > 0
            ? images
            : (selectedMaster?.referenceImages || (selectedMaster?.thumbnailUrl ? [selectedMaster.thumbnailUrl] : [])),
        translations: {
          hi: {
            name: productNameHi.trim() || undefined,
            description: descriptionHi.trim() || undefined,
            careInstructions: careInstructionsHi.trim() || undefined,
          },
        },
      };

      await nurseryService.createVendorProduct(vendorId, payload);
      toast.success(`Plant "${productName}" successfully added with category attributes!`);
      router.push(`/nursery-vendors/${vendorId}/inventory`);
    } catch (err: any) {
      console.error("Failed to add product", err);
      toast.error(err?.response?.data?.message || "Failed to add plant to store");
    } finally {
      setSubmitting(false);
    }
  };

  const isAttributeVisible = (attrName: string) => {
    const flowVal = attributeValues["Flowering / Non-Flowering"];
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

  // Group attributes into Required/Recommended vs Optional
  const primaryAttributes = categoryAttributes
    .filter((a) => isAttributeVisible(a.attributeName))
    .filter(
      (a) => a.requiredLevel === "required" || a.requiredLevel === "recommended",
    );
  const optionalAttributes = categoryAttributes
    .filter((a) => isAttributeVisible(a.attributeName))
    .filter(
      (a) => a.requiredLevel === "optional",
    );

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 animate-in fade-in duration-200">
      {/* ─── Breadcrumbs & Header ────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <Link
          href={`/nursery-vendors/${vendorId}/inventory`}
          className="p-2.5 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link href="/nursery-vendors" className="hover:text-foreground">
              Nursery Stores
            </Link>
            <span>/</span>
            <Link
              href={`/nursery-vendors/${vendorId}/inventory`}
              className="hover:text-foreground"
            >
              {vendor?.storeName || "Store Inventory"}
            </Link>
            <span>/</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              Add Plant
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight mt-0.5">
            Add Plant to {vendor?.storeName || "Store"}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ─── Section 1: Master Botanical Catalog Linkage ─────────────────────── */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-foreground">
                  Master Botanical Catalog Autosuggest
                </h3>
                <p className="text-xs text-muted-foreground">
                  Type any plant name in English or Hindi to auto-fill verified specs, reference photos & care guides.
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/25">
              76 Master Varieties Ready
            </span>
          </div>

          {/* Master Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search master plants: e.g. Peace Lily, Snake Plant, अरेका पाम, Monstera, Jade..."
              value={masterQuery}
              onChange={(e) => setMasterQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-3 text-sm rounded-2xl border border-border bg-background focus:ring-2 focus:ring-emerald-500/25 font-medium transition-all"
            />
            {masterQuery && (
              <button
                type="button"
                onClick={() => setMasterQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Autosuggest Dropdown */}
            {masterSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 z-30 bg-card border border-border rounded-2xl shadow-xl overflow-hidden max-h-72 overflow-y-auto divide-y divide-border">
                {masterSuggestions.map((m) => {
                  const thumb = m.thumbnailUrl || m.referenceImages?.[0];
                  const hiName = m.translations?.hi?.name;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleSelectMaster(m)}
                      className="w-full text-left p-3.5 hover:bg-emerald-500/10 transition-colors flex items-center justify-between gap-3 group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-muted overflow-hidden shrink-0 flex items-center justify-center border border-border/80">
                          {thumb ? (
                            <img src={thumb} alt={m.name} className="w-full h-full object-cover" />
                          ) : (
                            <Sprout className="w-5 h-5 text-emerald-600/50" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-foreground text-sm flex items-center gap-2">
                            <span>{m.name}</span>
                            {hiName && (
                              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                                ({hiName})
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                            {m.scientificName && (
                              <span className="italic">{m.scientificName}</span>
                            )}
                            {m.suggestedCategory && (
                              <span className="px-2 py-0.5 rounded-full bg-secondary text-[11px]">
                                {m.suggestedCategory}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 group-hover:underline flex items-center gap-1">
                        Use Spec
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Active Master Link Card */}
          {selectedMaster && (
            <div className="flex items-center justify-between p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 rounded-xl">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                    Linked to Master Variety
                  </div>
                  <div className="text-sm font-bold text-foreground">
                    {selectedMaster.name}
                    {selectedMaster.scientificName && (
                      <span className="text-xs font-normal text-muted-foreground ml-2 italic">
                        ({selectedMaster.scientificName})
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClearMasterLink}
                className="text-xs font-bold text-muted-foreground hover:text-rose-500 px-3 py-1.5 rounded-xl border border-border bg-background hover:bg-rose-500/10 transition-colors"
              >
                Unlink Master
              </button>
            </div>
          )}
        </div>

        {/* ─── Section 2: Category & Subcategory Selection (SOW 5.3) ───────────── */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-2xs space-y-5">
          <div className="flex items-center gap-2 border-b border-border pb-4">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <FolderTree className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-foreground">
                Category & Classification
              </h3>
              <p className="text-xs text-muted-foreground">
                Selecting a Category loads its dynamic attributes schema automatically.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                Primary Category <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={selectedCategoryId}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-background focus:ring-2 focus:ring-emerald-500/25 font-semibold text-foreground cursor-pointer"
              >
                <option value="">Select a Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                Subcategory
              </label>
              <select
                value={selectedSubcategoryId}
                onChange={(e) => setSelectedSubcategoryId(e.target.value)}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-background focus:ring-2 focus:ring-emerald-500/25 font-semibold text-foreground cursor-pointer"
              >
                <option value="">Select Subcategory (Optional)</option>
                {subcategories.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ─── Section 3: Dynamic Category Attributes Schema (SOW 4a, 5.3) ─────── */}
        {categoryAttributes.length > 0 && (
          <div className="bg-card border border-border rounded-3xl p-6 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-foreground">
                    Dynamic Category Attributes
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Fields driven by the selected category schema. Filterable attributes power customer marketplace filters.
                  </p>
                </div>
              </div>

              <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
                {categoryAttributes.length} specs configured
              </span>
            </div>

            {loadingAttributes ? (
              <div className="text-center py-6 text-sm text-muted-foreground">
                Loading category attributes...
              </div>
            ) : (
              <div className="space-y-6">
                {/* Required & Recommended Attributes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {primaryAttributes.map((attr) => {
                    const currentVal = attributeValues[attr.attributeName];
                    const isRequired = attr.requiredLevel === "required";

                    return (
                      <div key={attr.id} className="space-y-1.5">
                        <label className="flex items-center justify-between text-xs font-bold text-foreground">
                          <span className="flex items-center gap-1.5">
                            {attr.attributeName}
                            {isRequired && <span className="text-rose-500">*</span>}
                          </span>
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                            {attr.requiredLevel}
                          </span>
                        </label>

                        {/* 1. Dropdown */}
                        {attr.dataType === "dropdown" && (
                          <select
                            value={currentVal || ""}
                            onChange={(e) =>
                              handleAttributeChange(attr.attributeName, e.target.value)
                            }
                            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border bg-background focus:ring-2 focus:ring-emerald-500/25"
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
                              placeholder="e.g. 30"
                              value={typeof currentVal === "object" ? currentVal?.value ?? "" : currentVal ?? ""}
                              onChange={(e) =>
                                handleAttributeChange(attr.attributeName, {
                                  value: e.target.value,
                                  unit:
                                    typeof currentVal === "object" && currentVal?.unit
                                      ? currentVal.unit
                                      : attr.unitOptions?.[0] || "",
                                })
                              }
                              className="flex-1 px-3.5 py-2.5 text-sm rounded-xl border border-border bg-background focus:ring-2 focus:ring-emerald-500/25"
                            />
                            <select
                              value={typeof currentVal === "object" ? currentVal?.unit ?? attr.unitOptions?.[0] : attr.unitOptions?.[0]}
                              onChange={(e) =>
                                handleAttributeChange(attr.attributeName, {
                                  value: typeof currentVal === "object" ? currentVal?.value ?? "" : currentVal ?? "",
                                  unit: e.target.value,
                                })
                              }
                              className="w-24 px-2 py-2.5 text-xs font-mono font-bold rounded-xl border border-border bg-secondary focus:ring-2 focus:ring-emerald-500/25"
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
                              onClick={() => handleAttributeChange(attr.attributeName, true)}
                              className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                                currentVal === true
                                  ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                                  : "bg-secondary text-muted-foreground border-border hover:text-foreground"
                              }`}
                            >
                              Yes
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAttributeChange(attr.attributeName, false)}
                              className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                                currentVal === false
                                  ? "bg-rose-600 text-white border-rose-600 shadow-sm"
                                  : "bg-secondary text-muted-foreground border-border hover:text-foreground"
                              }`}
                            >
                              No
                            </button>
                          </div>
                        )}

                        {/* 4. Multi-Select */}
                        {attr.dataType === "multi-select" && (
                          <div className="flex flex-wrap gap-1.5 p-2 rounded-xl border border-border bg-background/50 min-h-[42px]">
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
                                    handleAttributeChange(attr.attributeName, next);
                                  }}
                                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                                    selected
                                      ? "bg-blue-500/20 text-blue-400 border-blue-500/40"
                                      : "bg-secondary text-muted-foreground border-border hover:text-foreground"
                                  }`}
                                >
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* 5. Plain Text / Rich Text */}
                        {(attr.dataType === "text" || attr.dataType === "rich-text") && (
                          <input
                            type="text"
                            placeholder={`Enter ${attr.attributeName}...`}
                            value={currentVal || ""}
                            onChange={(e) =>
                              handleAttributeChange(attr.attributeName, e.target.value)
                            }
                            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border bg-background focus:ring-2 focus:ring-emerald-500/25"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Optional Attributes Accordion */}
                {optionalAttributes.length > 0 && (
                  <div className="pt-2 border-t border-border/80">
                    <button
                      type="button"
                      onClick={() => setShowOptionalAttributes((p) => !p)}
                      className="flex items-center justify-between w-full p-2.5 text-xs font-bold text-muted-foreground hover:text-foreground rounded-xl bg-secondary/30 transition-colors"
                    >
                      <span className="flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5" />
                        Additional Specifications ({optionalAttributes.length} optional fields)
                      </span>
                      {showOptionalAttributes ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>

                    {showOptionalAttributes && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 animate-in fade-in">
                        {optionalAttributes.map((attr) => {
                          const currentVal = attributeValues[attr.attributeName];
                          return (
                            <div key={attr.id} className="space-y-1.5">
                              <label className="block text-xs font-bold text-muted-foreground">
                                {attr.attributeName}
                              </label>

                              {attr.dataType === "dropdown" ? (
                                <select
                                  value={currentVal || ""}
                                  onChange={(e) =>
                                    handleAttributeChange(attr.attributeName, e.target.value)
                                  }
                                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-background focus:ring-2 focus:ring-emerald-500/25"
                                >
                                  <option value="">Select {attr.attributeName}</option>
                                  {attr.dropdownOptions?.map((opt) => (
                                    <option key={opt} value={opt}>
                                      {opt}
                                    </option>
                                  ))}
                                </select>
                              ) : attr.dataType === "number+unit" ? (
                                <div className="flex gap-2">
                                  <input
                                    type="number"
                                    min={0}
                                    placeholder="Value"
                                    value={typeof currentVal === "object" ? currentVal?.value ?? "" : currentVal ?? ""}
                                    onChange={(e) =>
                                      handleAttributeChange(attr.attributeName, {
                                        value: e.target.value,
                                        unit:
                                          typeof currentVal === "object" && currentVal?.unit
                                            ? currentVal.unit
                                            : attr.unitOptions?.[0] || "",
                                      })
                                    }
                                    className="flex-1 px-3 py-2 text-sm rounded-xl border border-border bg-background focus:ring-2 focus:ring-emerald-500/25"
                                  />
                                  <select
                                    value={typeof currentVal === "object" ? currentVal?.unit ?? attr.unitOptions?.[0] : attr.unitOptions?.[0]}
                                    onChange={(e) =>
                                      handleAttributeChange(attr.attributeName, {
                                        value: typeof currentVal === "object" ? currentVal?.value ?? "" : currentVal ?? "",
                                        unit: e.target.value,
                                      })
                                    }
                                    className="w-20 px-2 py-2 text-xs font-mono rounded-xl border border-border bg-secondary"
                                  >
                                    {attr.unitOptions?.map((u) => (
                                      <option key={u} value={u}>
                                        {u}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              ) : (
                                <input
                                  type="text"
                                  placeholder={`Enter ${attr.attributeName}...`}
                                  value={currentVal || ""}
                                  onChange={(e) =>
                                    handleAttributeChange(attr.attributeName, e.target.value)
                                  }
                                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-background focus:ring-2 focus:ring-emerald-500/25"
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
          </div>
        )}

        {/* ─── Section 4: Bilingual Plant Details (English & Hindi) ────────────── */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
            <div>
              <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
                <Languages className="w-4 h-4 text-emerald-600" />
                Plant Information & Descriptions
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Provide product details in English and Hindi for customer app browsing.
              </p>
            </div>

            {/* Language Switcher Tabs */}
            <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-xl border border-border/80 w-fit">
              <button
                type="button"
                onClick={() => setFormLang("en")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  formLang === "en"
                    ? "bg-background text-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                🇬🇧 English (Primary)
                {productName && <Check className="w-3 h-3 text-emerald-500" />}
              </button>
              <button
                type="button"
                onClick={() => setFormLang("hi")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  formLang === "hi"
                    ? "bg-background text-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                🇮🇳 हिन्दी (Hindi)
                {productNameHi && <Check className="w-3 h-3 text-emerald-500" />}
              </button>
            </div>
          </div>

          {formLang === "en" ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  Product Name (English) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Peace Lily Plant, Monstera Deliciosa, Jade Mini Plant..."
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-background focus:ring-2 focus:ring-emerald-500/25 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  Short Description (English)
                </label>
                <textarea
                  rows={3}
                  placeholder="Brief description highlighting plant aesthetic, air purification, or decor suitability..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-background focus:ring-2 focus:ring-emerald-500/25"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  पौधे का नाम (Hindi Name)
                </label>
                <input
                  type="text"
                  placeholder="उदा. पीस लिली का पौधा, अरेका पाम, गोल्डन मनी प्लांट..."
                  value={productNameHi}
                  onChange={(e) => setProductNameHi(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-background focus:ring-2 focus:ring-emerald-500/25 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  पौधे का विवरण (Hindi Description)
                </label>
                <textarea
                  rows={2}
                  placeholder="पौधे का आकर्षक और संक्षिप्त विवरण हिन्दी में..."
                  value={descriptionHi}
                  onChange={(e) => setDescriptionHi(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-background focus:ring-2 focus:ring-emerald-500/25"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  देखभाल संबंधी निर्देश (Hindi Care Guide)
                </label>
                <textarea
                  rows={2}
                  placeholder="उदा. कम धूप में रखें, हफ्ते में दो बार पानी दें, सूखी पत्तियां हटाते रहें..."
                  value={careInstructionsHi}
                  onChange={(e) => setCareInstructionsHi(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-background focus:ring-2 focus:ring-emerald-500/25"
                />
              </div>
            </div>
          )}
        </div>

        {/* ─── Section 5: Pricing & Stock Inventory ────────────────────────────── */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-4">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-foreground">
                Pricing & Store Inventory Stock
              </h3>
              <p className="text-xs text-muted-foreground">
                Set retail price, promotional discount, and available live nursery stock.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                Selling Price (₹) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">
                  ₹
                </span>
                <input
                  type="number"
                  required
                  min={1}
                  step="any"
                  placeholder="299"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 text-sm rounded-xl border border-border bg-background focus:ring-2 focus:ring-emerald-500/25 font-bold text-emerald-600 dark:text-emerald-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                Discount / Offer Price (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">
                  ₹
                </span>
                <input
                  type="number"
                  min={1}
                  step="any"
                  placeholder="249 (Optional)"
                  value={discountPrice}
                  onChange={(e) => setDiscountPrice(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 text-sm rounded-xl border border-border bg-background focus:ring-2 focus:ring-emerald-500/25 font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                Current Stock Quantity <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Boxes className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="number"
                  required
                  min={0}
                  placeholder="10"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-border bg-background focus:ring-2 focus:ring-emerald-500/25 font-bold"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ─── Section 6: Plant Photographs ────────────────────────────────────── */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <ImageIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-foreground">
                  Plant Photos & Gallery
                </h3>
                <p className="text-xs text-muted-foreground">
                  Upload nursery photos or use master reference images.
                </p>
              </div>
            </div>
            {selectedMaster && images.length > 0 && (
              <span className="text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full">
                Auto-imported {images.length} photos
              </span>
            )}
          </div>

          <PlantImageUploader
            images={images}
            onChange={(newUrls) => setImages(newUrls)}
            maxImages={6}
          />
        </div>

        {/* ─── Form Action Buttons ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link
            href={`/nursery-vendors/${vendorId}/inventory`}
            className="px-5 py-2.5 text-sm font-semibold rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/40 hover:shadow-xl transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {submitting ? "Adding Plant..." : "Save Plant to Store"}
          </button>
        </div>
      </form>
    </div>
  );
}
