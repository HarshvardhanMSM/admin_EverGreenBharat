"use client";

import { useEffect, useState } from "react";
import { auditService } from "@/services/api/audit-service";
import { SessionItem } from "@/types/audit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, LogOut, ShieldAlert, Laptop, Clock } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Pagination } from "@/components/common";
import { extractPagination } from "@/utils/pagination";

export default function SessionsManagementPage() {
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Pagination states
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSessions, setTotalSessions] = useState(0);

  // Confirmation Modal state
  const [sessionToRevoke, setSessionToRevoke] = useState<SessionItem | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);

  // Reset to page 1 on search change
  useEffect(() => {
    setPage(1);
  }, [search]);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const res = await auditService.fetchSessions({
        search: search || undefined,
        page,
        limit: pageSize,
      });
      const rawSessions = (res as any)?.data?.data ?? (res as any)?.data ?? res;
      setSessions(Array.isArray(rawSessions) ? rawSessions : []);

      const p = extractPagination(res, pageSize);
      setTotalPages(p.totalPages);
      setTotalSessions(p.total);
    } catch (err) {
      console.error("Failed to load sessions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadSessions();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, page, pageSize]);

  const handleRevokeSession = (session: SessionItem) => {
    setSessionToRevoke(session);
  };

  const confirmRevokeSession = async () => {
    if (!sessionToRevoke) return;
    setIsRevoking(true);
    try {
      await auditService.revokeSession(sessionToRevoke.id);
      toast.success("Session revoked successfully!");
      setSessionToRevoke(null);
      loadSessions();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to revoke session");
    } finally {
      setIsRevoking(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Active Sessions</h1>
          <p className="text-muted-foreground">
            Monitor and manage active refresh token sessions across all users and administrators.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search email, username, or IP address..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={loadSessions}>
              Refresh List
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User / Admin</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Device Info</TableHead>
                <TableHead>Issued At</TableHead>
                <TableHead>Expires At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Loading active sessions...
                  </TableCell>
                </TableRow>
              ) : sessions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No active sessions found.
                  </TableCell>
                </TableRow>
              ) : (
                sessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell>
                      <div className="font-semibold text-sm">
                        {session.user?.displayName || session.user?.username || session.userId}
                      </div>
                      <div className="text-xs text-muted-foreground">{session.user?.email}</div>
                    </TableCell>
                    <TableCell className="text-xs font-mono">{session.ipAddress || "—"}</TableCell>
                    <TableCell className="text-xs max-w-xs truncate" title={session.deviceInfo || ""}>
                      <span className="flex items-center gap-1">
                        <Laptop className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        {session.deviceInfo || "Standard Client"}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(session.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(session.expiresAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 border-rose-200 dark:border-rose-900/40 cursor-pointer"
                        onClick={() => handleRevokeSession(session)}
                      >
                        <LogOut className="w-3.5 h-3.5 mr-1" /> Revoke
                      </Button>
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
            totalItems={totalSessions}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            itemName="sessions"
            disabled={loading}
          />
        </CardContent>
      </Card>

      {/* Revoke Session Custom Confirmation Modal */}
      <ConfirmModal
        isOpen={!!sessionToRevoke}
        onClose={() => setSessionToRevoke(null)}
        onConfirm={confirmRevokeSession}
        title="Revoke User Session"
        description={`Are you sure you want to revoke the active session for '${sessionToRevoke?.user?.email || "this user"}' from IP ${sessionToRevoke?.ipAddress || "unknown"}? They will be logged out immediately.`}
        confirmText="Yes, Revoke Session"
        cancelText="Cancel"
        variant="warning"
        isLoading={isRevoking}
      />
    </div>
  );
}
