"use client";

import { useEffect, useState } from "react";
import { adminService } from "@/services/api/admin-service";
import { rbacService } from "@/services/api/rbac-service";
import { AdminProfile } from "@/types/admin";
import { RoleItem } from "@/types/rbac";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FilterDropdown, Pagination } from "@/components/common";
import { extractPagination } from "@/utils/pagination";
import { ADMIN_STATUS_OPTIONS } from "@/constants/filter-options";

import { Shield, Plus, Search, MoreHorizontal, UserCheck, UserX, Key, LogOut, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { ConfirmModal } from "@/components/ui/confirm-modal";

export default function AdminManagementPage() {
  const [admins, setAdmins] = useState<AdminProfile[]>([]);
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Pagination states
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAdmins, setTotalAdmins] = useState(0);

  // Reset to page 1 on filter/search change
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSuspendOpen, setIsSuspendOpen] = useState(false);
  const [isResetPassOpen, setIsResetPassOpen] = useState(false);
  const [isRolesOpen, setIsRolesOpen] = useState(false);

  // Custom Confirmation Modal State
  const [confirmAction, setConfirmAction] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmText: string;
    variant: "danger" | "warning";
    isLoading: boolean;
    onConfirm: () => Promise<void>;
  }>({
    isOpen: false,
    title: "",
    description: "",
    confirmText: "Confirm",
    variant: "danger",
    isLoading: false,
    onConfirm: async () => {},
  });

  const [selectedAdmin, setSelectedAdmin] = useState<AdminProfile | null>(null);

  // Form states
  const [createForm, setCreateForm] = useState({
    email: "",
    username: "",
    password: "",
    displayName: "",
    department: "",
    notes: "",
    isSuperAdmin: false,
    roleCodes: [] as string[],
  });

  const [editForm, setEditForm] = useState({
    displayName: "",
    department: "",
    notes: "",
    status: "ACTIVE" as 'ACTIVE' | 'SUSPENDED' | 'INACTIVE',
  });

  const [suspendReason, setSuspendReason] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [assignedRoleCodes, setAssignedRoleCodes] = useState<string[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [adminsRes, rolesRes] = await Promise.all([
        adminService.fetchAdmins({
          search,
          status: statusFilter || undefined,
          page,
          limit: pageSize,
        }),
        rbacService.fetchRoles(),
      ]);
      const rawAdmins = (adminsRes as any)?.data?.data ?? (adminsRes as any)?.data ?? adminsRes;
      const adminsList = Array.isArray(rawAdmins) ? rawAdmins : [];
      const rawRoles = (rolesRes as any)?.data?.data ?? (rolesRes as any)?.data ?? rolesRes;
      const rolesList = Array.isArray(rawRoles) ? rawRoles : [];
      setAdmins(adminsList);
      setRoles(rolesList);

      const p = extractPagination(adminsRes, pageSize);
      setTotalPages(p.totalPages);
      setTotalAdmins(p.total);
    } catch (err) {
      console.error("Failed to load admins:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter, page, pageSize]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminService.createAdmin(createForm);
      setIsCreateOpen(false);
      setCreateForm({
        email: "",
        username: "",
        password: "",
        displayName: "",
        department: "",
        notes: "",
        isSuperAdmin: false,
        roleCodes: [],
      });
      toast.success("Admin account created successfully!");
      loadData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create admin");
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdmin) return;
    try {
      await adminService.updateAdmin(selectedAdmin.id, editForm);
      toast.success("Admin account updated successfully!");
      setIsEditOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update admin");
    }
  };

  const handleSuspend = async () => {
    if (!selectedAdmin) return;
    try {
      await adminService.suspendAdmin(selectedAdmin.id, suspendReason);
      toast.success("Admin account suspended!");
      setIsSuspendOpen(false);
      setSuspendReason("");
      loadData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to suspend admin");
    }
  };

  const handleActivate = async (admin: AdminProfile) => {
    try {
      await adminService.activateAdmin(admin.id);
      toast.success("Admin account activated!");
      loadData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to activate admin");
    }
  };

  const handleResetPassword = async () => {
    if (!selectedAdmin) return;
    try {
      await adminService.resetAdminPassword(selectedAdmin.id, newPassword);
      setIsResetPassOpen(false);
      setNewPassword("");
      toast.success("Password reset successfully!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to reset password");
    }
  };

  const handleForceLogout = (admin: AdminProfile) => {
    setConfirmAction({
      isOpen: true,
      title: "Force Logout All Active Sessions",
      description: `Are you sure you want to terminate all active sessions for ${admin.user.email}? They will be immediately logged out of all devices.`,
      confirmText: "Yes, Force Logout",
      variant: "warning",
      isLoading: false,
      onConfirm: async () => {
        try {
          await adminService.forceLogoutAdmin(admin.id);
          toast.success(`All active sessions for ${admin.user.email} revoked!`);
          setConfirmAction((prev) => ({ ...prev, isOpen: false }));
        } catch (err: any) {
          toast.error(err?.response?.data?.message || "Failed to force logout");
        }
      },
    });
  };

  const handleSoftDelete = (admin: AdminProfile) => {
    setConfirmAction({
      isOpen: true,
      title: "Delete Admin Account",
      description: `Are you sure you want to delete admin account ${admin.user.email}? Their administrative privileges will be deactivated.`,
      confirmText: "Yes, Delete Admin",
      variant: "danger",
      isLoading: false,
      onConfirm: async () => {
        try {
          await adminService.softDeleteAdmin(admin.id);
          toast.success(`Admin ${admin.user.email} deleted successfully!`);
          setConfirmAction((prev) => ({ ...prev, isOpen: false }));
          loadData();
        } catch (err: any) {
          toast.error(err?.response?.data?.message || "Failed to delete admin");
        }
      },
    });
  };

  const handleRestore = async (admin: AdminProfile) => {
    try {
      await adminService.restoreAdmin(admin.id);
      toast.success("Admin account restored!");
      loadData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to restore admin");
    }
  };

  const handleAssignRoles = async () => {
    if (!selectedAdmin) return;
    try {
      await adminService.assignAdminRoles(selectedAdmin.id, assignedRoleCodes);
      toast.success("Administrative roles updated successfully!");
      setIsRolesOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to assign roles");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff Management</h1>
          <p className="text-muted-foreground">
            Manage internal team members, assign operational roles, departments, and oversee staff access.
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add Staff Member
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or department..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <FilterDropdown
                value={statusFilter}
                options={ADMIN_STATUS_OPTIONS}
                onValueChange={(val) => setStatusFilter(val)}
                label="Staff Status"
                width="w-[160px]"
              />
              <Button variant="outline" onClick={loadData}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff Member</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Loading staff members...
                  </TableCell>
                </TableRow>
              ) : admins.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No staff members found matching search criteria.
                  </TableCell>
                </TableRow>
              ) : (
                admins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                          {admin.user?.displayName?.[0] || admin.user?.email?.[0] || 'A'}
                        </div>
                        <div>
                          <div className="font-semibold flex items-center gap-2">
                            {admin.user?.displayName || admin.user?.username}
                            {admin.isSuperAdmin && (
                              <Badge variant="default" className="bg-amber-600 hover:bg-amber-700">
                                Super Admin
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">{admin.user?.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{admin.department || "—"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          admin.status === "ACTIVE"
                            ? "default"
                            : admin.status === "SUSPENDED"
                            ? "destructive"
                            : "outline"
                        }
                      >
                        {admin.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {admin.adminRoles && admin.adminRoles.length > 0 ? (
                          admin.adminRoles.map((ar) => (
                            <Badge key={ar.roleId} variant="secondary" className="text-xs">
                              {ar.role?.name || ar.role?.code}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground">No roles assigned</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {admin.lastLoginAt
                        ? new Date(admin.lastLoginAt).toLocaleString()
                        : "Never"}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          }
                        />
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Admin Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedAdmin(admin);
                              setEditForm({
                                displayName: admin.user?.displayName || "",
                                department: admin.department || "",
                                notes: admin.notes || "",
                                status: admin.status,
                              });
                              setIsEditOpen(true);
                            }}
                          >
                            Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedAdmin(admin);
                              setAssignedRoleCodes(
                                admin.adminRoles?.map((ar) => ar.role?.code) || [],
                              );
                              setIsRolesOpen(true);
                            }}
                          >
                            <Shield className="w-4 h-4 mr-2" /> Assign Roles
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedAdmin(admin);
                              setIsResetPassOpen(true);
                            }}
                          >
                            <Key className="w-4 h-4 mr-2" /> Reset Password
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleForceLogout(admin)}>
                            <LogOut className="w-4 h-4 mr-2" /> Force Logout
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {admin.status === "ACTIVE" ? (
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedAdmin(admin);
                                setIsSuspendOpen(true);
                              }}
                              className="text-amber-600"
                            >
                              <UserX className="w-4 h-4 mr-2" /> Suspend Admin
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => handleActivate(admin)}
                              className="text-green-600"
                            >
                              <UserCheck className="w-4 h-4 mr-2" /> Activate Admin
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleSoftDelete(admin)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" /> Soft Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination Footer */}
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalAdmins}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            itemName="staff members"
            disabled={loading}
          />
        </CardContent>
      </Card>

      {/* Create Admin Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Administrative Account</DialogTitle>
            <DialogDescription>
              Create a new user account with administrative privileges.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 py-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold">Email Address</label>
              <Input
                type="email"
                required
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold">Username</label>
              <Input
                required
                value={createForm.username}
                onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold">Initial Password</label>
              <Input
                type="password"
                required
                minLength={8}
                value={createForm.password}
                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold">Display Name</label>
              <Input
                value={createForm.displayName}
                onChange={(e) => setCreateForm({ ...createForm, displayName: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold">Department</label>
              <Input
                value={createForm.department}
                onChange={(e) => setCreateForm({ ...createForm, department: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isSuperAdmin"
                checked={createForm.isSuperAdmin}
                onChange={(e) => setCreateForm({ ...createForm, isSuperAdmin: e.target.checked })}
              />
              <label htmlFor="isSuperAdmin" className="text-sm font-medium cursor-pointer">
                Grant Super Administrator Privileges
              </label>
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Account</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Admin Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Admin Profile</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 py-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold">Display Name</label>
              <Input
                value={editForm.displayName}
                onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold">Department</label>
              <Input
                value={editForm.department}
                onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold">Notes</label>
              <Input
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
              />
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Assign Roles Dialog */}
      <Dialog open={isRolesOpen} onOpenChange={setIsRolesOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Administrative Roles</DialogTitle>
            <DialogDescription>
              Select roles to assign to {selectedAdmin?.user?.email}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            {(Array.isArray(roles) ? roles : []).map((role) => {
              const isChecked = assignedRoleCodes.includes(role.code);
              return (
                <div
                  key={role.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 cursor-pointer"
                  onClick={() => {
                    if (isChecked) {
                      setAssignedRoleCodes(assignedRoleCodes.filter((c) => c !== role.code));
                    } else {
                      setAssignedRoleCodes([...assignedRoleCodes, role.code]);
                    }
                  }}
                >
                  <div>
                    <div className="font-semibold text-sm flex items-center gap-2">
                      {role.name}
                      {role.isSystem && <Badge variant="outline" className="text-[10px]">System</Badge>}
                    </div>
                    <div className="text-xs text-muted-foreground">{role.description}</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}} // handled by parent div
                  />
                </div>
              );
            })}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRolesOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignRoles}>Save Role Assignment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend Admin Dialog */}
      <Dialog open={isSuspendOpen} onOpenChange={setIsSuspendOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Suspend Admin Account</DialogTitle>
            <DialogDescription>
              Specify the reason for suspending {selectedAdmin?.user?.email}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Input
              placeholder="Reason for suspension..."
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSuspendOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleSuspend}>
              Confirm Suspension
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={isResetPassOpen} onOpenChange={setIsResetPassOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Set a new password for {selectedAdmin?.user?.email}. Active sessions will be revoked.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Input
              type="password"
              placeholder="New password (min 8 chars)..."
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResetPassOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleResetPassword}>Reset Password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Custom Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmAction.isOpen}
        onClose={() => setConfirmAction((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmAction.onConfirm}
        title={confirmAction.title}
        description={confirmAction.description}
        confirmText={confirmAction.confirmText}
        cancelText="Cancel"
        variant={confirmAction.variant}
        isLoading={confirmAction.isLoading}
      />
    </div>
  );
}
