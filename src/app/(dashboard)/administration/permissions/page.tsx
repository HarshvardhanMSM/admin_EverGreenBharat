"use client";

import { useEffect, useState } from "react";
import { rbacService } from "@/services/api/rbac-service";
import { PermissionStats } from "@/types/rbac";
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
import { Key, Search, Lock, Info, RefreshCw } from "lucide-react";

export default function PermissionsManagementPage() {
  const [stats, setStats] = useState<PermissionStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("ALL");

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const res = await rbacService.fetchPermissionStats();
      const rawStats = (res as any)?.data?.data ?? (res as any)?.data ?? res;
      setStats(Array.isArray(rawStats) ? rawStats : []);
    } catch (err) {
      console.error("Failed to load permission stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const modules = Array.from(new Set(stats.map((s) => s.module)));

  const filteredStats = stats.filter((item) => {
    const matchesModule = moduleFilter === "ALL" || item.module === moduleFilter;
    const matchesSearch =
      !search ||
      item.key.toLowerCase().includes(search.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(search.toLowerCase()));
    return matchesModule && matchesSearch;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Permissions Catalog</h1>
          <p className="text-muted-foreground">
            Explore administrative permissions, module groupings, and live usage statistics.
          </p>
        </div>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 p-4 rounded-lg flex items-start gap-3 text-sm">
        <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">Developer-Controlled Governance:</span> System permissions are defined strictly in backend code enums and database seeders. Permission creation and deletion via UI is intentionally disabled for security integrity.
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search permission keys or descriptions..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <Badge
                variant={moduleFilter === "ALL" ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setModuleFilter("ALL")}
              >
                All Modules
              </Badge>
              {modules.map((mod) => (
                <Badge
                  key={mod}
                  variant={moduleFilter === mod ? "default" : "outline"}
                  className="cursor-pointer capitalize"
                  onClick={() => setModuleFilter(mod)}
                >
                  {mod}
                </Badge>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Permission Key</TableHead>
                <TableHead>Module</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-center">Assigned Roles</TableHead>
                <TableHead className="text-center">Active Admins</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Loading permissions catalog...
                  </TableCell>
                </TableRow>
              ) : filteredStats.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No permissions found matching filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredStats.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-xs font-semibold text-primary">
                      {item.key}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize text-xs">
                        {item.module}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {item.description || "—"}
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      <Badge variant="outline">{item.roleCount} role(s)</Badge>
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      <Badge variant="outline">{item.adminCount} admin(s)</Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
