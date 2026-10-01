"use client";

import { useEffect, useState } from "react";
import { auditService } from "@/services/api/audit-service";
import { LoginHistoryItem } from "@/types/audit";
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
import { Search, Download, CheckCircle, AlertTriangle, Monitor, Smartphone, Globe } from "lucide-react";
import { FilterDropdown, Pagination } from "@/components/common";
import { extractPagination } from "@/utils/pagination";
import { LOGIN_STATUS_OPTIONS } from "@/constants/filter-options";
import { toast } from "@/components/ui/toast";

export default function LoginHistoryPage() {
  const [history, setHistory] = useState<LoginHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Pagination states
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalHistory, setTotalHistory] = useState(0);

  // Reset to page 1 on filter or search change
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const res = await auditService.fetchLoginHistory({
        search: search || undefined,
        status: statusFilter || undefined,
        page,
        limit: pageSize,
      });
      const rawHistory = (res as any)?.data?.data ?? (res as any)?.data ?? res;
      setHistory(Array.isArray(rawHistory) ? rawHistory : []);

      const p = extractPagination(res, pageSize);
      setTotalPages(p.totalPages);
      setTotalHistory(p.total);
    } catch (err) {
      console.error("Failed to load login history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadHistory();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter, page, pageSize]);

  const handleExportCsv = async () => {
    try {
      const blob = await auditService.exportLoginHistory({
        search: search || undefined,
        status: statusFilter || undefined,
      });
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `login_history_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Login history exported successfully!");
    } catch (err) {
      toast.error("Failed to export login history");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Login History</h1>
          <p className="text-muted-foreground">
            Audit log of all authentication attempts across users and administrators.
          </p>
        </div>
        <Button onClick={handleExportCsv} variant="outline">
          <Download className="w-4 h-4 mr-2" /> Export CSV Report
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search email, IP, browser, or device..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <FilterDropdown
                value={statusFilter}
                options={LOGIN_STATUS_OPTIONS}
                onValueChange={(val) => setStatusFilter(val)}
                label="Attempt Status"
                width="w-[160px]"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Email Account</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Browser / OS</TableHead>
                <TableHead>Device</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Loading authentication attempt records...
                  </TableCell>
                </TableRow>
              ) : history.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No login records found.
                  </TableCell>
                </TableRow>
              ) : (
                history.map((lh) => (
                  <TableRow key={lh.id}>
                    <TableCell className="text-xs font-mono text-muted-foreground">
                      {new Date(lh.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-medium text-sm">{lh.email}</TableCell>
                    <TableCell>
                      {lh.status === "SUCCESS" ? (
                        <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                          <CheckCircle className="w-3 h-3 mr-1" /> SUCCESS
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="flex items-center w-fit gap-1">
                          <AlertTriangle className="w-3 h-3" /> FAILED
                          {lh.failureReason && (
                            <span className="text-[10px] opacity-90">({lh.failureReason})</span>
                          )}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-xs font-mono">{lh.ipAddress}</TableCell>
                    <TableCell className="text-xs">
                      {lh.browser || "Unknown"} on {lh.os || "Unknown OS"}
                    </TableCell>
                    <TableCell className="text-xs flex items-center gap-1">
                      {lh.device === "Mobile" ? (
                        <Smartphone className="w-3.5 h-3.5 text-muted-foreground" />
                      ) : (
                        <Monitor className="w-3.5 h-3.5 text-muted-foreground" />
                      )}
                      {lh.device || "Desktop"}
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
            totalItems={totalHistory}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            itemName="login records"
            disabled={loading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
