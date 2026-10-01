"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  settingsService,
  PlatformGeneralSettings,
} from "@/services/api/settings-service";

interface LogoProps {
  collapsed?: boolean;
  className?: string;
}

export function Logo({ collapsed = false, className = "" }: LogoProps) {
  const [settings, setSettings] = useState<PlatformGeneralSettings>(() =>
    settingsService.getPlatformSettings()
  );

  useEffect(() => {
    // Read initial settings in client
    setSettings(settingsService.getPlatformSettings());

    const handleUpdate = () => {
      setSettings(settingsService.getPlatformSettings());
    };

    window.addEventListener("platform_settings_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("platform_settings_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const projectName = settings?.projectName?.trim() || "Ever Green Bharat";
  const words = projectName.split(/\s+/);
  const prefix = words.length > 1 ? words.slice(0, -1).join(" ") : "";
  const lastWord = words.length > 1 ? words[words.length - 1] : projectName;
  const subtitle = settings?.badgeText
    ? settings.badgeText.replace(/^[^\w\s]+/, "").trim()
    : "Nursery Marketplace";

  return (
    <Link
      href="/dashboard"
      className={`flex items-center gap-3 transition-all hover:opacity-95 group ${className}`}
    >
      {/* Brand Emblem or Custom Uploaded Logo */}
      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-900 text-white shadow-md shadow-emerald-950/20 ring-1 ring-emerald-400/40 group-hover:scale-105 transition-transform duration-200 overflow-hidden">
        {settings?.logoUrl ? (
          <img
            src={settings.logoUrl}
            alt={projectName}
            className="w-full h-full object-cover"
          />
        ) : (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5 text-emerald-100 drop-shadow-xs"
          >
            {/* Symmetrical organic sacred leaf with center vein and sprouts */}
            <path
              d="M12 22C12 22 20 18 20 10C20 4.5 15.5 2 12 2C8.5 2 4 4.5 4 10C4 18 12 22 12 22Z"
              fill="currentColor"
              fillOpacity="0.28"
            />
            <path d="M12 22V6" />
            <path d="M12 14C14.5 12 16.5 11.5 18 12" />
            <path d="M12 17C9.5 15 7.5 14.5 6 15" />
            <path d="M12 10C14 8.5 15.5 8 17 8.5" />
            <path d="M12 12C10 10.5 8.5 10 7 10.5" />
          </svg>
        )}

        {/* Live ecosystem pulse indicator */}
        <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400 border border-white dark:border-slate-900"></span>
        </span>
      </div>

      {!collapsed && (
        <div className="flex flex-col min-w-0 leading-tight">
          <div className="flex items-center gap-1">
            <span className="truncate text-[15px] font-extrabold tracking-tight text-foreground">
              {prefix ? `${prefix} ` : ""}
              <span className="text-emerald-700 dark:text-emerald-400 font-black">
                {lastWord}
              </span>
            </span>
          </div>
          <span className="truncate text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {subtitle}
          </span>
        </div>
      )}
    </Link>
  );
}
