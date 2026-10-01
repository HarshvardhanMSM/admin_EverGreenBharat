"use client";

import * as React from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "default" | "success" | "info" | "warning" | "error";
export type ToastPriority = "high" | "normal";

export interface ToastOptions {
  id?: string;
  title?: string;
  description: React.ReactNode;
  type?: ToastType;
  priority?: ToastPriority;
  duration?: number;
}

export interface ToastItem extends ToastOptions {
  id: string;
  createdAt: number;
}

type ToastListener = (toasts: ToastItem[]) => void;

class ToastStore {
  private toasts: ToastItem[] = [];
  private listeners: Set<ToastListener> = new Set();

  subscribe(listener: ToastListener) {
    this.listeners.add(listener);
    listener(this.toasts);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener([...this.toasts]));
  }

  add(options: ToastOptions | string): string {
    if (typeof options === "string") {
      return this.add({ description: options, type: "default" });
    }

    const id = options.id || Math.random().toString(36).substring(2, 9);
    const duration = options.duration ?? (options.priority === "high" ? 6000 : 4000);
    const newItem: ToastItem = {
      ...options,
      id,
      type: options.type || "default",
      createdAt: Date.now(),
    };

    // Newest toast stays on top of the stack
    this.toasts = [newItem, ...this.toasts];
    this.notify();

    if (duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }

    return id;
  }

  success(description: React.ReactNode, options?: Omit<ToastOptions, "description" | "type">) {
    return this.add({ ...options, description, type: "success" });
  }

  error(description: React.ReactNode, options?: Omit<ToastOptions, "description" | "type">) {
    return this.add({ ...options, description, type: "error", priority: options?.priority || "high" });
  }

  info(description: React.ReactNode, options?: Omit<ToastOptions, "description" | "type">) {
    return this.add({ ...options, description, type: "info" });
  }

  warning(description: React.ReactNode, options?: Omit<ToastOptions, "description" | "type">) {
    return this.add({ ...options, description, type: "warning" });
  }

  remove(id: string) {
    this.toasts = this.toasts.filter((t) => t.id !== id);
    this.notify();
  }

  clear() {
    this.toasts = [];
    this.notify();
  }
}

export const toast = new ToastStore();

export function Toaster() {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);
  const [isHovered, setIsHovered] = React.useState(false);

  React.useEffect(() => {
    return toast.subscribe((updatedToasts) => {
      setToasts(updatedToasts);
    });
  }, []);

  if (toasts.length === 0) return null;

  // Maximum 4 visible stacked cards
  const visibleToasts = toasts.slice(0, 4);

  const getIcon = (type?: ToastType) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />;
      case "info":
        return <Info className="h-4 w-4 text-sky-400 shrink-0" />;
      default:
        return <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />;
    }
  };

  const getBorderColor = (type?: ToastType) => {
    switch (type) {
      case "success":
        return "border-emerald-500/40 shadow-emerald-950/20";
      case "error":
        return "border-rose-500/50 shadow-rose-950/20";
      case "warning":
        return "border-amber-500/40 shadow-amber-950/20";
      case "info":
        return "border-sky-500/40 shadow-sky-950/20";
      default:
        return "border-zinc-800 shadow-zinc-950/30";
    }
  };

  return (
    <>
      <style>{`
        @keyframes toastSlideDownIn {
          0% {
            opacity: 0;
            transform: translateY(-24px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateY(0px) scale(1);
          }
        }
        .toast-slide-down {
          animation: toastSlideDownIn 0.32s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
      <div
        aria-live="polite"
        role="region"
        aria-label="Notifications"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="fixed top-6 right-6 z-[99999] flex flex-col items-end pointer-events-none"
      >
        <div className="relative flex flex-col items-end w-[350px] sm:w-[390px] h-[64px]">
          {visibleToasts.map((item, index) => {
            const isFront = index === 0;

            // Stack calculations anchored at top-right
            const scale = isHovered ? 1 : 1 - index * 0.04;
            const translateY = isHovered ? index * 68 : index * 10;
            const zIndex = 50 - index * 10;
            const opacity = isHovered ? 1 : 1 - index * 0.15;

            return (
              <div
                key={item.id}
                style={{
                  transform: `translateY(${translateY}px) scale(${scale})`,
                  transformOrigin: "top center",
                  zIndex: zIndex,
                  opacity: opacity,
                  transition:
                    "transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1), scale 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
                className={cn(
                  "pointer-events-auto absolute top-0 right-0 flex items-center justify-between gap-3 w-full rounded-xl border bg-zinc-950/95 dark:bg-[#111215]/95 px-4 py-3.5 text-zinc-100 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-zinc-600",
                  getBorderColor(item.type),
                  isFront ? "toast-slide-down" : ""
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {getIcon(item.type)}
                  <div className="flex flex-col min-w-0">
                    {item.title && (
                      <p className="font-semibold text-white tracking-tight text-xs truncate">
                        {item.title}
                      </p>
                    )}
                    <p className="text-sm font-medium text-zinc-200 truncate">
                      {item.description}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toast.remove(item.id)}
                  className="rounded-lg p-1 text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors shrink-0 focus:outline-none"
                  aria-label="Close notification"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
