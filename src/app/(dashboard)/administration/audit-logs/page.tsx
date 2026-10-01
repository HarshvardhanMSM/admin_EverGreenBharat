"use client";

import { useEffect, useState } from "react";
import { auditService } from "@/services/api/audit-service";
import { AuditLogItem } from "@/types/audit";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, Download, Eye, FileText, ArrowRight } from "lucide-react";
import { FilterDropdown, Pagination } from "@/components/common";
import { extractPagination } from "@/utils/pagination";
import { toast } from "@/components/ui/toast";
import { HTTP_METHOD_OPTIONS } from "@/constants/filter-options";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [httpMethodFilter, setHttpMethodFilter] = useState("");
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  // Pagination states
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);

  // Reset to page 1 on search or filter change
  useEffect(() => {
    setPage(1);
  }, [search, httpMethodFilter]);

  const loadAuditLogs = async () => {
    setLoading(true);
    try {
      const res = await auditService.fetchAuditLogs({
        search: search || undefined,
        httpMethod: httpMethodFilter || undefined,
        page,
        limit: pageSize,
      });
      const rawLogs = (res as any)?.data?.data ?? (res as any)?.data ?? res;
      setLogs(Array.isArray(rawLogs) ? rawLogs : []);

      const p = extractPagination(res, pageSize);
      setTotalPages(p.totalPages);
      setTotalLogs(p.total);
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadAuditLogs();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, httpMethodFilter, page, pageSize]);

  const handleExportCsv = async () => {
    try {
      const blob = await auditService.exportAuditLogs({
        search: search || undefined,
        httpMethod: httpMethodFilter || undefined,
      });
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `audit_logs_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Audit logs exported successfully!");
    } catch (err) {
      toast.error("Failed to export audit logs");
    }
  };

  const handleViewDetail = async (id: string) => {
    try {
      const res = await auditService.fetchAuditLogById(id);
      setSelectedLog(res.data);
    } catch (err) {
      toast.error("Failed to load audit log details");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
          <p className="text-muted-foreground">
            Centralized immutable record of all mutating administrative operations.
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
                placeholder="Search action, resource, IP, or correlation ID..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <FilterDropdown
                value={httpMethodFilter}
                options={HTTP_METHOD_OPTIONS}
                onValueChange={(val) => setHttpMethodFilter(val)}
                label="HTTP Method"
                width="w-[180px]"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Method & Resource</TableHead>
                <TableHead>Action Code</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Correlation ID</TableHead>
                <TableHead className="text-right">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Loading audit trail records...
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No audit records found.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-xs font-mono text-muted-foreground">
                      {new Date(log.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            log.httpMethod === "POST"
                              ? "default"
                              : log.httpMethod === "DELETE"
                              ? "destructive"
                              : "secondary"
                          }
                          className="font-mono text-[10px]"
                        >
                          {log.httpMethod}
                        </Badge>
                        <span className="font-semibold text-sm capitalize">{log.resource}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs font-semibold">{log.action}</TableCell>
                    <TableCell className="text-xs font-mono">{log.ipAddress}</TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">
                      {log.correlationId || "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleViewDetail(log.id)}>
                        <Eye className="w-4 h-4 mr-1" /> View Diff
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
            totalItems={totalLogs}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            itemName="audit logs"
            disabled={loading}
          />
        </CardContent>
      </Card>

      {/* Audit Detail & Diff Modal */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-mono text-base">
              <FileText className="w-5 h-5 text-primary" />
              Audit Log Detail: {selectedLog?.action}
            </DialogTitle>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-3 bg-muted/40 rounded-lg">
                <div>
                  <span className="text-muted-foreground">Resource:</span> {selectedLog.resource}
                </div>
                <div>
                  <span className="text-muted-foreground">Resource ID:</span> {selectedLog.resourceId || "N/A"}
                </div>
                <div>
                  <span className="text-muted-foreground">HTTP Method:</span> {selectedLog.httpMethod}
                </div>
                <div>
                  <span className="text-muted-foreground">IP Address:</span> {selectedLog.ipAddress}
                </div>
                <div>
                  <span className="text-muted-foreground">Correlation ID:</span> {selectedLog.correlationId || "N/A"}
                </div>
                <div>
                  <span className="text-muted-foreground">Request ID:</span> {selectedLog.requestId || "N/A"}
                </div>
              </div>

              {/* Visual Before/After Diff */}
              <div className="space-y-2">
                <h4 className="font-sans font-semibold text-sm">Structured Before / After Diff</h4>
                {selectedLog.diff && Object.keys(selectedLog.diff).length > 0 ? (
                  <div className="border rounded-lg divide-y bg-card">
                    {Object.entries(selectedLog.diff).map(([key, val]) => (
                      <div
                        key={key}
                        className={`p-2 grid grid-cols-1 md:grid-cols-3 gap-2 ${
                          val.modified ? "bg-amber-500/10" : ""
                        }`}
                      >
                        <div className="font-semibold text-primary">{key}</div>
                        <div className="text-destructive break-all">
                          Before: {JSON.stringify(val.before)}
                        </div>
                        <div className="text-green-600 dark:text-green-400 break-all">
                          After: {JSON.stringify(val.after)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 border rounded-lg bg-muted/20">
                      <div className="font-bold text-xs mb-1">Before Value Payload</div>
                      <pre className="text-[11px] overflow-x-auto whitespace-pre-wrap">
                        {JSON.stringify(selectedLog.beforeValue, null, 2) || "null"}
                      </pre>
                    </div>
                    <div className="p-3 border rounded-lg bg-muted/20">
                      <div className="font-bold text-xs mb-1">After Value Payload</div>
                      <pre className="text-[11px] overflow-x-auto whitespace-pre-wrap">
                        {JSON.stringify(selectedLog.afterValue, null, 2) || "null"}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
