"use client";

import { useEffect, useState } from "react";
import { homeContentService, HomeSectionItem } from "@/services/api/home-content-service";
import { ArrowUp, ArrowDown, Eye, EyeOff, LayoutGrid } from "lucide-react";
import { toast } from "@/components/ui/toast";

export default function HomeSectionsPage() {
  const [sections, setSections] = useState<HomeSectionItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSections = async () => {
    try {
      setLoading(true);
      const res = await homeContentService.fetchHomeSections();
      setSections(res.data || []);
    } catch (err: any) {
      toast.add({ type: "error", description: "Failed to fetch home sections configuration" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const handleToggleEnable = async (section: HomeSectionItem) => {
    try {
      await homeContentService.updateHomeSection(section.sectionKey, {
        isEnabled: !section.isEnabled,
      });
      toast.add({
        type: "success",
        description: `Section "${section.title}" ${!section.isEnabled ? "enabled" : "disabled"}.`,
      });
      fetchSections();
    } catch (err: any) {
      toast.add({ type: "error", description: "Failed to update section visibility" });
    }
  };

  const handleMove = async (index: number, direction: "up" | "down") => {
    if ((direction === "up" && index === 0) || (direction === "down" && index === sections.length - 1)) {
      return;
    }
    const newSections = [...sections];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const temp = newSections[index];
    newSections[index] = newSections[targetIndex];
    newSections[targetIndex] = temp;

    const items = newSections.map((sec, idx) => ({
      sectionKey: sec.sectionKey,
      sortOrder: idx + 1,
    }));

    try {
      const res = await homeContentService.reorderHomeSections(items);
      setSections(res.data || []);
      toast.add({ type: "success", description: "Home sections reordered." });
    } catch (err: any) {
      toast.add({ type: "error", description: "Failed to reorder sections" });
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Home Feed Section Layout</h1>
        <p className="text-sm text-muted-foreground">
          Enable, disable, and reorder sections displayed on the mobile app Home screen feed.
        </p>
      </div>

      {/* Sections Table / Cards */}
      <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-muted-foreground">Loading sections layout...</div>
        ) : sections.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">No sections configured.</div>
        ) : (
          <div className="divide-y divide-border">
            {sections.map((sec, index) => (
              <div
                key={sec.id}
                className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold text-xs text-muted-foreground">
                    #{index + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      <LayoutGrid className="w-4 h-4 text-muted-foreground" />
                      {sec.title}
                    </h3>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">
                      Key: {sec.sectionKey}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggleEnable(sec)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border transition-colors ${
                      sec.isEnabled
                        ? "bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20"
                        : "bg-gray-500/10 text-gray-500 border-gray-500/20 hover:bg-gray-500/20"
                    }`}
                  >
                    {sec.isEnabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    {sec.isEnabled ? "Enabled" : "Disabled"}
                  </button>

                  <div className="flex items-center gap-1 border border-border rounded-md bg-background p-1">
                    <button
                      disabled={index === 0}
                      onClick={() => handleMove(index, "up")}
                      className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30 rounded hover:bg-muted"
                      title="Move Up"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      disabled={index === sections.length - 1}
                      onClick={() => handleMove(index, "down")}
                      className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30 rounded hover:bg-muted"
                      title="Move Down"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
