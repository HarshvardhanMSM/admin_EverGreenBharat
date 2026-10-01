"use client";

import { useEffect, useState } from "react";
import { rbacService } from "@/services/api/rbac-service";
import { RoleItem, PermissionItem } from "@/types/rbac";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Shield, Plus, Copy, Edit, Trash2, Lock, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { ConfirmModal } from "@/components/ui/confirm-modal";

export default function RolesManagementPage() {
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [permissionsGrouped, setPermissionsGrouped] = useState<Record<string, PermissionItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCloneOpen, setIsCloneOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<RoleItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [selectedRole, setSelectedRole] = useState<RoleItem | null>(null);

  // Form states
  const [roleForm, setRoleForm] = useState({
    code: "",
    name: "",
    description: "",
    permissionKeys: [] as string[],
  });

  const [cloneForm, setCloneForm] = useState({
    code: "",
    name: "",
    description: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [rolesRes, permsRes] = await Promise.all([
        rbacService.fetchRoles(),
        rbacService.fetchPermissions(),
      ]);
      const rawRoles = (rolesRes as any)?.data?.data ?? (rolesRes as any)?.data ?? rolesRes;
      const rolesList = Array.isArray(rawRoles) ? rawRoles : [];
      setRoles(rolesList);
      setPermissionsGrouped(permsRes?.grouped || permsRes?.data?.grouped || permsRes || {});
    } catch (err) {
      console.error("Failed to load RBAC data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await rbacService.createRole(roleForm);
      toast.success(`Role '${roleForm.name}' created successfully!`);
      setIsCreateOpen(false);
      resetRoleForm();
      await loadData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to create role");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    setIsSaving(true);
    try {
      await rbacService.editRole(selectedRole.id, {
        name: roleForm.name,
        description: roleForm.description,
        permissionKeys: roleForm.permissionKeys,
      });
      toast.success(`Role '${roleForm.name}' updated successfully!`);
      setIsEditOpen(false);
      resetRoleForm();
      await loadData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to edit role");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloneRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    setIsSaving(true);
    try {
      await rbacService.cloneRole(selectedRole.id, cloneForm);
      toast.success(`Role cloned as '${cloneForm.name}'!`);
      setIsCloneOpen(false);
      setCloneForm({ code: "", name: "", description: "" });
      await loadData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to clone role");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRole = (role: RoleItem) => {
    if (role.code === "SUPER_ADMIN") {
      toast.error("Super Administrator root role cannot be deleted.");
      return;
    }
    setRoleToDelete(role);
  };

  const confirmDeleteRole = async () => {
    if (!roleToDelete) return;
    setIsDeleting(true);
    try {
      await rbacService.deleteRole(roleToDelete.id);
      toast.success(`Role '${roleToDelete.name}' deleted successfully!`);
      setRoleToDelete(null);
      await loadData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to delete role");
    } finally {
      setIsDeleting(false);
    }
  };

  const resetRoleForm = () => {
    setRoleForm({ code: "", name: "", description: "", permissionKeys: [] });
    setSelectedRole(null);
  };

  const togglePermissionKey = (key: string) => {
    setRoleForm((prev) => {
      const exists = prev.permissionKeys.includes(key);
      return {
        ...prev,
        permissionKeys: exists
          ? prev.permissionKeys.filter((k) => k !== key)
          : [...prev.permissionKeys, key],
      };
    });
  };

  const toggleAllModulePermissions = (moduleName: string) => {
    const modulePermKeys = permissionsGrouped[moduleName]?.map((p) => p.key) || [];
    const allSelected = modulePermKeys.every((k) => roleForm.permissionKeys.includes(k));

    setRoleForm((prev) => ({
      ...prev,
      permissionKeys: allSelected
        ? prev.permissionKeys.filter((k) => !modulePermKeys.includes(k))
        : Array.from(new Set([...prev.permissionKeys, ...modulePermKeys])),
    }));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Role Management</h1>
          <p className="text-muted-foreground">
            Configure system and custom administrative roles and permission assignments.
          </p>
        </div>
        <Button
          onClick={() => {
            resetRoleForm();
            setIsCreateOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" /> Create Custom Role
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            Loading roles and permissions...
          </div>
        ) : roles.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No roles found.
          </div>
        ) : (
          (Array.isArray(roles) ? roles : []).map((role) => {
            const permCount = role.rolePermissions?.length || 0;
            const adminCount = role.adminRoles?.length || 0;

            return (
              <Card key={role.id} className="relative flex flex-col justify-between">
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Shield className="w-5 h-5 text-primary" />
                      {role.name}
                    </CardTitle>
                    {role.isSystem ? (
                      <Badge variant="default" className="bg-amber-600 hover:bg-amber-700">
                        <Lock className="w-3 h-3 mr-1" /> System Role
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Custom Role</Badge>
                    )}
                  </div>
                  <CardDescription className="text-xs">
                    Code: <span className="font-mono text-foreground">{role.code}</span>
                  </CardDescription>
                  <p className="text-sm text-muted-foreground pt-1 min-h-[40px]">
                    {role.description || "No description provided."}
                  </p>
                </CardHeader>

                <CardContent className="space-y-4 pt-0">
                  <div className="grid grid-cols-2 gap-2 text-center text-xs bg-muted/50 p-2 rounded-lg">
                    <div>
                      <div className="font-bold text-base">{permCount}</div>
                      <div className="text-muted-foreground">Permissions</div>
                    </div>
                    <div>
                      <div className="font-bold text-base">{adminCount}</div>
                      <div className="text-muted-foreground">Admins</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-1.5 pt-3 border-t border-border/80">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs font-semibold cursor-pointer"
                      onClick={() => {
                        setSelectedRole(role);
                        setCloneForm({
                          code: `${role.code}_COPY`,
                          name: `${role.name} (Copy)`,
                          description: `Cloned from ${role.name}`,
                        });
                        setIsCloneOpen(true);
                      }}
                    >
                      <Copy className="w-3.5 h-3.5 mr-1" /> Clone
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 cursor-pointer"
                      onClick={() => {
                        setSelectedRole(role);
                        setRoleForm({
                          code: role.code,
                          name: role.name,
                          description: role.description || "",
                          permissionKeys:
                            role.rolePermissions?.map((rp) => rp.permission?.key).filter(Boolean) || [],
                        });
                        setIsEditOpen(true);
                      }}
                    >
                      <Edit className="w-3.5 h-3.5 mr-1 text-emerald-600 dark:text-emerald-400" /> Edit
                    </Button>

                    {role.code !== "SUPER_ADMIN" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 border-rose-200 dark:border-rose-900/40 cursor-pointer"
                        onClick={() => handleDeleteRole(role)}
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                      </Button>
                    ) : (
                      <span className="text-[11px] text-muted-foreground font-semibold px-2 py-1 bg-muted rounded border border-border/60">
                        Root Role
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Create / Edit Role Dialog */}
      <Dialog
        open={isCreateOpen || isEditOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateOpen(false);
            setIsEditOpen(false);
            resetRoleForm();
          }
        }}
      >
        <DialogContent className="sm:max-w-4xl max-w-[96vw] max-h-[90vh] overflow-y-auto p-5 sm:p-7">
          <DialogHeader className="border-b border-border/80 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold tracking-tight">
                  {isCreateOpen ? "Create Custom Administrative Role" : `Edit Role: ${selectedRole?.name}`}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Define role code, display name, and check allowable system module permissions.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={isCreateOpen ? handleCreateRole : handleEditRole} className="space-y-6 py-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-xl border border-border/70">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Role Code (Unique Uppercase Identifier) *</label>
                <Input
                  disabled={isEditOpen}
                  placeholder="E.G. COMPLIANCE_OFFICER"
                  value={roleForm.code}
                  onChange={(e) => setRoleForm({ ...roleForm, code: e.target.value })}
                  required
                  className="font-mono text-xs uppercase"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Role Display Name *</label>
                <Input
                  placeholder="Compliance Officer"
                  value={roleForm.name}
                  onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="col-span-full space-y-1.5">
                <label className="text-xs font-bold text-foreground">Description / Purpose</label>
                <Input
                  placeholder="Description of role responsibilities, duties, and access scope..."
                  value={roleForm.description}
                  onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                />
              </div>
            </div>

            {/* Module-grouped Permission Matrix */}
            <div className="space-y-4 pt-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-foreground">Module Permissions Matrix</h3>
                  <span className="text-xs bg-primary/10 text-primary font-bold px-2.5 py-0.5 rounded-full border border-primary/20">
                    {roleForm.permissionKeys.length} selected
                  </span>
                </div>
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  Click on permission cards to toggle access
                </span>
              </div>

              <div className="space-y-4">
                {Object.entries(permissionsGrouped).map(([moduleName, perms]) => {
                  const moduleKeys = perms.map((p) => p.key);
                  const allSelected = moduleKeys.every((k) => roleForm.permissionKeys.includes(k));

                  return (
                    <div key={moduleName} className="border border-border/80 rounded-xl p-4 space-y-3 bg-card shadow-2xs">
                      <div className="flex items-center justify-between border-b border-border/70 pb-2.5">
                        <span className="font-bold text-xs uppercase tracking-wider text-primary flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-primary" />
                          {moduleName} Module ({perms.length} perms)
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs font-semibold px-2.5"
                          onClick={() => toggleAllModulePermissions(moduleName)}
                        >
                          {allSelected ? "Deselect All" : "Select All"}
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                        {perms.map((p) => {
                          const checked = roleForm.permissionKeys.includes(p.key);
                          return (
                            <div
                              key={p.id}
                              className={`flex items-start gap-2.5 p-2.5 rounded-lg border transition-all cursor-pointer select-none ${
                                checked
                                  ? "bg-primary/10 border-primary/60 shadow-2xs"
                                  : "bg-background/60 border-border/80 hover:bg-muted/70"
                              }`}
                              onClick={() => togglePermissionKey(p.key)}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  togglePermissionKey(p.key);
                                }}
                                className="mt-1 cursor-pointer accent-primary shrink-0"
                              />
                              <div className="min-w-0">
                                <div className="font-mono text-xs font-bold text-foreground truncate">{p.key}</div>
                                <div className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2 leading-tight">
                                  {p.description}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <DialogFooter className="border-t border-border/80 pt-4">
              <Button type="button" variant="outline" onClick={() => { setIsCreateOpen(false); setIsEditOpen(false); }}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
                  </>
                ) : isCreateOpen ? (
                  "Create Role"
                ) : (
                  "Save Permission Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Clone Role Dialog */}
      <Dialog open={isCloneOpen} onOpenChange={setIsCloneOpen}>
        <DialogContent className="sm:max-w-lg max-w-[95vw]">
          <DialogHeader>
            <DialogTitle>Clone Role: {selectedRole?.name}</DialogTitle>
            <DialogDescription>
              Duplicate this role and copy all assigned permissions into a new role.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCloneRole} className="space-y-4 py-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold">New Role Code</label>
              <Input
                required
                value={cloneForm.code}
                onChange={(e) => setCloneForm({ ...cloneForm, code: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold">New Role Name</label>
              <Input
                required
                value={cloneForm.name}
                onChange={(e) => setCloneForm({ ...cloneForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold">Description</label>
              <Input
                value={cloneForm.description}
                onChange={(e) => setCloneForm({ ...cloneForm, description: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCloneOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Cloning...
                  </>
                ) : (
                  "Clone Role"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* Delete Role Confirmation Custom Modal */}
      <ConfirmModal
        isOpen={!!roleToDelete}
        onClose={() => setRoleToDelete(null)}
        onConfirm={confirmDeleteRole}
        title={`Delete Role: ${roleToDelete?.name}`}
        description={`Are you sure you want to permanently delete the role '${roleToDelete?.name}' (${roleToDelete?.code})? All assigned module permissions will be revoked. This action cannot be undone.`}
        confirmText="Yes, Delete Role"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
