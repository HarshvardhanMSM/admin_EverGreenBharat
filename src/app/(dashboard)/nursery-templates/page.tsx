"use client";

import { useState } from "react";
import { Mail, Edit3, Check, Code, Sparkles } from "lucide-react";

const DEFAULT_TEMPLATES = [
  {
    key: "order.confirmed",
    name: "Customer Order Confirmation",
    subject: "Order #{{orderNumber}} Confirmed — Nursery Marketplace",
    variables: ["orderNumber", "customerName", "totalAmount", "deliveryAddress"],
    sampleBody: "<p>Hi {{customerName}},</p><p>Thank you for your order! We're preparing your plants for dispatch.</p><p>Order: <strong>#{{orderNumber}}</strong><br>Total: ₹{{totalAmount}}</p>",
  },
  {
    key: "order.out_for_delivery",
    name: "Out for Delivery — Doorstep OTP",
    subject: "Your Plants are Out for Delivery! Doorstep OTP: {{deliveryOtp}}",
    variables: ["orderNumber", "deliveryOtp", "storeName", "driverPhone"],
    sampleBody: "<p>Your order #{{orderNumber}} from {{storeName}} is out for delivery!</p><p>Please share this single-use OTP with your delivery executive at your doorstep:</p><h2 style='color:#059669;letter-spacing:4px;'>{{deliveryOtp}}</h2>",
  },
  {
    key: "order.delivered",
    name: "Order Delivered Successfully",
    subject: "Order #{{orderNumber}} Delivered — Happy Gardening!",
    variables: ["orderNumber", "deliveredAt", "invoiceUrl"],
    sampleBody: "<p>Your plants have been safely delivered. We hope they thrive in their new home!</p>",
  },
  {
    key: "inquiry.auto_reply",
    name: "Institutional Inquiry Acknowledged",
    subject: "We received your Landscaping & Plant Consultation Request",
    variables: ["contactName", "companyName"],
    sampleBody: "<p>Dear {{contactName}},</p><p>Thanks for reaching out from {{companyName}}. Our institutional greenery consultants will contact you within 24 hours.</p>",
  },
  {
    key: "influencer.approved",
    name: "Green Army Influencer Approved",
    subject: "Welcome to the Green Army! Your Badge is Active",
    variables: ["userName", "badgeName"],
    sampleBody: "<p>Congratulations {{userName}}! Your Green Army application was reviewed and approved. Start posting reels and gardening tips today!</p>",
  },
];

export default function NurseryTemplatesPage() {
  const [templates, setTemplates] = useState(DEFAULT_TEMPLATES);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(DEFAULT_TEMPLATES[0]);
  const [currentSubject, setCurrentSubject] = useState(DEFAULT_TEMPLATES[0].subject);
  const [currentBody, setCurrentBody] = useState(DEFAULT_TEMPLATES[0].sampleBody);
  const [toast, setToast] = useState<string | null>(null);

  const handleSelect = (tmpl: any) => {
    setSelectedTemplate(tmpl);
    setCurrentSubject(tmpl.subject);
    setCurrentBody(tmpl.sampleBody);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setTemplates((prev) =>
      prev.map((t) =>
        t.key === selectedTemplate.key
          ? { ...t, subject: currentSubject, sampleBody: currentBody }
          : t,
      ),
    );
    setToast(`Template '${selectedTemplate.name}' updated successfully!`);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Dynamic Notification & Email Templates
            </h1>
            <span className="bg-primary/10 text-primary text-xs font-semibold px-2.5 py-0.5 rounded-full">
              CMS Engine
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Customize transactional customer emails, doorstep OTP delivery notices, and B2B inquiry responses.
          </p>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 px-4 py-3 rounded-lg flex items-center gap-2 text-sm font-medium">
          <Check className="w-4 h-4" />
          {toast}
        </div>
      )}

      {/* Grid: Templates List & Live Editor */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Templates Sidebar */}
        <div className="bg-card border border-border/80 rounded-xl p-3 space-y-2 h-fit">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-2">
            Template Catalog
          </span>
          {templates.map((t) => (
            <button
              key={t.key}
              onClick={() => handleSelect(t)}
              className={`w-full text-left p-3 rounded-lg text-xs font-medium transition-all ${
                selectedTemplate.key === t.key
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "hover:bg-muted text-foreground"
              }`}
            >
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 shrink-0" />
                <span className="truncate">{t.name}</span>
              </div>
              <div className="text-[10px] opacity-80 mt-1 truncate">{t.key}</div>
            </button>
          ))}
        </div>

        {/* Template Editor */}
        <div className="md:col-span-2 bg-card border border-border/80 rounded-xl p-6 space-y-4 shadow-2xs">
          <div className="border-b border-border pb-3">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-primary" />
              Editing: {selectedTemplate.name}
            </h3>
            <span className="text-xs text-muted-foreground">Key: {selectedTemplate.key}</span>
          </div>

          {/* Available Variables */}
          <div className="bg-muted/40 p-3 rounded-lg border border-border/60 space-y-1.5">
            <span className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1">
              <Code className="w-3.5 h-3.5" />
              Available Dynamic Variables
            </span>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {selectedTemplate.variables.map((v: string) => (
                <span
                  key={v}
                  className="bg-background text-foreground border border-border px-2 py-0.5 rounded text-xs font-mono"
                >
                  {"{{"}
                  {v}
                  {"}}"}
                </span>
              ))}
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Subject Line
              </label>
              <input
                type="text"
                value={currentSubject}
                onChange={(e) => setCurrentSubject(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                HTML Body Template
              </label>
              <textarea
                rows={8}
                value={currentBody}
                onChange={(e) => setCurrentBody(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-border bg-background leading-relaxed"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 text-sm font-semibold transition-colors shadow-2xs"
              >
                Save Template Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
