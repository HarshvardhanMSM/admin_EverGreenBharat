"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  Bell,
  Menu,
  User,
  LogOut,
  Settings,
  Shield,
  LayoutDashboard,
  Users as UsersIcon,
  Sprout,
  Store,
  ShoppingBag,
  Building2,
  Sparkles,
  Mail,
  Flag,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { AppSidebar } from "./AppSidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { useAuth } from "@/hooks/useAuth";
import { useSidebar } from "@/providers/SidebarProvider";
import { toast } from "@/components/ui/toast";
import { getMediaUrl } from "@/lib/utils";
import { settingsService } from "@/services/api/settings-service";

function formatPathTitle(pathname: string): string {
  if (pathname.startsWith("/nursery-orders/")) return "Order Details";
  if (pathname.startsWith("/nursery-vendors/") && pathname.endsWith("/edit")) return "Edit Vendor";
  if (pathname.startsWith("/nursery-vendors/")) return "Vendor Details";
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return "Dashboard";
  const lastSegment = segments[segments.length - 1];
  return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
}

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { collapsed, toggleSidebar } = useSidebar();
  const pageTitle = formatPathTitle(pathname);

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
  const [openCommand, setOpenCommand] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Keyboard shortcut listener for Command+K / Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpenCommand((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpenCommand(false);
    command();
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.add({
        type: "success",
        description: "Logged out successfully.",
      });
      router.push("/login");
    } catch {
      router.push("/login");
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
    <>
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border/60 bg-background/95 backdrop-blur-xs px-4 md:px-6">
        {/* Left section: Mobile sidebar trigger, Desktop collapse toggle & Page title / Breadcrumbs */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Sheet>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Sidebar</span>
                </Button>
              }
            />
            <SheetContent side="left" className="p-0 w-64">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <AppSidebar forceExpanded={true} />
            </SheetContent>
          </Sheet>

          {/* Desktop Sidebar Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="hidden md:flex h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg cursor-pointer"
            title={collapsed ? "Expand sidebar (Menu open)" : "Collapse sidebar (Icon view)"}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4.5 w-4.5" />
            ) : (
              <PanelLeftClose className="h-4.5 w-4.5" />
            )}
            <span className="sr-only">Toggle Sidebar</span>
          </Button>

          <Breadcrumb className="hidden sm:flex">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage className="font-bold text-foreground text-lg tracking-tight">
                  {pageTitle}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Right section: Search bar & User controls */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Global Search Input (Triggers Command Palette) */}
          <button
            type="button"
            onClick={() => setOpenCommand(true)}
            className="relative hidden md:flex items-center justify-between w-64 lg:w-80 h-9 px-3 text-xs font-normal text-muted-foreground rounded-lg border border-input bg-muted/30 hover:bg-muted/60 transition-colors shadow-2xs"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="truncate">Search plants, orders, vendors...</span>
            </div>
            <kbd className="pointer-events-none select-none rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground">
              ⌘K
            </kbd>
          </button>

          {/* Notifications Button */}
          <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-2xs">
              3
            </span>
            <span className="sr-only">Notifications</span>
          </Button>

          {/* Profile / Avatar Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" className="relative h-9 rounded-full px-2 gap-2 hover:bg-accent/60">
                  <Avatar className="h-8 w-8 border border-border/50 overflow-hidden">
                    {user?.avatarUrl && !imgError ? (
                      <img
                        src={getMediaUrl(user.avatarUrl)}
                        alt={displayName}
                        className="h-full w-full object-cover"
                        onError={() => setImgError(true)}
                      />
                    ) : (
                      <AvatarFallback className="bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold text-xs">
                        {initials}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="hidden lg:flex flex-col text-left text-xs">
                    <span className="font-bold text-foreground leading-none">{displayName}</span>
                    <span className="text-muted-foreground text-[10px] mt-0.5">{primaryRole}</span>
                  </div>
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel
                className="font-normal cursor-pointer hover:bg-muted/60 rounded-md transition-colors p-2 group"
                onClick={() => router.push("/settings/general?tab=profile")}
              >
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-bold leading-none group-hover:text-emerald-600 transition-colors">{displayName}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/settings/general?tab=profile")}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/administration/permissions")}>
                <Shield className="mr-2 h-4 w-4" />
                <span>Permissions</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/settings/general?tab=platform")}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Global Command Palette Modal */}
      <CommandDialog open={openCommand} onOpenChange={setOpenCommand}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading={projectName}>
            <CommandItem onSelect={() => runCommand(() => router.push("/dashboard"))}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Operations Dashboard</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/nursery-master-catalog"))}>
              <Sprout className="mr-2 h-4 w-4" />
              <span>Botanical Master Catalog</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/nursery-vendors"))}>
              <Store className="mr-2 h-4 w-4" />
              <span>Nursery Stores</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/nursery-orders"))}>
              <ShoppingBag className="mr-2 h-4 w-4" />
              <span>Orders & Doorstep OTP</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/nursery-inquiries"))}>
              <Building2 className="mr-2 h-4 w-4" />
              <span>B2B Institutional Inquiries</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/green-army"))}>
              <Sparkles className="mr-2 h-4 w-4" />
              <span>Green Army Community</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/nursery-templates"))}>
              <Mail className="mr-2 h-4 w-4" />
              <span>Email & SMS Templates</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Platform Management">
            <CommandItem onSelect={() => runCommand(() => router.push("/user-management/users"))}>
              <UsersIcon className="mr-2 h-4 w-4" />
              <span>Customers & Users</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/user-management/reports"))}>
              <Flag className="mr-2 h-4 w-4" />
              <span>User Reports</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Actions">
            <CommandItem onSelect={() => runCommand(() => router.push("/settings/general"))}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Configure Settings</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
