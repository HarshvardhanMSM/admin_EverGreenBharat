"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { settingsService, PlatformGeneralSettings } from "@/services/api/settings-service";
import { toast } from "@/components/ui/toast";
import { getMediaUrl } from "@/lib/utils";
import {
  Building,
  User,
  Lock,
  Camera,
  Save,
  Globe,
  Mail,
  Phone,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  UploadCloud,
  Trash2,
  ShieldCheck,
  Sparkles,
  Sliders,
  DollarSign,
  MapPin,
  RefreshCw,
  Sprout,
  Store,
} from "lucide-react";

export default function GeneralSettingsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-muted-foreground">Loading settings...</div>}>
      <GeneralSettingsContent />
    </Suspense>
  );
}

function GeneralSettingsContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<"platform" | "profile">("platform");

  useEffect(() => {
    if (tabParam === "profile") {
      setActiveTab("profile");
    } else if (tabParam === "platform") {
      setActiveTab("platform");
    }
  }, [tabParam]);

  // ─── Platform Settings State ──────────────────────────────────────────────
  const [platformSettings, setPlatformSettings] = useState<PlatformGeneralSettings>({
    projectName: "Ever Green Bharat",
    projectDescription:
      "Empowering nursery growers, landscape creators, and millions of urban gardeners across India.",
    supportEmail: "support@evergreenbharat.com",
    supportPhone: "+91 98765 43210",
    websiteUrl: "https://evergreenbharat.com",
    currency: "INR (₹)",
    defaultDeliveryRadiusKm: 25,
    maintenanceMode: false,
    logoUrl: "",
    badgeText: "🌱 Unified Green Platform",
    bullet1: "Standardized Botanical Taxonomy & Care Autosuggest",
    bullet2: "Secure Doorstep Delivery OTP Verification",
    bullet3: "Institutional B2B Bulk Greenery Inquiries",
    bullet4: "Green Army Community & Plant Creator Ecosystem",
    footerVersion: "Operational Console v2.0",
    footerMadeWith: "Made with 💚 for India",
  });
  const [savingPlatform, setSavingPlatform] = useState(false);

  // ─── Profile State ────────────────────────────────────────────────────────
  const [profileLoading, setProfileLoading] = useState(true);
  const [profile, setProfile] = useState<{
    id?: string;
    email?: string;
    username?: string;
    displayName?: string;
    bio?: string;
    avatarUrl?: string;
    roles?: string[];
  }>({});
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── Password Change State ────────────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Load platform settings & profile on mount
  useEffect(() => {
    const loadedPlatform = settingsService.getPlatformSettings();
    setPlatformSettings(loadedPlatform);

    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    setProfileLoading(true);
    try {
      const data = await settingsService.getOwnProfile();
      const user = data?.user || data;
      setProfile({
        id: user?.id,
        email: user?.email,
        username: user?.username,
        displayName: user?.displayName || user?.name,
        bio: user?.bio,
        avatarUrl: user?.avatarUrl,
        roles: data?.roles || (user?.admin?.adminRoles ? user.admin.adminRoles.map((ar: any) => ar.role?.name) : []),
      });
      setDisplayName(user?.displayName || user?.name || "");
      setUsername(user?.username || "");
      setBio(user?.bio || "");
      setAvatarPreview(user?.avatarUrl || null);
    } catch (err) {
      console.error("Failed to load admin profile", err);
    } finally {
      setProfileLoading(false);
    }
  };

  // ─── Handle Platform Settings Save ────────────────────────────────────────
  const handleSavePlatform = (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPlatform(true);
    try {
      settingsService.savePlatformSettings(platformSettings);
      toast.success("Platform general settings saved successfully!");
    } catch {
      toast.error("Failed to save platform settings");
    } finally {
      setSavingPlatform(false);
    }
  };

  // ─── Handle Profile Details Save ──────────────────────────────────────────
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      toast.error("Profile display name is required");
      return;
    }
    setSavingProfile(true);
    try {
      await settingsService.updateOwnProfile({
        displayName: displayName.trim(),
        username: username.trim() || undefined,
        bio: bio.trim() || undefined,
      });
      toast.success("Profile details updated successfully!");
      setProfile((prev) => ({
        ...prev,
        displayName: displayName.trim(),
        username: username.trim(),
        bio: bio.trim(),
      }));
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to update profile";
      toast.error(typeof msg === "string" ? msg : "Validation error");
    } finally {
      setSavingProfile(false);
    }
  };

  // ─── Handle Avatar Image File Upload ───────────────────────────────────────
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: 5MB
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size must be less than 5MB");
      return;
    }

    // Local instant preview
    const reader = new FileReader();
    reader.onload = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to server
    setUploadingAvatar(true);
    try {
      const res = await settingsService.uploadAvatar(file);
      const updatedUrl = res?.avatarUrl || res?.data?.avatarUrl;
      if (updatedUrl) {
        setAvatarPreview(updatedUrl);
      }
      toast.success("Profile image uploaded and updated successfully!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to upload avatar image");
    } finally {
      setUploadingAvatar(false);
    }
  };

  // ─── Handle Password Change ───────────────────────────────────────────────
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error("Current password is required");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }

    setChangingPassword(true);
    try {
      await settingsService.changePassword({
        currentPassword,
        newPassword,
      });
      toast.success("Password changed successfully! Keep your new password safe.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to change password. Check your current password.";
      toast.error(typeof msg === "string" ? msg : "Password change failed");
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* ─── Page Header ──────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-950/40 via-emerald-900/20 to-teal-950/30 border border-emerald-500/25 rounded-3xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold shadow-inner shrink-0">
              <Sliders className="w-7 h-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                  General Settings & Profile
                </h1>
                <span className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs font-bold px-3 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1.5">
                  <Sprout className="w-3.5 h-3.5 text-emerald-600" />
                  {platformSettings.projectName}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
                Configure platform project identity, support channels, and manage administrator account profile, image upload & security.
              </p>
            </div>
          </div>

          {/* Quick Tab Switcher */}
          <div className="flex items-center gap-1.5 bg-background/80 p-1.5 rounded-2xl border border-border/80 shadow-xs shrink-0 self-start sm:self-center">
            <button
              onClick={() => setActiveTab("platform")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "platform"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              <Building className="w-4 h-4" />
              Project Info
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "profile"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              <User className="w-4 h-4" />
              Edit Profile & Security
            </button>
          </div>
        </div>
      </div>

      {/* ─── TAB 1: Platform & Project Information ─────────────────────────── */}
      {activeTab === "platform" && (
        <form onSubmit={handleSavePlatform} className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="border-b border-border/80 pb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">Project Identity & Branding</h2>
                  <p className="text-xs text-muted-foreground">
                    Public branding details displayed across user website, vendor app, and notifications
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Project Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <span>Project / Platform Name *</span>
                </label>
                <input
                  type="text"
                  required
                  value={platformSettings.projectName}
                  onChange={(e) =>
                    setPlatformSettings({ ...platformSettings, projectName: e.target.value })
                  }
                  placeholder="e.g. Ever Green Bharat"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-background/50 focus:bg-background focus:ring-2 focus:ring-emerald-500/25 focus:outline-hidden font-bold"
                />
                <span className="text-[11px] text-muted-foreground">
                  The primary marketplace brand name used in headers and meta titles.
                </span>
              </div>

              {/* Official Website URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-primary" />
                  <span>Official Website URL</span>
                </label>
                <input
                  type="url"
                  value={platformSettings.websiteUrl}
                  onChange={(e) =>
                    setPlatformSettings({ ...platformSettings, websiteUrl: e.target.value })
                  }
                  placeholder="https://evergreenbharat.com"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-background/50 focus:bg-background focus:ring-2 focus:ring-emerald-500/25 focus:outline-hidden"
                />
                <span className="text-[11px] text-muted-foreground">
                  Canonical web domain of the nursery marketplace.
                </span>
              </div>

              {/* Brand Logo Upload */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-primary" />
                  <span>Platform / Brand Logo URL</span>
                </label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-muted/30 border border-border rounded-2xl">
                  {platformSettings.logoUrl ? (
                    <div className="w-14 h-14 rounded-2xl overflow-hidden border border-border bg-card shrink-0 flex items-center justify-center relative group">
                      <img
                        src={platformSettings.logoUrl}
                        alt="Brand Logo"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setPlatformSettings({ ...platformSettings, logoUrl: "" })}
                        className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-xs font-bold"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-2xl border-2 border-dashed border-border flex items-center justify-center text-muted-foreground shrink-0">
                      <Store className="w-6 h-6 text-muted-foreground/40" />
                    </div>
                  )}
                  <div className="flex-1 w-full space-y-1">
                    <input
                      type="url"
                      value={platformSettings.logoUrl || ""}
                      onChange={(e) =>
                        setPlatformSettings({ ...platformSettings, logoUrl: e.target.value })
                      }
                      placeholder="Paste image URL (e.g. /logo.png or https://...)"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-border bg-background focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Displayed on the top-left sidebar header and navigation bar.
                    </p>
                  </div>
                </div>
              </div>

              {/* Project Description / Tagline */}
              <div className="col-span-full space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  Project Description & Mission Tagline *
                </label>
                <textarea
                  rows={3}
                  required
                  value={platformSettings.projectDescription}
                  onChange={(e) =>
                    setPlatformSettings({ ...platformSettings, projectDescription: e.target.value })
                  }
                  placeholder="Describe the platform vision, green community, and plant marketplace scope..."
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-background/50 focus:bg-background focus:ring-2 focus:ring-emerald-500/25 focus:outline-hidden font-medium leading-relaxed"
                />
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>Displayed in SEO summaries, footer links, and marketing emails.</span>
                  <span>{platformSettings.projectDescription.length} characters</span>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Login Screen Branding & Showcase (Right Cover Panel) ─── */}
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="border-b border-border/80 pb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">Login Screen Branding & Value Showcase</h2>
                  <p className="text-xs text-muted-foreground">
                    Customize the right-side cover panel, badges, and bullet points displayed on the admin login page
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Form Controls (8 cols on lg) */}
              <div className="lg:col-span-7 space-y-4">
                {/* Top Badge */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <span>Showcase Top Badge</span>
                  </label>
                  <input
                    type="text"
                    value={platformSettings.badgeText || ""}
                    onChange={(e) =>
                      setPlatformSettings({ ...platformSettings, badgeText: e.target.value })
                    }
                    placeholder="e.g. 🌱 Unified Green Platform"
                    className="w-full px-4 py-2 text-sm rounded-xl border border-border bg-background/50 focus:bg-background focus:ring-2 focus:ring-emerald-500/25 focus:outline-hidden font-medium"
                  />
                  <span className="text-[11px] text-muted-foreground">
                    Pill badge shown on top of the login cover panel.
                  </span>
                </div>

                {/* 4 Bullets */}
                <div className="space-y-3 pt-2">
                  <label className="text-xs font-bold text-foreground block">
                    Showcase Feature Bullets (Displayed on Login Page)
                  </label>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-600 w-5">1.</span>
                      <input
                        type="text"
                        value={platformSettings.bullet1 || ""}
                        onChange={(e) =>
                          setPlatformSettings({ ...platformSettings, bullet1: e.target.value })
                        }
                        placeholder="Feature point 1"
                        className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-border bg-background/50 focus:bg-background focus:ring-2 focus:ring-emerald-500/25 focus:outline-hidden"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-600 w-5">2.</span>
                      <input
                        type="text"
                        value={platformSettings.bullet2 || ""}
                        onChange={(e) =>
                          setPlatformSettings({ ...platformSettings, bullet2: e.target.value })
                        }
                        placeholder="Feature point 2"
                        className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-border bg-background/50 focus:bg-background focus:ring-2 focus:ring-emerald-500/25 focus:outline-hidden"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-600 w-5">3.</span>
                      <input
                        type="text"
                        value={platformSettings.bullet3 || ""}
                        onChange={(e) =>
                          setPlatformSettings({ ...platformSettings, bullet3: e.target.value })
                        }
                        placeholder="Feature point 3"
                        className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-border bg-background/50 focus:bg-background focus:ring-2 focus:ring-emerald-500/25 focus:outline-hidden"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-600 w-5">4.</span>
                      <input
                        type="text"
                        value={platformSettings.bullet4 || ""}
                        onChange={(e) =>
                          setPlatformSettings({ ...platformSettings, bullet4: e.target.value })
                        }
                        placeholder="Feature point 4"
                        className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-border bg-background/50 focus:bg-background focus:ring-2 focus:ring-emerald-500/25 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Notes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Footer Version Text</label>
                    <input
                      type="text"
                      value={platformSettings.footerVersion || ""}
                      onChange={(e) =>
                        setPlatformSettings({ ...platformSettings, footerVersion: e.target.value })
                      }
                      placeholder="e.g. Operational Console v2.0"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background/50 focus:bg-background focus:ring-2 focus:ring-emerald-500/25 focus:outline-hidden"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Footer Made With</label>
                    <input
                      type="text"
                      value={platformSettings.footerMadeWith || ""}
                      onChange={(e) =>
                        setPlatformSettings({ ...platformSettings, footerMadeWith: e.target.value })
                      }
                      placeholder="e.g. Made with 💚 for India"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background/50 focus:bg-background focus:ring-2 focus:ring-emerald-500/25 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Live Preview Panel (5 cols on lg) */}
              <div className="lg:col-span-5">
                <div className="text-xs font-bold text-muted-foreground mb-2 flex items-center justify-between">
                  <span>Live Preview (Login Screen Panel)</span>
                  <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full">Auto Updates</span>
                </div>
                <div className="relative rounded-2xl bg-gradient-to-br from-emerald-800 via-emerald-900 to-teal-950 p-5 text-white overflow-hidden shadow-md flex flex-col justify-between min-h-[300px]">
                  <div className="relative z-10">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/25 text-emerald-300 border border-emerald-400/30 text-[10px] font-semibold">
                      {platformSettings.badgeText || "🌱 Unified Green Platform"}
                    </span>
                  </div>

                  <div className="relative z-10 space-y-2.5 my-3">
                    <h3 className="text-xl font-black tracking-tight leading-tight">
                      {platformSettings.projectName.split(" ").slice(0, -1).join(" ") || "Ever Green"} <br />
                      <span className="text-emerald-400">
                        {platformSettings.projectName.split(" ").slice(-1)[0] || "Bharat"}
                      </span>
                    </h3>
                    <p className="text-[11px] text-emerald-100/90 leading-relaxed line-clamp-3">
                      {platformSettings.projectDescription || "Empowering nursery growers, landscape creators, and millions of urban gardeners across India."}
                    </p>

                    <div className="space-y-1.5 pt-1 text-[10px] text-emerald-100/80 font-medium">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                        <span className="truncate">{platformSettings.bullet1 || "Standardized Botanical Taxonomy & Care Autosuggest"}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                        <span className="truncate">{platformSettings.bullet2 || "Secure Doorstep Delivery OTP Verification"}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                        <span className="truncate">{platformSettings.bullet3 || "Institutional B2B Bulk Greenery Inquiries"}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                        <span className="truncate">{platformSettings.bullet4 || "Green Army Community & Plant Creator Ecosystem"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10 border-t border-emerald-700/50 pt-2 flex items-center justify-between text-[9px] text-emerald-300/80">
                    <span>{platformSettings.footerVersion || "Operational Console v2.0"}</span>
                    <span>{platformSettings.footerMadeWith || "Made with 💚 for India"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact & Support Configuration */}
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="border-b border-border/80 pb-4 flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-primary/10 text-primary border border-primary/20">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Customer Support & Helpline</h2>
                <p className="text-xs text-muted-foreground">
                  Contact endpoints provided to buyers, corporate inquiries, and onboarding nurseries
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Support Email Address</span>
                </label>
                <input
                  type="email"
                  required
                  value={platformSettings.supportEmail}
                  onChange={(e) =>
                    setPlatformSettings({ ...platformSettings, supportEmail: e.target.value })
                  }
                  placeholder="support@evergreenbharat.com"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-background/50 focus:bg-background focus:ring-2 focus:ring-emerald-500/25 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Support Helpline / WhatsApp</span>
                </label>
                <input
                  type="text"
                  required
                  value={platformSettings.supportPhone}
                  onChange={(e) =>
                    setPlatformSettings({ ...platformSettings, supportPhone: e.target.value })
                  }
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-background/50 focus:bg-background focus:ring-2 focus:ring-emerald-500/25 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Operational & Regional Settings */}
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="border-b border-border/80 pb-4 flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Operational Delivery & Currency</h2>
                <p className="text-xs text-muted-foreground">
                  Default parameters for live nursery plant deliveries and transactions
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-primary" />
                  <span>Platform Currency</span>
                </label>
                <input
                  type="text"
                  disabled
                  value={platformSettings.currency}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-muted/50 font-bold text-foreground"
                />
                <span className="text-[11px] text-muted-foreground">Default Indian Rupee standard</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Default Service Radius (km)</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={200}
                  value={platformSettings.defaultDeliveryRadiusKm}
                  onChange={(e) =>
                    setPlatformSettings({
                      ...platformSettings,
                      defaultDeliveryRadiusKm: Number(e.target.value) || 25,
                    })
                  }
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-background/50 focus:bg-background focus:ring-2 focus:ring-emerald-500/25 focus:outline-hidden font-bold"
                />
                <span className="text-[11px] text-muted-foreground">Default hub coverage for new nurseries</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground block">
                  Platform Status
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setPlatformSettings({
                      ...platformSettings,
                      maintenanceMode: !platformSettings.maintenanceMode,
                    })
                  }
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    platformSettings.maintenanceMode
                      ? "bg-amber-500/15 border-amber-500/30 text-amber-700 dark:text-amber-300"
                      : "bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      platformSettings.maintenanceMode ? "bg-amber-500" : "bg-emerald-500 animate-pulse"
                    }`}
                  />
                  {platformSettings.maintenanceMode ? "Maintenance Mode Active" : "Marketplace Live & Operational"}
                </button>
                <span className="text-[11px] text-muted-foreground text-center block">
                  Click to toggle maintenance status
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-border/80">
              <button
                type="submit"
                disabled={savingPlatform}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                {savingPlatform ? "Saving Settings..." : "Save Platform Settings"}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ─── TAB 2: Admin Profile & Password Security ─────────────────────── */}
      {activeTab === "profile" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Section 1: Profile Information & Avatar Upload */}
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="border-b border-border/80 pb-4 flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Admin Profile Details</h2>
                <p className="text-xs text-muted-foreground">
                  Update your administrator display name, username, bio, and profile photo
                </p>
              </div>
            </div>

            {/* Profile Avatar Upload Component */}
            <div className="p-5 rounded-2xl bg-muted/30 border border-border/80 flex flex-col sm:flex-row items-center gap-5">
              <div className="relative group shrink-0">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-black text-3xl flex items-center justify-center shadow-md overflow-hidden border-2 border-emerald-500/30">
                  {avatarPreview ? (
                    <img
                      src={getMediaUrl(avatarPreview)}
                      alt="Profile Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{displayName ? displayName.charAt(0).toUpperCase() : "A"}</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute -bottom-1.5 -right-1.5 p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all cursor-pointer"
                  title="Upload New Photo"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1.5 text-center sm:text-left flex-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h3 className="font-extrabold text-base text-foreground">Profile Avatar Image</h3>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                    Max 5MB (JPG, PNG, WEBP)
                  </span>
                </div>
                <p className="text-xs text-muted-foreground max-w-md">
                  Upload a clear portrait photo to personalize your administrative actions across logs and communications.
                </p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="inline-flex items-center gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl shadow-2xs transition-all cursor-pointer"
                  >
                    <UploadCloud className="w-4 h-4" />
                    {uploadingAvatar ? "Uploading..." : "Upload New Photo"}
                  </button>
                  {avatarPreview && (
                    <button
                      type="button"
                      onClick={() => setAvatarPreview(null)}
                      className="inline-flex items-center gap-1 text-xs border border-border hover:bg-muted font-bold px-3 py-2 rounded-xl transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                      Remove
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
              </div>
            </div>

            {/* Profile Info Form */}
            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Profile Display Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Profile Display Name *</label>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Administrator"
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-background focus:ring-2 focus:ring-emerald-500/25 focus:outline-hidden font-bold"
                  />
                  <span className="text-[11px] text-muted-foreground">
                    Your full name displayed across system activity and reports.
                  </span>
                </div>

                {/* Username */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. admin"
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-background focus:ring-2 focus:ring-emerald-500/25 focus:outline-hidden font-mono text-xs"
                  />
                  <span className="text-[11px] text-muted-foreground">Unique admin handle.</span>
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground flex items-center justify-between">
                    <span>Registered Email Address</span>
                    <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Verified Admin
                    </span>
                  </label>
                  <input
                    type="email"
                    disabled
                    value={profile.email || "admin@evergreenbharat.com"}
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-muted/50 text-muted-foreground font-medium"
                  />
                  <span className="text-[11px] text-muted-foreground">
                    Primary login account email.
                  </span>
                </div>

                {/* Bio / Title */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Role Title / Designation</label>
                  <input
                    type="text"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="e.g. Chief Operations Officer"
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-background focus:ring-2 focus:ring-emerald-500/25 focus:outline-hidden"
                  />
                  <span className="text-[11px] text-muted-foreground">
                    Short description of your administrative responsibilities.
                  </span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  {savingProfile ? "Saving Profile..." : "Save Profile Details"}
                </button>
              </div>
            </form>
          </div>

          {/* Section 2: Change Password */}
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="border-b border-border/80 pb-4 flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Change Password & Security</h2>
                <p className="text-xs text-muted-foreground">
                  Update your authentication credentials to keep your administrator portal secure
                </p>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-5 max-w-xl">
              {/* Current Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Current Password *</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password..."
                    className="w-full pl-4 pr-10 py-2.5 text-sm rounded-xl border border-border bg-background focus:ring-2 focus:ring-emerald-500/25 focus:outline-hidden font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">New Password (Min 8 characters) *</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Create strong new password..."
                    className="w-full pl-4 pr-10 py-2.5 text-sm rounded-xl border border-border bg-background focus:ring-2 focus:ring-emerald-500/25 focus:outline-hidden font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Confirm New Password *</label>
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type new password..."
                  className={`w-full px-4 py-2.5 text-sm rounded-xl border bg-background focus:outline-hidden font-medium ${
                    confirmPassword && newPassword !== confirmPassword
                      ? "border-rose-500 focus:ring-2 focus:ring-rose-500/25"
                      : "border-border focus:ring-2 focus:ring-emerald-500/25"
                  }`}
                />
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-[11px] text-rose-600 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Passwords do not match
                  </p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={changingPassword || (!!confirmPassword && newPassword !== confirmPassword)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <Lock className="w-4 h-4" />
                  {changingPassword ? "Updating Password..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
