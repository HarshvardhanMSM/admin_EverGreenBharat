"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Shield,
  User,
  Smartphone,
  X,
  Loader2,
  KeyRound,
  Globe,
  Image,
  Lock,
  CheckCircle2,
  XCircle,
  MessageSquareWarning,
  History,
  Pencil,
  Slash,
  UserCheck,
} from "lucide-react";
import apiClient from "@/services/api/client";
import { homeContentService } from "@/services/api/home-content-service";
import { useAuth } from "@/hooks/useAuth";
import { extractPagination } from "@/utils/pagination";

interface UserDetailsSheetProps {
  user: any;
  onClose: () => void;
  onSuspend: (user: any) => void;
  onBan: (user: any) => void;
  onWarn: (user: any) => void;
  onActivate: (user: any) => void;
  onEdit: (user: any) => void;
}

type TabKey = "overview" | "account" | "media" | "onboarding" | "follows" | "moderation" | "sessions";

const ONBOARDING_STEPS = [
  "ACCOUNT_CREATED",
  "PROFILE_COMPLETED",
  "INTERESTS_SELECTED",
  "EMAIL_VERIFIED",
  "READY",
] as const;

function StatusBadge({ status }: { status?: string }) {
  const cls =
    status === "ACTIVE"
      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
      : status === "SUSPENDED"
      ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
      : status === "BANNED"
      ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
      : status === "PENDING_VERIFICATION"
      ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
      : "bg-muted text-muted-foreground border-border";
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cls}`}>
      {status || "NONE"}
    </span>
  );
}

function VerificationBadge({ status }: { status?: string }) {
  const isVerified = status === "VERIFIED";
  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
        isVerified
          ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
          : "bg-muted text-muted-foreground border-border"
      }`}
    >
      {status || "NONE"}
    </span>
  );
}

function OnboardingBadge({ status }: { status?: string }) {
  const color: Record<string, string> = {
    ACCOUNT_CREATED: "bg-muted text-muted-foreground border-border",
    PROFILE_COMPLETED: "bg-sky-500/10 text-sky-500 border-sky-500/20",
    INTERESTS_SELECTED: "bg-violet-500/10 text-violet-500 border-violet-500/20",
    EMAIL_VERIFIED: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
    READY: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  };
  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
        color[status || ""] || "bg-muted text-muted-foreground border-border"
      }`}
    >
      {status || "N/A"}
    </span>
  );
}

function AuthProviderBadge({ provider }: { provider?: string }) {
  const color: Record<string, string> = {
    LOCAL: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
    GOOGLE: "bg-red-500/10 text-red-500 border-red-500/20",
    PHONE: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  };
  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
        color[provider || ""] || "bg-muted text-muted-foreground border-border"
      }`}
    >
      {provider || "N/A"}
    </span>
  );
}

function ModerationActionBadge({ action }: { action?: string }) {
  const color: Record<string, string> = {
    WARN: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    SUSPEND: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    BAN: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    ACTIVATE: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    DELETE: "bg-red-500/10 text-red-500 border-red-500/20",
    DEACTIVATE: "bg-slate-500/10 text-slate-500 border-slate-500/20",
  };
  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
        color[action || ""] || "bg-muted text-muted-foreground border-border"
      }`}
    >
      {action || "N/A"}
    </span>
  );
}

function VerifiedIcon({ verified }: { verified?: boolean }) {
  return verified ? (
    <CheckCircle2 className="w-4 h-4 text-emerald-500 inline" />
  ) : (
    <XCircle className="w-4 h-4 text-muted-foreground/50 inline" />
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-1 border-b border-border/50 text-sm">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="font-medium text-right break-all">{value}</span>
    </div>
  );
}

export function UserDetailsSheet({
  user,
  onClose,
  onSuspend,
  onBan,
  onWarn,
  onActivate,
  onEdit,
}: UserDetailsSheetProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [detail, setDetail] = useState<any>(user);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [moderationEvents, setModerationEvents] = useState<any[]>([]);
  const [moderationPage, setModerationPage] = useState(1);
  const [moderationTotalPages, setModerationTotalPages] = useState(1);
  const [moderationTotal, setModerationTotal] = useState(0);
  const [loadingModeration, setLoadingModeration] = useState(false);
  const { hasPermission } = useAuth();

  const fetchDetail = useCallback(async (userId: string) => {
    setLoadingDetail(true);
    try {
      const { data } = await apiClient.get(`/v1/admin/users/${userId}`);
      const unwrapped = data?.data ?? data;
      setDetail(unwrapped);
    } catch {
      // keep list payload as fallback
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  const fetchSessions = useCallback(async (userId: string) => {
    setLoadingSessions(true);
    try {
      const { data } = await apiClient.get(`/v1/admin/users/${userId}/sessions`);
      setSessions(data?.data ?? []);
    } catch {
      setSessions([]);
    } finally {
      setLoadingSessions(false);
    }
  }, []);

  const fetchModeration = useCallback(async (userId: string, page: number) => {
    setLoadingModeration(true);
    try {
      const { data } = await apiClient.get(`/v1/admin/users/${userId}/moderation-events`, {
        params: { page, limit: 10 },
      });
      const rawEvents = data?.data?.data ?? data?.data ?? (Array.isArray(data) ? data : []);
      setModerationEvents(Array.isArray(rawEvents) ? rawEvents : []);
      const p = extractPagination(data, 10);
      setModerationPage(p.page);
      setModerationTotalPages(p.totalPages);
      setModerationTotal(p.total);
    } catch {
      setModerationEvents([]);
    } finally {
      setLoadingModeration(false);
    }
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchDetail(user.id);
    }
  }, [user, fetchDetail]);

  useEffect(() => {
    if (activeTab === "sessions" && user?.id) {
      fetchSessions(user.id);
    }
    if (activeTab === "moderation" && user?.id) {
      fetchModeration(user.id, 1);
    }
  }, [activeTab, user, fetchSessions, fetchModeration]);

  const renderValue = (value: any): string => {
    if (value === null || value === undefined || value === "") return "—";
    return String(value);
  };

  if (!user) return null;

  const canWrite = hasPermission("users:write");
  const canBan = hasPermission("users:ban");
  const u = detail || user;
  const isActive = u.status === "ACTIVE";
  const currentStepIndex = ONBOARDING_STEPS.indexOf(u.onboardingStatus);

  const [followingList, setFollowingList] = useState<any[]>([]);
  const [loadingFollows, setLoadingFollows] = useState(false);

  const fetchFollows = useCallback(async (userId: string) => {
    setLoadingFollows(true);
    try {
      const res = await homeContentService.fetchUserFollowing(userId);
      setFollowingList(res?.data ?? []);
    } catch {
      setFollowingList([]);
    } finally {
      setLoadingFollows(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "follows" && user?.id) {
      fetchFollows(user.id);
    }
  }, [activeTab, user, fetchFollows]);

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: "overview", label: "Overview", icon: <User className="w-3.5 h-3.5" /> },
    { key: "account", label: "Account", icon: <KeyRound className="w-3.5 h-3.5" /> },
    { key: "media", label: "Media & Privacy", icon: <Image className="w-3.5 h-3.5" /> },
    { key: "onboarding", label: "Onboarding", icon: <Shield className="w-3.5 h-3.5" /> },
    { key: "follows", label: "Following", icon: <UserCheck className="w-3.5 h-3.5" /> },
    { key: "moderation", label: "Moderation", icon: <History className="w-3.5 h-3.5" /> },
    { key: "sessions", label: "Sessions", icon: <Smartphone className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-card text-card-foreground border-l border-border h-full shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-accent/20 border border-accent flex items-center justify-center text-xl font-bold overflow-hidden">
              {u.avatarUrl ? (
                <img src={u.avatarUrl} alt={u.username} className="w-full h-full object-cover" />
              ) : (
                u.username?.[0]?.toUpperCase() || "U"
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold">{u.displayName || u.username}</h2>
              <p className="text-sm text-muted-foreground">@{u.username} • {u.email}</p>
              {u.deletedAt && (
                <p className="text-xs text-rose-500 font-medium">Soft-deleted {new Date(u.deletedAt).toLocaleString()}</p>
              )}
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-border px-4 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`py-3 px-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === t.key
                  ? "border-primary text-primary font-semibold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {loadingDetail && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading full profile...
            </div>
          )}

          {activeTab === "overview" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-muted/30 p-4">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                    <Shield className="w-4 h-4" /> Account Status
                  </div>
                  <StatusBadge status={u.status} />
                </Card>
                <Card className="bg-muted/30 p-4">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                    <User className="w-4 h-4" /> Verification
                  </div>
                  <VerificationBadge status={u.verificationStatus} />
                </Card>
                <Card className="bg-muted/30 p-4">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                    <KeyRound className="w-4 h-4" /> Auth Provider
                  </div>
                  <AuthProviderBadge provider={u.authProvider} />
                </Card>
                <Card className="bg-muted/30 p-4">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                    <Shield className="w-4 h-4" /> Onboarding
                  </div>
                  <OnboardingBadge status={u.onboardingStatus} />
                </Card>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Profile Information
                </h3>
                <InfoRow label="Bio" value={u.bio || "—"} />
                <InfoRow label="First Name" value={renderValue(u.firstName)} />
                <InfoRow label="Last Name" value={renderValue(u.lastName)} />
                <InfoRow label="Gender" value={renderValue(u.gender)} />
                <InfoRow label="Date of Birth" value={u.dateOfBirth ? new Date(u.dateOfBirth).toLocaleDateString() : "—"} />
                <InfoRow label="Country" value={renderValue(u.country)} />
                <InfoRow label="Language" value={renderValue(u.language)} />
                <InfoRow label="Timezone" value={renderValue(u.timezone)} />
                <InfoRow label="Joined Date" value={u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"} />
                <InfoRow label="Last Active" value={u.lastSeenAt ? new Date(u.lastSeenAt).toLocaleString() : "Never"} />
              </div>
            </>
          )}

          {activeTab === "account" && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Login & Verification
              </h3>
              <InfoRow
                label="Email"
                value={
                  <span className="inline-flex items-center gap-1.5">
                    {u.email || "—"} <VerifiedIcon verified={u.isEmailVerified} />
                  </span>
                }
              />
              <InfoRow
                label="Phone"
                value={
                  <span className="inline-flex items-center gap-1.5">
                    {u.phone || "—"} <VerifiedIcon verified={u.isPhoneVerified} />
                  </span>
                }
              />
              <InfoRow label="Auth Provider" value={<AuthProviderBadge provider={u.authProvider} />} />
              <InfoRow label="Last Login" value={u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : "Never"} />
              <InfoRow label="Last Seen" value={u.lastSeenAt ? new Date(u.lastSeenAt).toLocaleString() : "Never"} />
              <InfoRow label="Failed Login Attempts" value={renderValue(u.failedLoginAttempts)} />
              <InfoRow label="Lockout Until" value={u.lockoutUntil ? new Date(u.lockoutUntil).toLocaleString() : "None"} />
              <InfoRow
                label="Username Changed"
                value={u.lastUsernameChangedAt ? new Date(u.lastUsernameChangedAt).toLocaleString() : "Never"}
              />
              <InfoRow label="Deactivated At" value={u.deactivatedAt ? new Date(u.deactivatedAt).toLocaleString() : "—"} />
            </div>
          )}

          {activeTab === "media" && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Avatar</h3>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-accent/20 border border-accent overflow-hidden">
                    {u.avatarUrl ? (
                      <img src={u.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl font-bold">
                        {u.username?.[0]?.toUpperCase() || "U"}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground break-all">{u.avatarUrl || "No avatar set"}</p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Cover Image</h3>
                {u.coverImageUrl ? (
                  <img src={u.coverImageUrl} alt="Cover" className="w-full h-32 object-cover rounded-lg border border-border" />
                ) : (
                  <p className="text-xs text-muted-foreground">No cover image set</p>
                )}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Social Links</h3>
                {u.socialLinks && Object.keys(u.socialLinks).length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(u.socialLinks).map(([platform, url]) => (
                      <a
                        key={platform}
                        href={url as string}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border border-border bg-muted/30 hover:bg-muted transition-colors"
                      >
                        <Globe className="w-3 h-3" /> {platform}
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No social links set</p>
                )}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Privacy</h3>
                <InfoRow
                  label="Private Profile"
                  value={
                    u.isPrivateProfile ? (
                      <span className="inline-flex items-center gap-1.5 text-amber-500">
                        <Lock className="w-3.5 h-3.5" /> Private
                      </span>
                    ) : (
                      <span className="text-emerald-500">Public</span>
                    )
                  }
                />
              </div>
            </div>
          )}

          {activeTab === "onboarding" && (
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Current Status</h3>
                <OnboardingBadge status={u.onboardingStatus} />
              </div>
              <div className="space-y-1.5">
                {ONBOARDING_STEPS.map((step, idx) => {
                  const reached = idx <= currentStepIndex;
                  const isCurrent = idx === currentStepIndex;
                  return (
                    <div
                      key={step}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors ${
                        isCurrent
                          ? "border-primary/40 bg-primary/5"
                          : reached
                          ? "border-border bg-muted/30"
                          : "border-border bg-muted/10 opacity-50"
                      }`}
                    >
                      {reached ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                      )}
                      <span className="text-sm font-medium">{step.replace(/_/g, " ")}</span>
                      {isCurrent && <span className="ml-auto text-xs text-primary font-semibold">Current</span>}
                    </div>
                  );
                })}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Preferred Content Languages
                </h3>
                {u.preferredContentLanguages && u.preferredContentLanguages.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {u.preferredContentLanguages.map((lang: string) => (
                      <span key={lang} className="px-2.5 py-1 rounded-full text-xs font-medium border border-border bg-muted/30">
                        {lang}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">None selected</p>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                READY status additionally requires an active wallet; it completes when a wallet exists.
              </p>
            </div>
          )}

          {activeTab === "follows" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Followed Creators</h3>
                <span className="text-xs text-muted-foreground">{followingList.length} creator(s)</span>
              </div>

              {loadingFollows ? (
                <div className="flex items-center justify-center p-8 text-muted-foreground">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading followed creators...
                </div>
              ) : followingList.length === 0 ? (
                <Card className="p-4 bg-muted/20 border border-border text-center text-xs text-muted-foreground">
                  User is not following any creators yet.
                </Card>
              ) : (
                <div className="space-y-2">
                  {followingList.map((item) => (
                    <Card key={item.id} className="p-3 bg-muted/20 border border-border flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-xs overflow-hidden">
                          {item.creator?.avatarUrl ? (
                            <img src={item.creator.avatarUrl} alt={item.creator.displayName} className="w-full h-full object-cover" />
                          ) : (
                            item.creator?.displayName?.[0]?.toUpperCase() || "C"
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{item.creator?.displayName || "Unknown Creator"}</p>
                          <p className="text-xs text-muted-foreground">@{item.creator?.slug} • {item.creator?.totalFollowers || 0} followers</p>
                        </div>
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        Followed {new Date(item.followedAt).toLocaleDateString()}
                      </span>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "moderation" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Moderation History</h3>
                <span className="text-xs text-muted-foreground">{moderationTotal} event(s)</span>
              </div>

              {loadingModeration ? (
                <div className="flex items-center justify-center p-8 text-muted-foreground">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading history...
                </div>
              ) : moderationEvents.length === 0 ? (
                <Card className="p-4 bg-muted/20 border border-border text-center text-xs text-muted-foreground">
                  No moderation events recorded for this user.
                </Card>
              ) : (
                <>
                  <div className="space-y-3">
                    {moderationEvents.map((event) => (
                      <Card key={event.id} className="p-4 bg-muted/20 border border-border space-y-2">
                        <div className="flex items-center justify-between">
                          <ModerationActionBadge action={event.action} />
                          <span className="text-xs text-muted-foreground">
                            {new Date(event.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm">{event.reason || "No reason provided"}</p>
                        <p className="text-xs text-muted-foreground">
                          By{" "}
                          <span className="font-medium">
                            {event.adminName ? `@${event.adminName}` : "System / Self-service"}
                          </span>
                          {event.adminEmail ? ` (${event.adminEmail})` : ""}
                        </p>
                      </Card>
                    ))}
                  </div>
                  {moderationTotalPages > 1 && (
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <Button variant="outline" size="sm" disabled={moderationPage <= 1} onClick={() => fetchModeration(user.id, moderationPage - 1)}>
                        Previous
                      </Button>
                      <span>{moderationPage} / {moderationTotalPages}</span>
                      <Button variant="outline" size="sm" disabled={moderationPage >= moderationTotalPages} onClick={() => fetchModeration(user.id, moderationPage + 1)}>
                        Next
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === "sessions" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Logged-in Devices</h3>
                <span className="text-xs text-muted-foreground">{sessions.length} Active Session(s)</span>
              </div>

              {loadingSessions ? (
                <div className="flex items-center justify-center p-8 text-muted-foreground">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading sessions...
                </div>
              ) : sessions.length === 0 ? (
                <Card className="p-4 bg-muted/20 border border-border text-center text-xs text-muted-foreground">
                  No active refresh sessions found for this user.
                </Card>
              ) : (
                sessions.map((s) => (
                  <Card key={s.id} className="p-4 bg-muted/20 border border-border flex items-center gap-4">
                    <Smartphone className="w-6 h-6 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{s.deviceInfo || "Device Session"}</p>
                      <p className="text-xs text-muted-foreground">
                        IP: {s.ipAddress || "Unknown"} • Created: {new Date(s.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </Card>
                ))
              )}
              <p className="text-xs text-muted-foreground">
                Sessions are revoked automatically when an account is suspended, banned, or deleted.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions with RBAC */}
        <div className="p-6 border-t border-border bg-muted/10 flex items-center justify-between gap-3">
          {canWrite && (
            <Button variant="outline" onClick={() => onEdit(u)}>
              <Pencil className="w-4 h-4 mr-1.5" /> Edit
            </Button>
          )}
          <div className="flex items-center justify-end gap-3">
            {isActive ? (
              <>
                {canBan && (
                  <Button variant="outline" className="border-amber-500/30 text-amber-500 hover:bg-amber-500/10" onClick={() => onWarn(u)}>
                    <MessageSquareWarning className="w-4 h-4 mr-1.5" /> Warn
                  </Button>
                )}
                {canBan && (
                  <Button variant="outline" className="border-amber-500/30 text-amber-500 hover:bg-amber-500/10" onClick={() => onSuspend(u)}>
                    <Slash className="w-4 h-4 mr-1.5" /> Suspend
                  </Button>
                )}
                {canBan && (
                  <Button variant="destructive" onClick={() => onBan(u)}>
                    <Shield className="w-4 h-4 mr-1.5" /> Ban User
                  </Button>
                )}
              </>
            ) : (
              canWrite && (
                <Button variant="outline" className="border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10" onClick={() => onActivate(u)}>
                  <CheckCircle2 className="w-4 h-4 mr-1.5" /> Reactivate
                </Button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
