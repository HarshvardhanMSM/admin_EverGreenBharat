"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Pencil, X } from "lucide-react";

const SOCIAL_PLATFORMS = [
  "youtube",
  "twitter",
  "x",
  "instagram",
  "tiktok",
  "facebook",
  "twitch",
] as const;

interface EditUserDialogProps {
  user: any;
  onClose: () => void;
  onSave: (userId: string, payload: Record<string, any>) => Promise<void>;
}

function buildInitialForm(user: any): Record<string, any> {
  const socials: Record<string, string> = {};
  SOCIAL_PLATFORMS.forEach((p) => {
    socials[p] = user.socialLinks?.[p] ?? "";
  });
  return {
    socialLinks: socials,
    contentLanguages: (user.preferredContentLanguages || []).join(", "),
    displayName: user.displayName || "",
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    username: user.username || "",
    email: user.email || "",
    phone: user.phone || "",
    bio: user.bio || "",
    avatarUrl: user.avatarUrl || "",
    coverImageUrl: user.coverImageUrl || "",
    dateOfBirth: user.dateOfBirth || "",
    language: user.language || "",
    timezone: user.timezone || "",
    gender: user.gender || "",
    country: user.country || "",
    status: user.status || "ACTIVE",
    verificationStatus: user.verificationStatus || "NONE",
    isEmailVerified: !!user.isEmailVerified,
    isPhoneVerified: !!user.isPhoneVerified,
    isPrivateProfile: !!user.isPrivateProfile,
  };
}

export function EditUserDialog({ user, onClose, onSave }: EditUserDialogProps) {
  const [form, setForm] = useState<Record<string, any>>(() => buildInitialForm(user));
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const socialLinks = (form.socialLinks as Record<string, string>) || {};
  const contentLanguages = form.contentLanguages as string;

  const set = (key: string, value: any) => setForm((f) => ({ ...f, [key]: value }));
  const setSocialLink = (platform: string, value: string) =>
    setForm((f) => ({ ...f, socialLinks: { ...(f.socialLinks as Record<string, string>), [platform]: value } }));

  const buildPayload = (): Record<string, any> => {
    const payload: Record<string, any> = {};
    const allowedKeys = [
      "displayName",
      "firstName",
      "lastName",
      "username",
      "email",
      "phone",
      "bio",
      "avatarUrl",
      "coverImageUrl",
      "dateOfBirth",
      "language",
      "timezone",
      "gender",
      "country",
      "status",
      "verificationStatus",
      "isEmailVerified",
      "isPhoneVerified",
      "isPrivateProfile",
    ];
    allowedKeys.forEach((key) => {
      const original = user[key];
      const next = form[key];
      if (String(original ?? "") !== String(next ?? "")) {
        if (typeof original === "boolean" || typeof next === "boolean") {
          if (!!original !== !!next) payload[key] = next;
        } else {
          payload[key] = next;
        }
      }
    });

    const langs = contentLanguages
      .split(",")
      .map((l) => l.trim().toLowerCase())
      .filter(Boolean);    if ((user.preferredContentLanguages || []).join(",") !== langs.join(",")) {
      payload.preferredContentLanguages = langs;
    }

    const socials: Record<string, string> = {};
    SOCIAL_PLATFORMS.forEach((p) => {
      const v = socialLinks[p]?.trim() || "";
      if (v) socials[p] = v;
    });
    if (JSON.stringify(user.socialLinks || {}) !== JSON.stringify(socials)) {
      payload.socialLinks = socials;
    }

    return payload;
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const payload = buildPayload();
      if (Object.keys(payload).length === 0) {
        onClose();
        return;
      }
      await onSave(user.id, payload);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    "w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary";
  const labelCls = "block text-xs font-semibold uppercase mb-1 text-muted-foreground";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-150 p-4">
      <div className="w-full max-w-2xl bg-card text-card-foreground border border-border rounded-xl shadow-2xl max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <Pencil className="w-5 h-5 text-primary" />
            <div>
              <h3 className="text-lg font-bold">Edit User</h3>
              <p className="text-xs text-muted-foreground">
                @{user.username} • {user.email}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          {/* Identity */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Identity</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Display Name</label>
                <input className={inputCls} value={form.displayName} onChange={(e) => set("displayName", e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Username</label>
                <input className={inputCls} value={form.username} onChange={(e) => set("username", e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>First Name</label>
                <input className={inputCls} value={form.firstName} onChange={(e) => set("firstName", e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Last Name</label>
                <input className={inputCls} value={form.lastName} onChange={(e) => set("lastName", e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Gender</label>
                <select className={inputCls} value={form.gender} onChange={(e) => set("gender", e.target.value)}>
                  <option value="">Not set</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                  <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Date of Birth</label>
                <input type="date" className={inputCls} value={form.dateOfBirth} onChange={(e) => set("dateOfBirth", e.target.value)} />
              </div>
            </div>
          </div>

          {/* Account */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Account</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Email</label>
                <input className={inputCls} value={form.email} onChange={(e) => set("email", e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Phone</label>
                <input className={inputCls} value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+15551234567" />
              </div>
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={form.isEmailVerified}
                  onChange={(e) => set("isEmailVerified", e.target.checked)}
                  className="h-4 w-4 rounded border-border"
                />
                Email Verified
              </label>
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={form.isPhoneVerified}
                  onChange={(e) => set("isPhoneVerified", e.target.checked)}
                  className="h-4 w-4 rounded border-border"
                />
                Phone Verified
              </label>
            </div>
          </div>

          {/* Profile */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Profile</h4>
            <div>
              <label className={labelCls}>Bio</label>
              <textarea
                className={`${inputCls} min-h-20 resize-y`}
                value={form.bio}
                onChange={(e) => set("bio", e.target.value)}
                placeholder="Short bio shown on public profile"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Country (ISO-2)</label>
                <input className={inputCls} value={form.country} onChange={(e) => set("country", e.target.value)} placeholder="US" maxLength={2} />
              </div>
              <div>
                <label className={labelCls}>Language (App UI)</label>
                <input className={inputCls} value={form.language} onChange={(e) => set("language", e.target.value)} placeholder="en" />
              </div>
              <div>
                <label className={labelCls}>Timezone</label>
                <input className={inputCls} value={form.timezone} onChange={(e) => set("timezone", e.target.value)} placeholder="America/New_York" />
              </div>
              <div>
                <label className={labelCls}>Preferred Content Languages</label>
                <input
                  className={inputCls}
                  value={contentLanguages}
                  onChange={(e) => set("contentLanguages", e.target.value)}
                  placeholder="en, ar, es (comma separated, max 10)"
                />
              </div>
            </div>
          </div>

          {/* Media */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Media</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Avatar URL</label>
                <Input className="mt-1" value={form.avatarUrl} onChange={(e) => set("avatarUrl", e.target.value)} placeholder="/api/v1/uploads/avatars/..." />
                {form.avatarUrl && (
                  <img src={form.avatarUrl} alt="Avatar preview" className="mt-2 w-16 h-16 rounded-full object-cover border border-border" />
                )}
              </div>
              <div>
                <label className={labelCls}>Cover Image URL</label>
                <Input className="mt-1" value={form.coverImageUrl} onChange={(e) => set("coverImageUrl", e.target.value)} placeholder="/api/v1/uploads/covers/..." />
                {form.coverImageUrl && (
                  <img src={form.coverImageUrl} alt="Cover preview" className="mt-2 w-full h-16 object-cover rounded-lg border border-border" />
                )}
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Social Links</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {SOCIAL_PLATFORMS.map((platform) => (
                <div key={platform}>
                  <label className={labelCls}>{platform}</label>
                  <Input
                    className="mt-1"
                    value={socialLinks[platform]}
                    onChange={(e) => setSocialLink(platform, e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Account Status</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Status</label>
                <select className={inputCls} value={form.status} onChange={(e) => set("status", e.target.value)}>
                  <option value="PENDING_VERIFICATION">Pending Verification</option>
                  <option value="ACTIVE">Active</option>
                  <option value="SUSPENDED">Suspended</option>
                  <option value="BANNED">Banned</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Verification Status</label>
                <select className={inputCls} value={form.verificationStatus} onChange={(e) => set("verificationStatus", e.target.value)}>
                  <option value="NONE">None</option>
                  <option value="PENDING">Pending</option>
                  <option value="VERIFIED">Verified</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={form.isPrivateProfile}
                  onChange={(e) => set("isPrivateProfile", e.target.checked)}
                  className="h-4 w-4 rounded border-border"
                />
                Private Profile
              </label>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-border flex items-center justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
