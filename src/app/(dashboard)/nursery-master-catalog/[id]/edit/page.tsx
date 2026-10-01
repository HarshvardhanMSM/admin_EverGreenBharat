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
  Check,
  X,
  Languages,
  Save,
  FolderTree,
  SlidersHorizontal,
  Sun,
  Droplets,
  Heart,
  Thermometer,
  Sparkles,
  Info,
  Loader2,
  Pencil,
  Clock,
  Layers,
} from "lucide-react";
import { PlantImageUploader } from "@/components/common/PlantImageUploader";

export default function EditMasterPlantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [plantRecord, setPlantRecord] = useState<any | null>(null);

  // Categories & Dynamic Attributes
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [subcategories, setSubcategories] = useState<CategoryItem[]>([]);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string>("");
  const [categoryAttributes, setCategoryAttributes] = useState<CategoryAttributeItem[]>([]);
  const [loadingAttributes, setLoadingAttributes] = useState(false);
  const [attributeValues, setAttributeValues] = useState<Record<string, any>>({});

  // Language Tabs
  const [formLang, setFormLang] = useState<"en" | "hi">("en");

  // Form Fields - English
  const [name, setName] = useState("");
  const [scientificName, setScientificName] = useState("");
  const [description, setDescription] = useState("");
  const [careInstructions, setCareInstructions] = useState("");

  // Form Fields - Hindi
  const [nameHi, setNameHi] = useState("");
  const [descriptionHi, setDescriptionHi] = useState("");
  const [careInstructionsHi, setCareInstructionsHi] = useState("");

  // Botanical Standard Specs
  const [careLevel, setCareLevel] = useState("Easy");
  const [sunlight, setSunlight] = useState("Medium Indirect");
  const [waterRequirement, setWaterRequirement] = useState("When top 1 inch is dry");
  const [indoorOutdoor, setIndoorOutdoor] = useState<"Indoor" | "Outdoor" | "Both">("Both");
  const [petFriendly, setPetFriendly] = useState<boolean>(false);
  const [idealTemperature, setIdealTemperature] = useState("18-32°C");
  const [synonyms, setSynonyms] = useState("");

  // Media
  const [images, setImages] = useState<string[]>([]);

  // 1. Fetch Categories and Master Plant Detail
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Fetch categories
        const catRes = await categoryService.fetchCategories({
          activeOnly: true,
          parentOnly: true,
          limit: 100,
        });
        const catList: CategoryItem[] = Array.isArray(catRes?.data?.data)
          ? catRes.data.data
          : Array.isArray(catRes?.data)
          ? catRes.data
          : Array.isArray(catRes)
          ? catRes
          : [];
        setCategories(catList);

        // Fetch master product
        const plantRes = await nurseryService.fetchMasterProductById(id);
        const plant = plantRes?.data || plantRes;
        setPlantRecord(plant);

        // Populate fields
        setName(plant.name || "");
        setScientificName(plant.scientificName || "");
        setDescription(plant.description || "");

        // Translations
        const hiTrans = plant.translations?.hi || {};
        setNameHi(hiTrans.name || "");
        setDescriptionHi(hiTrans.description || "");
        setCareInstructionsHi(hiTrans.careInstructions || "");
        if (hiTrans.name) {
          setFormLang("hi");
        }

        // Specs & Attributes
        const specs = plant.specifications || {};
        const attrs = plant.attributes || {};
        const combined = { ...specs, ...attrs };

        setAttributeValues(combined);
        if (combined.careLevel) setCareLevel(combined.careLevel);
        if (combined.sunlight) setSunlight(combined.sunlight);
        if (combined.waterRequirement) setWaterRequirement(combined.waterRequirement);
        if (combined.indoorOutdoor) setIndoorOutdoor(combined.indoorOutdoor);
        if (combined.petFriendly !== undefined) setPetFriendly(Boolean(combined.petFriendly));
        if (combined.idealTemperature) setIdealTemperature(combined.idealTemperature);

        const synList = combined.commonSynonyms || plant.specifications?.commonSynonyms;
        if (Array.isArray(synList)) {
          setSynonyms(synList.join(", "));
        }

        // Category selection
        const cId = plant.categoryId || plant.category?.id || "";
        setSelectedCategoryId(cId);

        const subId = plant.subcategoryId || plant.subcategory?.id || "";
        setSelectedSubcategoryId(subId);

        if (cId) {
          const foundCat = catList.find((c) => c.id === cId);
          if (foundCat && Array.isArray(foundCat.subcategories) && foundCat.subcategories.length > 0) {
            setSubcategories(foundCat.subcategories);
          } else {
            categoryService
              .fetchSubcategories(cId)
              .then((subRes) => {
                const subs = Array.isArray(subRes?.data?.data)
                  ? subRes.data.data
                  : Array.isArray(subRes?.data)
                  ? subRes.data
                  : Array.isArray(subRes)
                  ? subRes
                  : [];
                setSubcategories(subs);
              })
              .catch(() => setSubcategories([]));
          }
        }

        // Reference Images
        const refImgs = plant.referenceImages || [];
        setImages(Array.isArray(refImgs) ? refImgs : []);
      } catch (err: any) {
        toast.error("Failed to load master botanical plant record");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  // 2. Fetch Category Attributes when category is changed or loaded
  useEffect(() => {
    if (!selectedCategoryId) {
      setCategoryAttributes([]);
      return;
    }

    const cat = categories.find((c) => c.id === selectedCategoryId);
    if (cat && Array.isArray(cat.subcategories) && cat.subcategories.length > 0) {
      setSubcategories(cat.subcategories);
    } else {
      categoryService
        .fetchSubcategories(selectedCategoryId)
        .then((res) => {
          const subs: CategoryItem[] = Array.isArray(res?.data?.data)
            ? res.data.data
            : Array.isArray(res?.data)
            ? res.data
            : Array.isArray(res)
            ? res
            : [];
          setSubcategories(subs);
        })
        .catch(() => setSubcategories([]));
    }

    setLoadingAttributes(true);
    categoryService
      .fetchCategoryAttributes(selectedCategoryId)
      .then((res) => {
        const attrs: CategoryAttributeItem[] = Array.isArray(res?.data?.data)
          ? res.data.data
          : Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
          ? res
          : [];
        setCategoryAttributes(attrs);
      })
      .catch(() => setCategoryAttributes([]))
      .finally(() => setLoadingAttributes(false));
  }, [selectedCategoryId, categories]);

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

  const handleAttributeChange = (attributeName: string, val: any) => {
    setAttributeValues((prev) => {
      const next = {
        ...prev,
        [attributeName]: val,
      };
      // If user marks plant as Non-Flowering (No), hide and clear flower color & season fields
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Plant common name in English is required");
      setFormLang("en");
      return;
    }

    if (!description.trim()) {
      toast.error("Botanical description in English is required");
      setFormLang("en");
      return;
    }

    try {
      setSubmitting(true);

      const parsedSynonyms = synonyms
        ? synonyms
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [];

      await nurseryService.updateMasterProduct(id, {
        name: name.trim(),
        scientificName: scientificName.trim() || undefined,
        description: description.trim(),
        categoryId: selectedCategoryId || undefined,
        subcategoryId: selectedSubcategoryId || undefined,
        attributes: {
          ...attributeValues,
          sunlight,
          careLevel,
          waterRequirement,
          indoorOutdoor,
          petFriendly,
          idealTemperature,
          ...(parsedSynonyms.length > 0 ? { commonSynonyms: parsedSynonyms } : {}),
        },
        specifications: {
          careLevel,
          sunlight,
          waterRequirement,
          indoorOutdoor,
          petFriendly,
          idealTemperature,
          commonSynonyms: parsedSynonyms,
          ...attributeValues,
        },
        referenceImages: images,
        translations: {
          ...(plantRecord?.translations || {}),
          hi: {
            name: nameHi.trim() || undefined,
            description: descriptionHi.trim() || undefined,
            careInstructions: careInstructionsHi.trim() || undefined,
          },
        },
      });

      toast.success("Master Botanical Plant updated successfully!");
      router.push("/nursery-master-catalog");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to update master plant",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-12 text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto" />
        <p className="text-sm font-semibold text-muted-foreground">
          Loading botanical plant specifications...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 animate-in fade-in duration-300">
      {/* ─── Breadcrumb & Top Bar ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link
              href="/nursery-master-catalog"
              className="hover:text-foreground transition-colors flex items-center gap-1 font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Master Catalog
            </Link>
            <span>/</span>
            <span className="text-foreground font-semibold truncate max-w-[200px]">
              {plantRecord?.name || "Edit Plant"}
            </span>
            <span>/</span>
            <span className="text-emerald-600 font-bold">Edit Details</span>
          </div>

          <div className="flex items-center gap-2.5 pt-1">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/10 border border-emerald-500/20 text-emerald-600 flex items-center justify-center font-bold">
              <Pencil className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
                Edit Master Botanical Plant
                {plantRecord?.usageCount > 0 && (
                  <span className="text-xs bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20 px-2 py-0.5 rounded-full font-bold">
                    Used by {plantRecord.usageCount} stores
                  </span>
                )}
              </h1>
              <p className="text-xs text-muted-foreground">
                Update verified canonical specifications, multilingual names, and category attributes for this plant entry.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/nursery-master-catalog"
            className="px-4 py-2 text-xs font-bold rounded-xl border border-border bg-card hover:bg-muted text-foreground transition-colors"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving Changes...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ─── CARD 1: Bilingual Plant Information ───────────────────────────── */}
        <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Languages className="w-4 h-4 text-emerald-600" />
                Plant Identity & Bilingual Details
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Manage names, botanical descriptions, and care guidelines in English and Hindi.
              </p>
            </div>

            {/* Language Switcher Tabs */}
            <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border shrink-0">
              <button
                type="button"
                onClick={() => setFormLang("en")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  formLang === "en"
                    ? "bg-foreground text-background shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>🇬🇧</span>
                <span>English (Primary)</span>
                {name && <Check className="w-3 h-3 text-emerald-400" />}
              </button>
              <button
                type="button"
                onClick={() => setFormLang("hi")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  formLang === "hi"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>🇮🇳</span>
                <span>हिन्दी (Hindi)</span>
                {nameHi && <Check className="w-3 h-3 text-emerald-200" />}
              </button>
            </div>
          </div>

          {/* English Tab */}
          {formLang === "en" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">
                    Plant Common Name (English) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Fiddle Leaf Fig, Golden Pothos, Monstera Deliciosa"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-background focus:ring-2 focus:ring-emerald-500/25 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">
                    Scientific / Botanical Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ficus lyrata, Epipremnum aureum"
                    value={scientificName}
                    onChange={(e) => setScientificName(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-background font-mono focus:ring-2 focus:ring-emerald-500/25 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  Botanical Description (English) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Comprehensive description of the plant variety, foliage characteristics, growth habits, and care tips..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-border bg-background focus:ring-2 focus:ring-emerald-500/25 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  Care Guidelines & Watering Instructions (English)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Water thoroughly when top 2 inches of potting mix feel dry to touch. Mist leaves weekly."
                  value={careInstructions}
                  onChange={(e) => setCareInstructions(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-border bg-background focus:ring-2 focus:ring-emerald-500/25 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  Common Synonyms & Local Aliases (Comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Money Tree, Lucky Plant, Devil's Ivy, Swiss Cheese Plant"
                  value={synonyms}
                  onChange={(e) => setSynonyms(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-border bg-background focus:ring-2 focus:ring-emerald-500/25 focus:outline-hidden"
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  Used by mobile search and autosuggest typeahead.
                </p>
              </div>
            </div>
          )}

          {/* Hindi Tab */}
          {formLang === "hi" && (
            <div className="space-y-4 animate-in fade-in duration-150 bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/20">
              <div className="text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                <span>🇮🇳</span> हिन्दी विवरण (Hindi Plant Specifications)
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  पौधे का नाम (Hindi Name)
                </label>
                <input
                  type="text"
                  placeholder="उदाहरण: फिडल लीफ फिग, मनी प्लांट, स्नेक प्लांट, जेड प्लांट"
                  value={nameHi}
                  onChange={(e) => setNameHi(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-emerald-500/30 bg-background focus:ring-2 focus:ring-emerald-500/25 focus:outline-hidden font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  पौधे का विवरण (Hindi Description)
                </label>
                <textarea
                  rows={4}
                  placeholder="पौधे की विशेषताएं, धूप, पानी और देखभाल के निर्देश हिन्दी में..."
                  value={descriptionHi}
                  onChange={(e) => setDescriptionHi(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-emerald-500/30 bg-background focus:ring-2 focus:ring-emerald-500/25 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  देखभाल निर्देश (Hindi Care Instructions)
                </label>
                <input
                  type="text"
                  placeholder="उदाहरण: सप्ताह में एक बार पानी दें, तेज धूप से बचाएं और हवादार कमरे में रखें।"
                  value={careInstructionsHi}
                  onChange={(e) => setCareInstructionsHi(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-emerald-500/30 bg-background focus:ring-2 focus:ring-emerald-500/25 focus:outline-hidden"
                />
              </div>
            </div>
          )}
        </div>

        {/* ─── CARD 2: Taxonomy & Classification ─────────────────────────────── */}
        <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3.5">
            <FolderTree className="w-4 h-4 text-emerald-600" />
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Category & Classification
              </h3>
              <p className="text-xs text-muted-foreground">
                Assign botanical classification to enable category-specific attributes and structured catalog navigation.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                Primary Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedCategoryId}
                onChange={(e) => {
                  const catId = e.target.value;
                  setSelectedCategoryId(catId);
                  setSelectedSubcategoryId("");
                }}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-border bg-background focus:ring-2 focus:ring-emerald-500/25"
              >
                <option value="">Select Primary Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                Subcategory
              </label>
              <select
                value={selectedSubcategoryId}
                onChange={(e) => setSelectedSubcategoryId(e.target.value)}
                disabled={subcategories.length === 0}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-border bg-background focus:ring-2 focus:ring-emerald-500/25 disabled:opacity-50"
              >
                <option value="">None / General Variety</option>
                {subcategories.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ─── CARD 3: Standard Botanical Attributes ─────────────────────────── */}
        <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3.5">
            <Sun className="w-4 h-4 text-amber-500" />
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Standard Care & Environmental Specs
              </h3>
              <p className="text-xs text-muted-foreground">
                Core plant specifications used by nursery vendors for automated spec sheets and customer care guides.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-foreground block mb-1">
                Care Level
              </label>
              <select
                value={careLevel}
                onChange={(e) => setCareLevel(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background focus:ring-2 focus:ring-emerald-500/25"
              >
                <option value="Easy">Easy (Beginner Friendly)</option>
                <option value="Moderate">Moderate (Intermediate)</option>
                <option value="Expert">Expert (Delicate Care)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-foreground block mb-1">
                Sunlight Requirement
              </label>
              <select
                value={sunlight}
                onChange={(e) => setSunlight(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background focus:ring-2 focus:ring-emerald-500/25"
              >
                <option value="Direct Sunlight">Full Direct Sun</option>
                <option value="Medium Indirect">Bright Indirect Light</option>
                <option value="Low Light">Low Light Tolerant</option>
                <option value="Partial Shade">Partial Shade</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-foreground block mb-1">
                Water Requirement
              </label>
              <select
                value={waterRequirement}
                onChange={(e) => setWaterRequirement(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background focus:ring-2 focus:ring-emerald-500/25"
              >
                <option value="Daily">Daily Watering</option>
                <option value="When top 1 inch is dry">When top 1 inch is dry (2-3 days)</option>
                <option value="Weekly">Weekly (Every 7 days)</option>
                <option value="Low (every 10-14 days)">Low / Drought-tolerant (10-14 days)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-foreground block mb-1">
                Placement Suitability
              </label>
              <select
                value={indoorOutdoor}
                onChange={(e) => setIndoorOutdoor(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background focus:ring-2 focus:ring-emerald-500/25"
              >
                <option value="Indoor">Indoor Only</option>
                <option value="Outdoor">Outdoor Only</option>
                <option value="Both">Both Indoor & Outdoor</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-foreground block mb-1">
                Ideal Temperature
              </label>
              <input
                type="text"
                value={idealTemperature}
                onChange={(e) => setIdealTemperature(e.target.value)}
                placeholder="e.g. 18-35°C"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-border bg-background focus:ring-2 focus:ring-emerald-500/25"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-foreground block mb-1">
                Pet Friendly
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPetFriendly(true)}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    petFriendly === true
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                      : "bg-secondary text-muted-foreground border-border hover:text-foreground"
                  }`}
                >
                  Yes (Safe)
                </button>
                <button
                  type="button"
                  onClick={() => setPetFriendly(false)}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    petFriendly === false
                      ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                      : "bg-secondary text-muted-foreground border-border hover:text-foreground"
                  }`}
                >
                  No (Toxic)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ─── CARD 4: Dynamic Category Attributes ───────────────────────────── */}
        {categoryAttributes.length > 0 ? (
          <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3.5">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Dynamic Category Attributes (
                    {categoryAttributes.filter((a) => isAttributeVisible(a.attributeName)).length}
                    )
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Custom attributes configured for this category by admin schema.
                  </p>
                </div>
              </div>
              {loadingAttributes && (
                <span className="text-xs text-muted-foreground flex items-center gap-1.5 animate-pulse">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Loading attributes...
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categoryAttributes
                .filter((attr) => isAttributeVisible(attr.attributeName))
                .map((attr) => {
                const currentVal = attributeValues[attr.attributeName];
                const isRequired = attr.requiredLevel === "required";

                return (
                  <div key={attr.id} className="space-y-1.5">
                    <label className="flex items-center justify-between text-xs font-bold text-foreground">
                      <span className="flex items-center gap-1">
                        {attr.attributeName}
                        {isRequired && <span className="text-rose-500">*</span>}
                      </span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                        {attr.requiredLevel}
                      </span>
                    </label>

                    {attr.dataType === "dropdown" && (
                      <select
                        value={currentVal || ""}
                        onChange={(e) =>
                          handleAttributeChange(attr.attributeName, e.target.value)
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

                    {attr.dataType === "number+unit" && (
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min={0}
                          step="any"
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
                          className="flex-1 px-3 py-2 text-xs rounded-xl border border-border bg-background focus:ring-2 focus:ring-emerald-500/25"
                        />
                        <select
                          value={typeof currentVal === "object" ? currentVal?.unit ?? attr.unitOptions?.[0] : attr.unitOptions?.[0]}
                          onChange={(e) =>
                            handleAttributeChange(attr.attributeName, {
                              value: typeof currentVal === "object" ? currentVal?.value ?? "" : currentVal ?? "",
                              unit: e.target.value,
                            })
                          }
                          className="w-24 px-2 py-2 text-xs font-mono font-bold rounded-xl border border-border bg-secondary"
                        >
                          {attr.unitOptions?.map((u) => (
                            <option key={u} value={u}>
                              {u}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {attr.dataType === "boolean" && (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleAttributeChange(attr.attributeName, true)}
                          className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                            currentVal === true
                              ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                              : "bg-secondary text-muted-foreground border-border hover:text-foreground"
                          }`}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAttributeChange(attr.attributeName, false)}
                          className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                            currentVal === false
                              ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                              : "bg-secondary text-muted-foreground border-border hover:text-foreground"
                          }`}
                        >
                          No
                        </button>
                      </div>
                    )}

                    {attr.dataType === "multi-select" && (
                      <div className="flex flex-wrap gap-1.5 p-2 rounded-xl border border-border bg-background/50">
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
                              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                                selected
                                  ? "bg-emerald-600/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40"
                                  : "bg-secondary text-muted-foreground border-border hover:text-foreground"
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {(attr.dataType === "text" || attr.dataType === "rich-text") && (
                      <input
                        type="text"
                        placeholder={`Enter ${attr.attributeName}...`}
                        value={currentVal || ""}
                        onChange={(e) =>
                          handleAttributeChange(attr.attributeName, e.target.value)
                        }
                        className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background focus:ring-2 focus:ring-emerald-500/25"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : loadingAttributes ? (
          <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-xs flex items-center justify-center gap-2 text-xs text-muted-foreground py-8">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
            Loading dynamic category attributes...
          </div>
        ) : selectedCategoryId ? (
          <div className="bg-card border border-border rounded-2xl p-4 shadow-xs text-xs text-muted-foreground text-center">
            No dynamic attributes schema configured for this category. Standard care specs above will be recorded.
          </div>
        ) : null}

        {/* ─── CARD 5: Botanical Reference Photos ────────────────────────────── */}
        <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <PlantImageUploader
            images={images}
            onChange={setImages}
            title="Botanical Reference Photos / संदर्भ तस्वीरें"
            description="Manage official reference photos for this master plant variety. These images are shared across all linked nursery vendor listings."
          />
        </div>

        {/* ─── Bottom Actions Bar ────────────────────────────────────────────── */}
        <div className="flex items-center justify-between bg-card border border-border rounded-2xl p-4 shadow-xs">
          <p className="text-xs text-muted-foreground">
            Changes will update botanical specs and reflect across all nursery store inventories.
          </p>

          <div className="flex items-center gap-2.5">
            <Link
              href="/nursery-master-catalog"
              className="px-4 py-2 text-xs font-bold rounded-xl border border-border hover:bg-muted text-foreground transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
