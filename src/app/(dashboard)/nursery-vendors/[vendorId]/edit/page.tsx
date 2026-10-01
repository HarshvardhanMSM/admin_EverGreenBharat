"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { nurseryService } from "@/services/api/nursery-service";
import { toast } from "@/components/ui/toast";
import { resolveImageUrl } from "@/utils";
import { PlantImageUploader } from "@/components/common/PlantImageUploader";
import {
  ArrowLeft,
  Building,
  Store,
  MapPin,
  Mail,
  Phone,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Package,
  Save,
  Truck,
  Plus,
  X,
  Star,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  Globe,
  Tag,
  Info,
  Layers,
  Image as ImageIcon,
  Search,
} from "lucide-react";
import {
  GoogleAddressSearch,
  AddressSearchResult,
} from "@/components/common/GoogleAddressSearch";

export default function VendorEditPage({
  params,
}: {
  params: Promise<{ vendorId: string }>;
}) {
  const resolvedParams = use(params);
  const vendorId = resolvedParams.vendorId;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [vendor, setVendor] = useState<any | null>(null);

  // Form State
  const [storeName, setStoreName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [storeSlug, setStoreSlug] = useState("");
  const [description, setDescription] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [supportPhone, setSupportPhone] = useState("");
  const [storeLogo, setStoreLogo] = useState("");
  const [storeBanners, setStoreBanners] = useState<string[]>([]);

  // Address
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [latitude, setLatitude] = useState<string>("");
  const [longitude, setLongitude] = useState<string>("");

  // Delivery Area
  const [radiusKm, setRadiusKm] = useState<number>(20);
  const [minOrderAmount, setMinOrderAmount] = useState<number>(0);
  const [freeDeliveryAbove, setFreeDeliveryAbove] = useState<number>(999);
  const [serviceablePincodes, setServiceablePincodes] = useState<string[]>([]);
  const [newPincodeInput, setNewPincodeInput] = useState("");

  // KYC & Admin Status
  const [approvalStatus, setApprovalStatus] = useState<"PENDING" | "APPROVED" | "REJECTED">("PENDING");
  const [rejectionReason, setRejectionReason] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Load Vendor Data
  const loadVendor = async () => {
    try {
      setLoading(true);
      let v: any = null;
      try {
        const res = await nurseryService.fetchVendorById(vendorId);
        v = res?.data || res;
      } catch (err) {
        // Fallback: search vendor from list
        const listRes = await nurseryService.fetchVendors({ limit: 100 });
        const list = Array.isArray(listRes?.data) ? listRes.data : listRes?.data?.data || [];
        v = list.find((item: any) => item.id === vendorId);
      }

      if (!v) {
        toast.error("Vendor not found");
        router.push("/nursery-vendors");
        return;
      }

      setVendor(v);

      // Populate form state
      setStoreName(v.storeName || "");
      setBusinessName(v.businessName || "");
      setStoreSlug(v.storeSlug || "");
      setDescription(v.description || "");
      setSupportEmail(v.supportEmail || "");
      setSupportPhone(v.supportPhone || "");
      setStoreLogo(v.storeLogo || "");
      setStoreBanners(Array.isArray(v.storeBanners) ? v.storeBanners : []);

      // Address
      setStreet(v.address?.street || "");
      setCity(v.address?.city || "");
      setStateName(v.address?.state || "");
      setPostalCode(v.address?.postalCode || "");
      setLatitude(v.address?.latitude !== undefined && v.address?.latitude !== null ? String(v.address.latitude) : "");
      setLongitude(v.address?.longitude !== undefined && v.address?.longitude !== null ? String(v.address.longitude) : "");

      // Delivery
      setRadiusKm(Number(v.deliveryArea?.radiusKm ?? 20));
      setMinOrderAmount(Number(v.deliveryArea?.minOrderAmount ?? 0));
      setFreeDeliveryAbove(Number(v.deliveryArea?.freeDeliveryAbove ?? 999));
      setServiceablePincodes(Array.isArray(v.deliveryArea?.serviceablePincodes) ? v.deliveryArea.serviceablePincodes : []);

      // Admin & KYC
      setApprovalStatus(v.approvalStatus || "PENDING");
      setRejectionReason(v.rejectionReason || "");
      setIsActive(Boolean(v.isActive));
    } catch (err: any) {
      console.error("Failed to load vendor", err);
      toast.error("Failed to load vendor information");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (vendorId) {
      loadVendor();
    }
  }, [vendorId]);

  // Handle Auto-fill from Google Address Search
  const handleAddressAutoFill = (result: AddressSearchResult) => {
    if (result.street) setStreet(result.street);
    if (result.city) setCity(result.city);
    if (result.state) setStateName(result.state);
    if (result.postalCode) {
      setPostalCode(result.postalCode);
      if (
        /^\d{6}$/.test(result.postalCode) &&
        !serviceablePincodes.includes(result.postalCode)
      ) {
        setServiceablePincodes((prev) => [...prev, result.postalCode]);
      }
    }
    if (result.latitude !== undefined && !isNaN(result.latitude)) {
      setLatitude(String(result.latitude));
    }
    if (result.longitude !== undefined && !isNaN(result.longitude)) {
      setLongitude(String(result.longitude));
    }
  };

  // Handle adding pincode (supports single or comma-separated)
  const handleAddPincode = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newPincodeInput.trim()) return;

    const parts = newPincodeInput
      .split(/[, \n]+/)
      .map((p) => p.trim())
      .filter((p) => /^\d{6}$/.test(p));

    if (parts.length === 0) {
      toast.warning("Please enter valid 6-digit Indian PIN code(s)");
      return;
    }

    const uniqueNew = parts.filter((p) => !serviceablePincodes.includes(p));
    setServiceablePincodes((prev) => [...prev, ...uniqueNew]);
    setNewPincodeInput("");
    toast.success(`Added ${uniqueNew.length} pincode(s)`);
  };

  const handleRemovePincode = (code: string) => {
    setServiceablePincodes((prev) => prev.filter((p) => p !== code));
  };

  // Generate slug from store name if slug is empty
  const handleAutoSlug = () => {
    if (!storeName.trim()) return;
    const generated = storeName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setStoreSlug(generated);
  };

  // Save Vendor Updates
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim() || !storeSlug.trim() || !supportEmail.trim() || !supportPhone.trim()) {
      toast.error("Please fill all mandatory fields (Store Name, Slug, Email, Phone)");
      return;
    }

    try {
      setSaving(true);
      const payload: Record<string, any> = {
        storeName: storeName.trim(),
        businessName: businessName.trim() || storeName.trim(),
        storeSlug: storeSlug.trim().toLowerCase(),
        description: description.trim(),
        supportEmail: supportEmail.trim(),
        supportPhone: supportPhone.trim(),
        storeLogo: storeLogo || null,
        storeBanners: storeBanners,
        address: {
          street: street.trim(),
          city: city.trim(),
          state: stateName.trim(),
          postalCode: postalCode.trim(),
          latitude: latitude ? Number(latitude) : undefined,
          longitude: longitude ? Number(longitude) : undefined,
        },
        deliveryArea: {
          radiusKm: Number(radiusKm) || 20,
          minOrderAmount: Number(minOrderAmount) || 0,
          freeDeliveryAbove: Number(freeDeliveryAbove) || 999,
          serviceablePincodes: serviceablePincodes,
        },
        approvalStatus,
        rejectionReason: approvalStatus === "REJECTED" ? rejectionReason.trim() : null,
        isActive,
      };

      await nurseryService.updateVendor(vendorId, payload);
      toast.success("Vendor storefront details updated successfully!");
      loadVendor();
    } catch (err: any) {
      console.error("Failed to update vendor", err);
      toast.error(err?.response?.data?.message || "Failed to update vendor profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold">Loading Vendor Store Details...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6 pb-24 animate-in fade-in duration-300">
      {/* ─── Breadcrumb & Top Navigation Bar ──────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/nursery-vendors"
            className="p-2.5 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer shadow-xs"
            title="Back to Vendors List"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-0.5">
              <Link href="/nursery-vendors" className="hover:underline font-medium">
                Nursery Vendors
              </Link>
              <span>/</span>
              <span className="text-foreground font-bold">{storeName || "Store"}</span>
              <span>/</span>
              <span>Edit Details</span>
            </div>
            <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2.5">
              {storeName || "Vendor Profile"}
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-bold border inline-flex items-center gap-1 ${
                  approvalStatus === "APPROVED"
                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20"
                    : approvalStatus === "PENDING"
                    ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20"
                    : "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20"
                }`}
              >
                {approvalStatus === "APPROVED" && <CheckCircle className="w-3 h-3" />}
                {approvalStatus === "PENDING" && <Clock className="w-3 h-3" />}
                {approvalStatus === "REJECTED" && <ShieldAlert className="w-3 h-3" />}
                KYC {approvalStatus}
              </span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                  isActive
                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                    : "bg-muted text-muted-foreground border-border"
                }`}
              >
                {isActive ? "Store Online" : "Store Disabled"}
              </span>
            </h1>
          </div>
        </div>

        {/* Quick Top Actions */}
        <div className="flex items-center gap-2.5">
          <Link
            href={`/nursery-vendors/${vendorId}/inventory`}
            className="inline-flex items-center gap-1.5 text-xs bg-muted/80 hover:bg-muted text-foreground border border-border font-bold px-3.5 py-2.5 rounded-xl transition-all cursor-pointer shadow-xs"
          >
            <Package className="w-4 h-4 text-emerald-600" />
            Manage Inventory
          </Link>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving Changes..." : "Save Details"}
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* ─── SECTION 1: Storefront & Brand Identity ─────────────────────────── */}
        <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 border-b border-border pb-3.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/10 text-emerald-600 flex items-center justify-center font-bold">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-foreground">
                Storefront & Brand Identity
              </h2>
              <p className="text-xs text-muted-foreground">
                Public marketplace branding, store handle slug, and description
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-foreground block mb-1">
                Store Name (Customer Facing) *
              </label>
              <input
                required
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="e.g. Green Oasis Nursery"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border bg-background focus:ring-2 focus:ring-emerald-500/25 focus:outline-hidden font-medium"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-foreground block">
                  Store Slug (URL Handle) *
                </label>
                <button
                  type="button"
                  onClick={handleAutoSlug}
                  className="text-[11px] text-emerald-600 hover:underline font-bold cursor-pointer"
                >
                  Generate from Name
                </button>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">
                  @
                </span>
                <input
                  required
                  type="text"
                  value={storeSlug}
                  onChange={(e) => setStoreSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                  placeholder="green-oasis-nursery"
                  className="w-full pl-8 pr-3.5 py-2.5 text-sm rounded-xl border border-border bg-background font-mono focus:ring-2 focus:ring-emerald-500/25 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-foreground block mb-1">
                Legal Business / Entity Name
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Green Oasis Horticulture LLP"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border bg-background focus:ring-2 focus:ring-emerald-500/25 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-foreground block mb-1">
                Marketplace Public URL Preview
              </label>
              <div className="px-3.5 py-2.5 text-xs rounded-xl border border-border bg-muted/40 text-muted-foreground font-mono flex items-center gap-1.5 truncate">
                <Globe className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                https://evergreen.in/stores/{storeSlug || "your-slug"}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-bold text-foreground block mb-1">
                Store Bio & Nursery Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide a detailed description of the nursery, special plant varieties, exotic imports, bonsai collections, and gardening services offered..."
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-border bg-background focus:ring-2 focus:ring-emerald-500/25 focus:outline-hidden leading-relaxed"
              />
            </div>

            {/* Store Logo & Banners */}
            <div className="md:col-span-2 pt-2 border-t border-border">
              <PlantImageUploader
                images={storeLogo ? [storeLogo] : []}
                onChange={(imgs) => setStoreLogo(imgs[0] || "")}
                maxImages={1}
                title="Store Logo / Brand Emblem"
                description="Upload the nursery store logo shown on vendor profile and product cards (JPEG, PNG, WEBP)."
              />
            </div>

            <div className="md:col-span-2 pt-2 border-t border-border">
              <PlantImageUploader
                images={storeBanners}
                onChange={setStoreBanners}
                maxImages={4}
                title="Storefront Cover Banners"
                description="Upload wide landscape banners for the mobile store carousel header."
              />
            </div>
          </div>
        </div>

        {/* ─── SECTION 2: Contact & Linked Account Details ─────────────────────── */}
        <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 border-b border-border pb-3.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/10 text-emerald-600 flex items-center justify-center font-bold">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-foreground">
                Contact & Account Information
              </h2>
              <p className="text-xs text-muted-foreground">
                Support channels and linked system user credentials
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-foreground block mb-1">
                Support & Order Email *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  required
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  placeholder="contact@nursery.in"
                  className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-xl border border-border bg-background focus:ring-2 focus:ring-emerald-500/25 focus:outline-hidden font-medium"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-foreground block mb-1">
                Support Phone Number *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  required
                  type="text"
                  value={supportPhone}
                  onChange={(e) => setSupportPhone(e.target.value)}
                  placeholder="+91 98450 11223"
                  className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-xl border border-border bg-background focus:ring-2 focus:ring-emerald-500/25 focus:outline-hidden font-medium"
                />
              </div>
            </div>

            {/* Linked User Account Info */}
            <div className="md:col-span-2 p-4 bg-muted/40 rounded-xl border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-600/10 text-emerald-600 flex items-center justify-center font-bold">
                  {vendor?.user?.displayName?.[0] || vendor?.user?.username?.[0] || "U"}
                </div>
                <div>
                  <div className="text-xs font-bold text-foreground flex items-center gap-2">
                    Linked User: {vendor?.user?.displayName || vendor?.user?.username || "Vendor Account"}
                    <span className="text-[10px] bg-muted px-2 py-0.5 rounded border border-border text-muted-foreground font-mono">
                      UID: {vendor?.userId}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Registered Email: {vendor?.user?.email || supportEmail}
                  </div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-500 fill-current" />
                <span className="font-bold text-foreground">{Number(vendor?.rating || 5).toFixed(1)}</span>
                <span>({vendor?.ratingCount || 0} customer reviews)</span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── SECTION 3: Physical Nursery Hub & Address ───────────────────────── */}
        <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-600/10 text-emerald-600 flex items-center justify-center font-bold">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-black text-foreground">
                  Nursery Location & Physical Hub
                </h2>
                <p className="text-xs text-muted-foreground">
                  Base greenhouse and order dispatch pickup coordinates
                </p>
              </div>
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-1.5 self-start sm:self-auto">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-foreground/80">Google Location Search Active</span>
            </div>
          </div>

          {/* Google Address Autocomplete & Quick Search Bar */}
          <div className="p-4 bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/20 rounded-2xl space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Google Address / Location Autocomplete Search
              </label>
              <span className="text-[11px] text-muted-foreground">
                Search location to auto-fill Street, City, State, PIN, & GPS coordinates below
              </span>
            </div>
            <GoogleAddressSearch
              onAddressSelect={handleAddressAutoFill}
              currentLat={latitude}
              currentLng={longitude}
              currentAddress={`${street ? street + ", " : ""}${city ? city + ", " : ""}${stateName}`}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-3">
              <label className="text-xs font-bold text-foreground block mb-1">
                Street / Nursery Farm Address
              </label>
              <input
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="e.g. Survey No. 45, Varthur Road, Near Lake Garden"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border bg-background focus:ring-2 focus:ring-emerald-500/25 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-foreground block mb-1">
                City / Town
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Bengaluru"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border bg-background focus:ring-2 focus:ring-emerald-500/25 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-foreground block mb-1">
                State
              </label>
              <input
                type="text"
                value={stateName}
                onChange={(e) => setStateName(e.target.value)}
                placeholder="Karnataka"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border bg-background focus:ring-2 focus:ring-emerald-500/25 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-foreground block mb-1">
                Postal Code (PIN)
              </label>
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="560087"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border bg-background font-mono focus:ring-2 focus:ring-emerald-500/25 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-foreground block mb-1">
                GPS Latitude (Decimal)
              </label>
              <input
                type="number"
                step="any"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="12.9352"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border bg-background font-mono focus:ring-2 focus:ring-emerald-500/25 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-foreground block mb-1">
                GPS Longitude (Decimal)
              </label>
              <input
                type="number"
                step="any"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="77.6245"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border bg-background font-mono focus:ring-2 focus:ring-emerald-500/25 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* ─── SECTION 4: Logistics & Delivery Area ───────────────────────────── */}
        <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 border-b border-border pb-3.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/10 text-emerald-600 flex items-center justify-center font-bold">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-foreground">
                Logistics & Hyperlocal Delivery Coverage
              </h2>
              <p className="text-xs text-muted-foreground">
                Radius dispatch, threshold minimums, and serviceable PIN codes
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-foreground block mb-1">
                Delivery Radius (km)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  max={200}
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border bg-background font-mono focus:ring-2 focus:ring-emerald-500/25 focus:outline-hidden"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  km
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-foreground block mb-1">
                Minimum Order Amount (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-bold">
                  ₹
                </span>
                <input
                  type="number"
                  min={0}
                  value={minOrderAmount}
                  onChange={(e) => setMinOrderAmount(Number(e.target.value))}
                  className="w-full pl-8 pr-3.5 py-2.5 text-sm rounded-xl border border-border bg-background font-mono focus:ring-2 focus:ring-emerald-500/25 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-foreground block mb-1">
                Free Delivery Above (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-bold">
                  ₹
                </span>
                <input
                  type="number"
                  min={0}
                  value={freeDeliveryAbove}
                  onChange={(e) => setFreeDeliveryAbove(Number(e.target.value))}
                  className="w-full pl-8 pr-3.5 py-2.5 text-sm rounded-xl border border-border bg-background font-mono focus:ring-2 focus:ring-emerald-500/25 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Pincodes Manager */}
            <div className="md:col-span-3 pt-2">
              <label className="text-xs font-bold text-foreground block mb-1">
                Serviceable PIN Codes ({serviceablePincodes.length})
              </label>
              <p className="text-[11px] text-muted-foreground mb-2">
                Orders from customers in these PIN codes will be routed to this nursery. Enter 6-digit codes separated by comma or space.
              </p>

              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  placeholder="e.g. 560001, 560034, 560102"
                  value={newPincodeInput}
                  onChange={(e) => setNewPincodeInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddPincode();
                    }
                  }}
                  className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-border bg-background font-mono focus:ring-2 focus:ring-emerald-500/25"
                />
                <button
                  type="button"
                  onClick={() => handleAddPincode()}
                  className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 inline mr-1" /> Add Pincodes
                </button>
              </div>

              {serviceablePincodes.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-muted/40 border border-border max-h-48 overflow-y-auto">
                  {serviceablePincodes.map((code) => (
                    <span
                      key={code}
                      className="inline-flex items-center gap-1.5 text-xs font-mono font-bold bg-background text-foreground border border-border px-2.5 py-1 rounded-lg shadow-2xs"
                    >
                      {code}
                      <button
                        type="button"
                        onClick={() => handleRemovePincode(code)}
                        className="text-muted-foreground hover:text-rose-600 rounded-full"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center rounded-xl bg-muted/20 border border-dashed border-border text-xs text-muted-foreground">
                  No explicit PIN codes assigned yet. Hyperlocal distance radius ({radiusKm} km) will be used by default.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── SECTION 5: Administrative & KYC Controls ───────────────────────── */}
        <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 border-b border-border pb-3.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/10 text-emerald-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-foreground">
                Administrative Governance & KYC Review
              </h2>
              <p className="text-xs text-muted-foreground">
                Compliance authorization, approval state, and app presence toggle
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-foreground block mb-1">
                Vendor KYC Approval Status
              </label>
              <select
                value={approvalStatus}
                onChange={(e) => setApprovalStatus(e.target.value as any)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border bg-background font-bold focus:ring-2 focus:ring-emerald-500/25 focus:outline-hidden"
              >
                <option value="APPROVED">APPROVED (Verified & Authorized)</option>
                <option value="PENDING">PENDING (Under Application Review)</option>
                <option value="REJECTED">REJECTED (Application Rejected)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-foreground block mb-1">
                Storefront Presence Switch
              </label>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`w-full px-4 py-2.5 text-xs font-bold rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                  isActive
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                    : "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isActive ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
                    }`}
                  />
                  {isActive ? "Store is Active (Online in Customer App)" : "Store is Disabled (Offline & Hidden)"}
                </span>
                <span className="underline">Toggle</span>
              </button>
            </div>

            {approvalStatus === "REJECTED" && (
              <div className="md:col-span-2 space-y-1 animate-in fade-in duration-150">
                <label className="text-xs font-bold text-rose-600 dark:text-rose-400 block">
                  Rejection Reason / KYC Notice
                </label>
                <textarea
                  rows={2}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain why this vendor application was rejected (e.g. Expired nursery registration certificate, invalid contact details)..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-rose-500/30 bg-background text-foreground focus:ring-2 focus:ring-rose-500/25 focus:outline-hidden"
                />
              </div>
            )}
          </div>
        </div>

        {/* ─── Bottom Sticky Action Bar ────────────────────────────────────────── */}
        <div className="sticky bottom-4 z-40 bg-card/90 backdrop-blur-md border border-border rounded-2xl p-4 shadow-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Info className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Updates will immediately reflect in marketplace routing and consumer listings.</span>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/nursery-vendors"
              className="px-4 py-2 text-xs font-bold rounded-xl border border-border hover:bg-muted transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving Changes..." : "Save Vendor Details"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
