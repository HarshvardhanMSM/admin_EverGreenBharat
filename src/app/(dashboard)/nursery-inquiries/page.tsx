"use client";

import { useState, useEffect } from "react";
import { nurseryService } from "@/services/api/nursery-service";
import { toast } from "@/components/ui/toast";
import {
  Briefcase,
  Building,
  Mail,
  Phone,
  MessageSquare,
  Plus,
  Send,
  X,
  Check,
} from "lucide-react";

const KANBAN_STAGES = [
  { key: "NEW", label: "New Inquiries", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" },
  { key: "IN_REVIEW", label: "In Review", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" },
  { key: "CONTACTED", label: "Contacted", color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20" },
  { key: "IN_DISCUSSION", label: "In Discussion", color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20" },
  { key: "CONVERTED", label: "Converted / Closed", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
];

export default function NurseryInquiriesPage() {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<any | null>(null);
  const [newNote, setNewNote] = useState("");

  const loadInquiries = async () => {
    try {
      setLoading(true);
      const res = await nurseryService.fetchInquiries({ limit: 100 });
      const list = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.data)
        ? res.data.data
        : Array.isArray(res?.data?.items)
        ? res.data.items
        : Array.isArray(res)
        ? res
        : [];
      setInquiries(list);
    } catch (err) {
      console.error("Failed to load inquiries", err);
      setInquiries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInquiries();
  }, []);

  const handleStageChange = async (inquiryId: string, newStatus: string) => {
    try {
      await nurseryService.updateInquiryStatus(inquiryId, {
        status: newStatus,
        note: `Transitioned status to ${newStatus}`,
      });
      toast.success(`Inquiry moved to ${newStatus}`);
      loadInquiries();
      if (selectedInquiry && selectedInquiry.id === inquiryId) {
        setSelectedInquiry((prev: any) => ({ ...prev, status: newStatus }));
      }
    } catch (err: any) {
      toast.error("Failed to update status");
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInquiry || !newNote.trim()) return;

    try {
      const added = await nurseryService.addInquiryNote(selectedInquiry.id, newNote.trim());
      setSelectedInquiry((prev: any) => ({
        ...prev,
        notes: [...(prev.notes || []), added],
      }));
      setNewNote("");
      toast.success("Follow-up note added successfully!");
      loadInquiries();
    } catch (err: any) {
      toast.error("Failed to add note");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Institutional B2B Inquiries
            </h1>
            <span className="bg-primary/10 text-primary text-xs font-semibold px-2.5 py-0.5 rounded-full">
              Sales Pipeline
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Track corporate landscaping, hospital green decor, and institutional consultation requests.
          </p>
        </div>
      </div>

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {KANBAN_STAGES.map((stage) => {
          const safeList = Array.isArray(inquiries) ? inquiries : [];
          const stageInquiries = safeList.filter((i) =>
            stage.key === "CONVERTED"
              ? i.status === "CONVERTED" || i.status === "CLOSED"
              : i.status === stage.key,
          );

          return (
            <div
              key={stage.key}
              className="bg-muted/30 border border-border/70 rounded-xl p-3 flex flex-col min-h-[500px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 border-b border-border/60 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                  {stage.label}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-background border border-border text-foreground">
                  {stageInquiries.length}
                </span>
              </div>

              {/* Cards List */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {stageInquiries.map((inquiry) => (
                  <div
                    key={inquiry.id}
                    onClick={() => setSelectedInquiry(inquiry)}
                    className="bg-card border border-border/80 hover:border-primary/50 p-3.5 rounded-lg shadow-2xs cursor-pointer transition-all hover:shadow-xs space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-1">
                      <div className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-primary shrink-0" />
                        {inquiry.companyName}
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {inquiry.purpose}
                    </p>

                    <div className="text-[11px] text-muted-foreground flex items-center justify-between pt-1 border-t border-border/40">
                      <span>{inquiry.name}</span>
                      <span>{(inquiry.notes || []).length} notes</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Inquiry Detail Drawer with Notes Thread */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-end">
          <div className="bg-card border-l border-border h-full max-w-lg w-full p-6 space-y-5 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between border-b border-border pb-3 shrink-0">
              <div>
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Building className="w-5 h-5 text-primary" />
                  {selectedInquiry.companyName}
                </h3>
                <span className="text-xs text-muted-foreground">Institutional Consultation</span>
              </div>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stage Selector */}
            <div className="space-y-1.5 shrink-0">
              <label className="text-xs font-semibold text-muted-foreground uppercase">
                Pipeline Stage
              </label>
              <select
                value={selectedInquiry.status}
                onChange={(e) => handleStageChange(selectedInquiry.id, e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background font-medium"
              >
                <option value="NEW">New Inquiry</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="CONTACTED">Contacted</option>
                <option value="IN_DISCUSSION">In Discussion</option>
                <option value="CONVERTED">Converted</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>

            {/* Contact Details */}
            <div className="bg-muted/30 p-3.5 rounded-lg text-xs space-y-2 border border-border/60 shrink-0">
              <div className="flex items-center gap-2 text-foreground font-medium">
                <Briefcase className="w-4 h-4 text-muted-foreground" />
                Contact Person: {selectedInquiry.name}
              </div>
              <div className="flex items-center gap-2 text-foreground">
                <Mail className="w-4 h-4 text-muted-foreground" />
                {selectedInquiry.email}
              </div>
              <div className="flex items-center gap-2 text-foreground">
                <Phone className="w-4 h-4 text-muted-foreground" />
                {selectedInquiry.contactNumber}
              </div>
            </div>

            {/* Purpose Statement */}
            <div className="space-y-1 shrink-0">
              <span className="text-xs font-semibold text-muted-foreground uppercase">
                Requirement Details
              </span>
              <p className="text-xs text-foreground bg-muted/20 p-3 rounded-lg border border-border/40 leading-relaxed">
                {selectedInquiry.purpose}
              </p>
            </div>

            {/* Follow-up Notes Thread */}
            <div className="flex-1 flex flex-col min-h-0 space-y-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase">
                Follow-up Notes ({(selectedInquiry.notes || []).length})
              </span>

              <div className="flex-1 overflow-y-auto space-y-2 border border-border/60 rounded-lg p-3 bg-muted/10">
                {(selectedInquiry.notes || []).length === 0 ? (
                  <div className="text-xs text-muted-foreground text-center py-6">
                    No follow-up notes recorded yet.
                  </div>
                ) : (
                  selectedInquiry.notes.map((n: any) => (
                    <div key={n.id} className="bg-card p-2.5 rounded border border-border text-xs space-y-1">
                      <div className="flex justify-between text-[11px] text-muted-foreground">
                        <span className="font-semibold text-foreground">{n.authorName}</span>
                        <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-foreground">{n.text}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Note Input */}
              <form onSubmit={handleAddNote} className="flex gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Add internal follow-up note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-lg border border-border bg-background"
                />
                <button
                  type="submit"
                  className="px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 text-xs font-medium flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  Post
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
