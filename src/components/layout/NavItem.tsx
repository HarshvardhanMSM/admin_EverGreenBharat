"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { SidebarItem } from "@/types/sidebar";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

interface NavItemProps {
  item: SidebarItem;
  level?: number;
  siblings?: SidebarItem[];
  collapsed?: boolean;
}

function isNavItemActive(
  itemHref: string,
  pathname: string,
  siblings: SidebarItem[] = []
): boolean {
  if (pathname === itemHref) return true;
  if (itemHref === "/" || !itemHref) return false;

  if (pathname.startsWith(itemHref + "/")) {
    const hasMoreSpecificSibling = siblings.some((sib) => {
      if (sib.href === itemHref) return false;
      if (sib.href.length <= itemHref.length) return false;
      return pathname === sib.href || pathname.startsWith(sib.href + "/");
    });
    return !hasMoreSpecificSibling;
  }

  return false;
}

export function NavItem({
  item,
  level = 0,
  siblings = [],
  collapsed = false,
}: NavItemProps) {
  const pathname = usePathname();
  const Icon = item.icon;

  const hasChildren = Boolean(item.children && item.children.length > 0);

  const isChildActive = hasChildren
    ? Boolean(
        item.children?.some((child) =>
          isNavItemActive(child.href, pathname, item.children)
        )
      )
    : false;

  const isActive = !hasChildren && isNavItemActive(item.href, pathname, siblings);

  const [isOpen, setIsOpen] = useState(isActive || isChildActive);

  // ─── Collapsed Mode (Icon-only with Tooltip) ──────────────────────────
  if (collapsed) {
    const targetHref = hasChildren ? item.children?.[0]?.href || item.href : item.href;
    const isAnyActive = isActive || isChildActive;

    return (
      <Tooltip>
        <TooltipTrigger
          render={
            <Link
              href={targetHref}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl transition-all mx-auto my-0.5 relative group",
                isAnyActive
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs ring-2 ring-primary/25"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-4.5 w-4.5 shrink-0 transition-transform duration-200 group-hover:scale-110" />
              {item.badge !== undefined && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-sidebar" />
              )}
              <span className="sr-only">{item.title}</span>
            </Link>
          }
        />
        <TooltipContent
          side="right"
          sideOffset={14}
          className="flex items-center gap-2 font-medium z-50 shadow-md text-xs py-1.5 px-3"
        >
          <span>{item.title}</span>
          {item.badge !== undefined && (
            <span className="rounded-full bg-primary/20 text-primary-foreground px-1.5 py-0.2 text-[10px] font-bold">
              {item.badge}
            </span>
          )}
        </TooltipContent>
      </Tooltip>
    );
  }

  // ─── Expanded Mode with Sub-items ──────────────────────────────────────
  if (hasChildren) {
    return (
      <div className="w-full">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={cn(
            "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
            isChildActive
              ? "bg-accent/50 text-foreground font-semibold"
              : "text-muted-foreground"
          )}
        >
          <div className="flex items-center gap-3 min-w-0">
            <Icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{item.title}</span>
          </div>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          />
        </button>
        {isOpen && (
          <div className="ml-4 mt-1 flex flex-col space-y-1 border-l pl-2">
            {item.children?.map((child) => (
              <NavItem
                key={child.href}
                item={child}
                level={level + 1}
                siblings={item.children}
                collapsed={false}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // ─── Expanded Regular Link Item ─────────────────────────────────────────
  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
        isActive
          ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground font-semibold shadow-xs"
          : "text-muted-foreground"
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        <Icon className="h-4 w-4 shrink-0" />
        <span className="truncate">{item.title}</span>
      </div>
      {item.badge !== undefined && (
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-xs font-semibold",
            isActive
              ? "bg-primary-foreground/20 text-primary-foreground"
              : "bg-muted text-muted-foreground"
          )}
        >
          {item.badge}
        </span>
      )}
    </Link>
  );
}

