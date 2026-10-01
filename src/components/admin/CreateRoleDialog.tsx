"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/toast";
import { Shield, X, Check, Loader2 } from "lucide-react";
import apiClient from "@/services/api/client";

interface CreateRoleDialogProps {
  permissions: any[];
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateRoleDialog({
  permissions,
  onClose,
  onSuccess,
}: CreateRoleDialogProps) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPermKeys, setSelectedPermKeys] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!code || code === name.toUpperCase().replace(/\s+/g, "_")) {
      setCode(val.toUpperCase().replace(/[^A-Z0-9]/g, "_"));
    }
  };

  const togglePermission = (key: string) => {
    setSelectedPermKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  // Group permissions by module
  const groupedPermissions: Record<string, any[]> = {};
  permissions.forEach((p) => {
    const mod = p.module || "other";
    if (!groupedPermissions[mod]) groupedPermissions[mod] = [];
    groupedPermissions[mod].push(p);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.add({ type: "warning", description: "Role name is required" });
      return;
    }

    if (!code.trim()) {
      toast.add({ type: "warning", description: "Role code is required" });
      return;
    }

    setSubmitting(true);
    try {
      await apiClient.post("/v1/admin/rbac/roles", {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        description: description.trim(),
        permissionKeys: selectedPermKeys,
      });

      toast.add({
        type: "success",
        description: `Custom role '${name}' created successfully.`,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      toast.add({
        type: "error",
        description: err?.response?.data?.message || "Failed to create custom role",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-card text-card-foreground border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Create Custom Role</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Define a custom administrative role and assign granular module permissions.
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                Role Name *
              </label>
              <Input
                placeholder="e.g. Senior Moderator"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                Role Code *
              </label>
              <Input
                placeholder="e.g. SENIOR_MOD"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="font-mono text-xs uppercase"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
              Description
            </label>
            <Input
              placeholder="Describe the duties and privileges of this role..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Granular Permissions Selection */}
          <div className="space-y-4 pt-2 border-t border-border">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">
                Assign Module Permissions ({selectedPermKeys.length} Selected)
              </h3>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                className="text-xs text-primary"
                onClick={() => {
                  if (selectedPermKeys.length === permissions.length) {
                    setSelectedPermKeys([]);
                  } else {
                    setSelectedPermKeys(permissions.map((p) => p.key));
                  }
                }}
              >
                {selectedPermKeys.length === permissions.length ? "Deselect All" : "Select All"}
              </Button>
            </div>

            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
              {Object.entries(groupedPermissions).map(([mod, perms]) => (
                <Card key={mod} className="p-4 bg-muted/20 border border-border/60">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-primary mb-3">
                    {mod} Module
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {perms.map((p) => {
                      const isSelected = selectedPermKeys.includes(p.key);
                      return (
                        <button
                          key={p.key}
                          type="button"
                          onClick={() => togglePermission(p.key)}
                          className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-left transition-all ${
                            isSelected
                              ? "border-primary bg-primary/10 text-foreground"
                              : "border-border/50 bg-background/50 hover:bg-accent text-muted-foreground"
                          }`}
                        >
                          <div
                            className={`w-4 h-4 mt-0.5 rounded border flex items-center justify-center shrink-0 ${
                              isSelected
                                ? "bg-primary border-primary text-white"
                                : "border-muted-foreground/40"
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <div>
                            <p className="font-mono text-xs font-semibold text-foreground leading-none">
                              {p.key}
                            </p>
                            <p className="text-[11px] text-muted-foreground mt-1 line-clamp-1">
                              {p.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button variant="outline" type="button" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="font-semibold gap-2">
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating Role...
                </>
              ) : (
                "Create Role"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
