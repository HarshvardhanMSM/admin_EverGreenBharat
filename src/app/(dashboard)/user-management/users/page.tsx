"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/toast";
import { Pagination } from "@/components/common";
import { extractPagination } from "@/utils/pagination";
import {
  Search,
  Download,
  Eye,
  Slash,
  ShieldAlert,
  CheckCircle,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Pencil,
  MessageSquareWarning,
  CheckCircle2,
  XCircle,
  ArrowUpDown,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserDetailsSheet } from "@/components/users/UserDetailsSheet";
import { SuspendUserDialog } from "@/components/users/SuspendUserDialog";
import { BanUserDialog } from "@/components/users/BanUserDialog";
import { WarnUserDialog } from "@/components/users/WarnUserDialog";
import { EditUserDialog } from "@/components/users/EditUserDialog";
import { FilterDropdown } from "@/components/common";
import {
  USER_STATUS_OPTIONS,
  VERIFICATION_STATUS_OPTIONS,
  AUTH_PROVIDER_OPTIONS,
  USER_SORT_OPTIONS,
} from "@/constants/filter-options";
import apiClient from "@/services/api/client";

import { useAuth } from "@/hooks/useAuth";

function StatusBadge({ status }: { status?: string }) {
  const cls =
    status === "ACTIVE"
      ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
      : status === "SUSPENDED"
      ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
      : status === "BANNED"
      ? "bg-rose-500/10 text-rose-500 border border-rose-500/20"
      : status === "PENDING_VERIFICATION"
      ? "bg-blue-500/10 text-blue-500 border border-blue-500/20"
      : "bg-muted text-muted-foreground border border-border";
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
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

export default function UsersPage() {
  const { hasPermission } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [verificationFilter, setVerificationFilter] = useState("ALL");
  const [authProviderFilter, setAuthProviderFilter] = useState("ALL");
  const [countryFilter, setCountryFilter] = useState("");
  const [sort, setSort] = useState("createdAt:desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  // Selected User Modal States
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [suspendTarget, setSuspendTarget] = useState<any | null>(null);
  const [banTarget, setBanTarget] = useState<any | null>(null);
  const [warnTarget, setWarnTarget] = useState<any | null>(null);
  const [editTarget, setEditTarget] = useState<any | null>(null);

  // Selection for bulk actions
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  // Reset to page 1 on filter/search change
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, verificationFilter, authProviderFilter, countryFilter, sort]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit: pageSize,
        sort,
      };

      if (search.trim()) params.search = search.trim();
      if (statusFilter !== "ALL") params.status = statusFilter;
      if (verificationFilter !== "ALL") params.verificationStatus = verificationFilter;
      if (authProviderFilter !== "ALL") params.authProvider = authProviderFilter;
      if (countryFilter.trim()) params.country = countryFilter.trim().toUpperCase();

      const response = await apiClient.get("/v1/admin/users", { params });
      const resPayload = response.data;
      const rawUsers = (resPayload as any)?.data?.data ?? (resPayload as any)?.data ?? resPayload;
      const usersList = Array.isArray(rawUsers) ? rawUsers : [];
      setUsers(usersList);

      const pagination = extractPagination(resPayload, pageSize);
      setTotalPages(pagination.totalPages);
      setTotalUsers(pagination.total);
    } catch (err: any) {
      toast.add({
        type: "error",
        description: err?.response?.data?.message || "Failed to load users",
      });
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, statusFilter, verificationFilter, authProviderFilter, countryFilter, sort]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const handleExportCsv = async () => {
    try {
      const response = await apiClient.get("/v1/admin/users/export", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `users_export_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.add({
        type: "success",
        description: "Users CSV report exported successfully.",
      });
    } catch {
      toast.add({
        type: "error",
        description: "Failed to export CSV report.",
      });
    }
  };

  const handleSuspendConfirm = async (userId: string, reason: string, durationDays: number) => {
    try {
      await apiClient.post(`/v1/admin/users/${userId}/suspend`, {
        reason,
        durationDays,
      });

      toast.add({
        type: "warning",
        description: `User suspended for ${durationDays} days.`,
      });

      setSuspendTarget(null);
      fetchUsers();
    } catch (err: any) {
      toast.add({
        type: "error",
        description: err?.response?.data?.message || "Failed to suspend user",
      });
    }
  };

  const handleBanConfirm = async (userId: string, reason: string) => {
    try {
      await apiClient.post(`/v1/admin/users/${userId}/ban`, { reason });

      toast.add({
        type: "error",
        description: "User permanently banned.",
      });

      setBanTarget(null);
      fetchUsers();
    } catch (err: any) {
      toast.add({
        type: "error",
        description: err?.response?.data?.message || "Failed to ban user",
      });
    }
  };

  const handleWarnConfirm = async (userId: string, reason: string) => {
    try {
      await apiClient.post(`/v1/admin/users/${userId}/warn`, { reason });

      toast.add({
        type: "warning",
        description: "Formal warning issued. It appears in the user's moderation history.",
      });

      setWarnTarget(null);
      fetchUsers();
    } catch (err: any) {
      toast.add({
        type: "error",
        description: err?.response?.data?.message || "Failed to warn user",
      });
    }
  };

  const handleActivateUser = async (targetUser: any) => {
    try {
      await apiClient.post(`/v1/admin/users/${targetUser.id}/activate`);

      toast.add({
        type: "success",
        description: `User @${targetUser.username} reactivated successfully.`,
      });

      fetchUsers();
    } catch (err: any) {
      toast.add({
        type: "error",
        description: err?.response?.data?.message || "Failed to reactivate user",
      });
    }
  };

  const handleSoftDelete = async (targetUser: any) => {
    try {
      await apiClient.delete(`/v1/admin/users/${targetUser.id}`);

      toast.add({
        type: "success",
        description: `User @${targetUser.username} deleted successfully.`,
      });

      fetchUsers();
    } catch (err: any) {
      toast.add({
        type: "error",
        description: err?.response?.data?.message || "Failed to delete user",
      });
    }
  };

  const handleEditSave = async (userId: string, payload: Record<string, any>) => {
    try {
      await apiClient.patch(`/v1/admin/users/${userId}`, payload);

      toast.add({
        type: "success",
        description: "User profile updated successfully.",
      });

      setEditTarget(null);
      fetchUsers();
    } catch (err: any) {
      toast.add({
        type: "error",
        description: err?.response?.data?.message || "Failed to update user",
      });
      throw err;
    }
  };

  const handleToggleSelect = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleBulkAction = async (action: "SUSPEND" | "BAN" | "ACTIVATE") => {
    try {
      await apiClient.post("/v1/admin/users/bulk-action", {
        userIds: selectedUserIds,
        action,
        reason: "Administrative batch action from console",
      });

      toast.add({
        type: "success",
        description: `Bulk ${action} executed for ${selectedUserIds.length} users.`,
      });

      setSelectedUserIds([]);
      fetchUsers();
    } catch (err: any) {
      toast.add({
        type: "error",
        description: err?.response?.data?.message || "Failed to execute bulk action",
      });
    }
  };

  const canRead = hasPermission("users:read");
  const canWrite = hasPermission("users:write");
  const canBan = hasPermission("users:ban");

  if (!canRead) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <ShieldAlert className="w-12 h-12 mx-auto text-amber-500 mb-3" />
        <h2 className="text-xl font-bold text-foreground">Access Denied</h2>
        <p className="text-sm mt-1">You do not have permission to view User Management.</p>
      </div>
    );
  }

  const tableCols = 10;

  return (
    <div className="p-8 space-y-8 max-w-82xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Search, filter, view details, and manage platform user account statuses.
          </p>
        </div>
        <Button variant="outline" className="gap-2" onClick={handleExportCsv}>
          <Download className="w-4 h-4" /> Export CSV
        </Button>
      </div>

      {/* Search & Filters */}
      <Card className="p-4 bg-card">
        <div className="flex flex-col lg:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by username, email, phone, or display name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 w-full"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <FilterDropdown
              value={statusFilter}
              options={USER_STATUS_OPTIONS}
              onValueChange={(val) => {
                setStatusFilter(val);
                setPage(1);
              }}
              label="Account Status"
              width="w-[180px]"
            />

            <FilterDropdown
              value={verificationFilter}
              options={VERIFICATION_STATUS_OPTIONS}
              onValueChange={(val) => {
                setVerificationFilter(val);
                setPage(1);
              }}
              label="Verification Status"
              width="w-[190px]"
            />

            <FilterDropdown
              value={authProviderFilter}
              options={AUTH_PROVIDER_OPTIONS}
              onValueChange={(val) => {
                setAuthProviderFilter(val);
                setPage(1);
              }}
              label="Auth Provider"
              width="w-[170px]"
            />

            <Input
              placeholder="Country (e.g. US)"
              value={countryFilter}
              onChange={(e) => {
                setCountryFilter(e.target.value);
                setPage(1);
              }}
              className="w-32"
            />

            <FilterDropdown
              value={sort}
              options={USER_SORT_OPTIONS}
              onValueChange={(val) => {
                setSort(val);
                setPage(1);
              }}
              label="Sort"
              icon={<ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
              width="w-[160px]"
            />
          </div>
        </div>
      </Card>

      {/* Bulk Action Bar */}
      {selectedUserIds.length > 0 && canBan && (
        <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl flex items-center justify-between animate-in fade-in">
          <span className="text-sm font-semibold">
            {selectedUserIds.length} user(s) selected
          </span>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="text-amber-500 border-amber-500/30" onClick={() => handleBulkAction("SUSPEND")}>
              Bulk Suspend
            </Button>
            <Button size="sm" variant="destructive" onClick={() => handleBulkAction("BAN")}>
              Bulk Ban
            </Button>
            <Button size="sm" variant="outline" className="text-emerald-500 border-emerald-500/30" onClick={() => handleBulkAction("ACTIVATE")}>
              Bulk Activate
            </Button>
          </div>
        </div>
      )}

      {/* Users Data Table */}
      <Card className="overflow-hidden border border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase text-xs whitespace-nowrap">
              <tr>
                <th className="p-4 w-10">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) setSelectedUserIds(users.map((u) => u.id));
                      else setSelectedUserIds([]);
                    }}
                  />
                </th>
                <th className="p-4">User</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Auth Provider</th>
                <th className="p-4">Verification</th>
                <th className="p-4">Onboarding</th>
                <th className="p-4">Status</th>
                <th className="p-4">Country</th>
                <th className="p-4">Joined Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={tableCols} className="p-8 text-center text-muted-foreground">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" /> Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={tableCols} className="p-8 text-center text-muted-foreground">
                    No users found matching current filters.
                  </td>
                </tr>
              ) : (
                (Array.isArray(users) ? users : []).map((user) => (
                  <tr key={user.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedUserIds.includes(user.id)}
                        onChange={() => handleToggleSelect(user.id)}
                      />
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-accent/20 border border-accent flex items-center justify-center font-bold overflow-hidden">
                          {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                          ) : (
                            user.username?.[0]?.toUpperCase() || "U"
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{user.displayName || user.username}</p>
                          <p className="text-xs text-muted-foreground">@{user.username} • {user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      {user.phone ? (
                        <span className="inline-flex items-center gap-1.5">
                          {user.phone}
                          {user.isPhoneVerified ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-muted-foreground/40" />
                          )}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <AuthProviderBadge provider={user.authProvider} />
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            user.verificationStatus === "VERIFIED"
                              ? "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                              : "bg-muted text-muted-foreground border border-border"
                          }`}
                        >
                          {user.verificationStatus || "NONE"}
                        </span>
                        <div className="flex flex-col gap-0.5">
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            {user.isEmailVerified ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <XCircle className="w-3 h-3 text-muted-foreground/40" />
                            )}
                            Email
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <OnboardingBadge status={user.onboardingStatus} />
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <StatusBadge status={user.status} />
                    </td>
                    <td className="p-4 font-mono whitespace-nowrap">{user.country || "—"}</td>
                    <td className="p-4 text-muted-foreground whitespace-nowrap">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="h-8 w-8 rounded-lg text-muted-foreground hover:text-sky-600 hover:bg-sky-500/10 border border-border/40 hover:border-sky-500/30 transition-colors"
                          onClick={() => setSelectedUser(user)}
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {canWrite && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-emerald-600 hover:bg-emerald-500/10 border border-border/40 hover:border-emerald-500/30 transition-colors"
                            onClick={() => setEditTarget(user)}
                            title="Edit User"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted border border-border/40 hover:border-border transition-colors"
                                title="More Actions"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            }
                          />
                          <DropdownMenuContent align="end" className="w-48 shadow-lg">
                            <DropdownMenuLabel className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1">
                              User Actions
                            </DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => setSelectedUser(user)}
                              className="cursor-pointer flex items-center gap-2 text-sm"
                            >
                              <Eye className="w-4 h-4 text-sky-500" />
                              <span>View Profile</span>
                            </DropdownMenuItem>
                            {canWrite && (
                              <DropdownMenuItem
                                onClick={() => setEditTarget(user)}
                                className="cursor-pointer flex items-center gap-2 text-sm"
                              >
                                <Pencil className="w-4 h-4 text-emerald-500" />
                                <span>Edit Profile</span>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator className="my-1" />
                            {user.status === "ACTIVE" ? (
                              <>
                                {canBan && (
                                  <DropdownMenuItem
                                    onClick={() => setWarnTarget(user)}
                                    className="cursor-pointer flex items-center gap-2 text-sm text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                                  >
                                    <MessageSquareWarning className="w-4 h-4 text-amber-500" />
                                    <span>Send Warning</span>
                                  </DropdownMenuItem>
                                )}
                                {canBan && (
                                  <DropdownMenuItem
                                    onClick={() => setSuspendTarget(user)}
                                    className="cursor-pointer flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950/40"
                                  >
                                    <Slash className="w-4 h-4 text-orange-500" />
                                    <span>Suspend Account</span>
                                  </DropdownMenuItem>
                                )}
                                {canBan && (
                                  <DropdownMenuItem
                                    onClick={() => setBanTarget(user)}
                                    className="cursor-pointer flex items-center gap-2 text-sm text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                                  >
                                    <ShieldAlert className="w-4 h-4 text-rose-500" />
                                    <span>Ban User</span>
                                  </DropdownMenuItem>
                                )}
                              </>
                            ) : (
                              canWrite && (
                                <DropdownMenuItem
                                  onClick={() => handleActivateUser(user)}
                                  className="cursor-pointer flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                                >
                                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                                  <span>Reactivate Account</span>
                                </DropdownMenuItem>
                              )
                            )}
                            {canWrite && (
                              <>
                                <DropdownMenuSeparator className="my-1" />
                                <DropdownMenuItem
                                  onClick={() => handleSoftDelete(user)}
                                  className="cursor-pointer flex items-center gap-2 text-sm text-destructive hover:bg-destructive/10"
                                >
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                  <span>Delete User</span>
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
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
          totalItems={totalUsers}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          itemName="users"
          disabled={loading}
        />
      </Card>

      {/* User Details Drawer */}
      {selectedUser && (
        <UserDetailsSheet
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onSuspend={(u) => setSuspendTarget(u)}
          onBan={(u) => setBanTarget(u)}
          onWarn={(u) => setWarnTarget(u)}
          onActivate={(u) => handleActivateUser(u)}
          onEdit={(u) => setEditTarget(u)}
        />
      )}

      {/* Dialog Modals */}
      {suspendTarget && (
        <SuspendUserDialog
          user={suspendTarget}
          onClose={() => setSuspendTarget(null)}
          onConfirm={handleSuspendConfirm}
        />
      )}

      {banTarget && (
        <BanUserDialog
          user={banTarget}
          onClose={() => setBanTarget(null)}
          onConfirm={handleBanConfirm}
        />
      )}

      {warnTarget && (
        <WarnUserDialog
          user={warnTarget}
          onClose={() => setWarnTarget(null)}
          onConfirm={handleWarnConfirm}
        />
      )}

      {editTarget && (
        <EditUserDialog
          user={editTarget}
          onClose={() => setEditTarget(null)}
          onSave={handleEditSave}
        />
      )}
    </div>
  );
}
