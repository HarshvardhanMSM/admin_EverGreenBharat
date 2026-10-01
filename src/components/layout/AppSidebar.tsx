"use client";

import { useState, useEffect } from "react";
import { Logo } from "./Logo";
import { NavItem } from "./NavItem";
import { SIDEBAR_CONFIG } from "@/constants/sidebar";
import { settingsService } from "@/services/api/settings-service";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sun,
  Moon,
  ChevronDown,
  PanelLeftClose,
  ChevronRight,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useSidebar } from "@/providers/SidebarProvider";

interface AppSidebarProps {
  className?: string;
  forceExpanded?: boolean;
}

export function AppSidebar({ className = "", forceExpanded = false }: AppSidebarProps) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const { user, hasPermission } = useAuth();
  const { collapsed, toggleSidebar } = useSidebar();
  const isCollapsed = forceExpanded ? false : collapsed;

  const [projectName, setProjectName] = useState(() => {
    return settingsService.getPlatformSettings().projectName || "Ever Green Bharat";
  });

  useEffect(() => {
    setProjectName(settingsService.getPlatformSettings().projectName || "Ever Green Bharat");
    const handleUpdate = () => {
      setProjectName(settingsService.getPlatformSettings().projectName || "Ever Green Bharat");
    };
    window.addEventListener("platform_settings_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("platform_settings_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const toggleTheme = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const displayName = user?.displayName || user?.username || "Admin User";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const primaryRole = user?.roles?.[0] || "Administrator";

  return (
    <aside
      className={`relative flex h-full flex-col border-r border-border/60 bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out shrink-0 select-none ${
        isCollapsed ? "w-[72px]" : "w-64"
      } ${className}`}
    >
      {/* ─── Sidebar Header / Logo + Toggle ───────────────────────────────── */}
      {!isCollapsed ? (
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border/60 px-4">
          <div className="overflow-hidden min-w-0">
            <Logo collapsed={false} />
          </div>
          <button
            type="button"
            onClick={toggleSidebar}
            title="Collapse sidebar"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
          >
            <PanelLeftClose className="h-4 w-4" />
            <span className="sr-only">Collapse sidebar</span>
          </button>
        </div>
      ) : (
        <div className="relative flex h-16 shrink-0 items-center justify-center border-b border-border/60 px-2">
          <Logo collapsed={true} />
          {/* Floating Expand Button on edge */}
          <button
            type="button"
            onClick={toggleSidebar}
            title="Expand sidebar"
            className="absolute -right-3 top-5 z-20 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card shadow-sm text-muted-foreground hover:text-foreground hover:bg-accent hover:scale-110 transition-all cursor-pointer"
          >
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="sr-only">Expand sidebar</span>
          </button>
        </div>
      )}

      {/* ─── Navigation List ──────────────────────────────────────────────── */}
      <div
        className={`flex-1 overflow-y-auto py-4 space-y-4 [&::-webkit-scrollbar]:hidden [scrollbar-width:none] [-ms-overflow-style:none] ${
          isCollapsed ? "px-2" : "px-3.5"
        }`}
      >
        {SIDEBAR_CONFIG.map((group, groupIdx) => {
          // Filter items based on RBAC permissions if applicable
          const filterItem = (item: (typeof group.items)[number]): boolean => {
            if (user?.roles?.includes("SUPER_ADMIN") || user?.isAdmin) return true;
            if (item.href === "/user-management/users") return hasPermission("users:read");
            if (item.href === "/finance") return hasPermission("finance:read");
            if (item.href === "/user-management/reports") return hasPermission("audit:read");
            if (item.permissions && item.permissions.length > 0) {
              return item.permissions.some((p) => hasPermission(p));
            }
            return true;
          };

          const visibleItems = group.items
            .filter(filterItem)
            .map((item) => ({
              ...item,
              children: item.children?.filter(filterItem),
            }))
            .filter((item) => !item.children || item.children.length > 0);

          if (visibleItems.length === 0) return null;

          return (
            <div key={groupIdx} className="space-y-1.5">
              {!isCollapsed ? (
                group.groupTitle && (
                  <h3 className="px-3 text-[14px] font-bold uppercase tracking-wider text-muted-foreground/80 truncate">
                    {group.groupTitle === "Ever Green Bharat" ? projectName : group.groupTitle}
                  </h3>
                )
              ) : (
                group.groupTitle && (
                  <div className="my-2 border-t border-border/40 mx-2" />
                )
              )}
              <nav className="space-y-1">
                {visibleItems.map((item) => (
                  <NavItem
                    key={item.href}
                    item={item}
                    collapsed={isCollapsed}
                  />
                ))}
              </nav>
            </div>
          );
        })}
      </div>

      {/* ─── Sidebar Footer ───────────────────────────────────────────────── */}
      {!isCollapsed ? (
        <div className="p-4 border-t border-border/60 mt-auto space-y-3 bg-muted/20">
          {/* User Status Card */}
          <div className="flex items-center justify-between rounded-xl bg-card border border-border/50 p-3 shadow-2xs">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar className="h-9 w-9 shrink-0 border border-border/50">
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col text-left min-w-0">
                <span className="truncate text-xs font-bold text-foreground">
                  {displayName}
                </span>
                <span className="truncate text-[11px] text-muted-foreground">
                  {primaryRole}
                </span>
              </div>
            </div>
            <div className="h-2 w-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
          </div>

          {/* Theme Toggle Select */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-lg border border-border/50 bg-card px-3 py-2 text-xs font-medium text-foreground hover:bg-accent transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    {theme === "light" ? (
                      <Sun className="h-4 w-4 text-amber-500" />
                    ) : (
                      <Moon className="h-4 w-4 text-blue-400" />
                    )}
                    <span className="capitalize">{theme}</span>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              }
            />
            <DropdownMenuContent align="start" className="w-52">
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => toggleTheme("light")}
              >
                <Sun className="mr-2 h-4 w-4 text-amber-500" />
                <span>Light Mode</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => toggleTheme("dark")}
              >
                <Moon className="mr-2 h-4 w-4 text-blue-400" />
                <span>Dark Mode</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : (
        /* Collapsed Compact Footer */
        <div className="p-2 border-t border-border/60 mt-auto flex flex-col items-center gap-3 bg-muted/20">
          {/* User Avatar with Tooltip */}
          <Tooltip>
            <TooltipTrigger
              render={
                <div className="flex items-center justify-center cursor-pointer p-0.5">
                  <div className="relative">
                    <Avatar className="h-9 w-9 shrink-0 border border-border/50">
                      <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-sidebar animate-pulse" />
                  </div>
                </div>
              }
            />
            <TooltipContent side="right" sideOffset={14} className="text-xs py-1.5 px-3">
              <p className="font-bold text-foreground">{displayName}</p>
              <p className="text-muted-foreground text-[10px]">{primaryRole}</p>
            </TooltipContent>
          </Tooltip>

          {/* Compact Theme Toggle Button with Tooltip */}
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  onClick={() => toggleTheme(theme === "light" ? "dark" : "light")}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/50 bg-card text-foreground hover:bg-accent transition-colors shadow-2xs cursor-pointer"
                >
                  {theme === "light" ? (
                    <Sun className="h-4 w-4 text-amber-500" />
                  ) : (
                    <Moon className="h-4 w-4 text-blue-400" />
                  )}
                  <span className="sr-only">Toggle theme</span>
                </button>
              }
            />
            <TooltipContent side="right" sideOffset={14} className="text-xs py-1.5 px-3">
              <span>Switch to {theme === "light" ? "Dark" : "Light"} Mode</span>
            </TooltipContent>
          </Tooltip>
        </div>
      )}
    </aside>
  );
}
