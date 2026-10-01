import { LucideIcon } from "lucide-react";

export interface SidebarItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string | number;
  permissions?: string[];
  children?: SidebarItem[];
}

export interface SidebarGroup {
  groupTitle?: string;
  items: SidebarItem[];
}

export type SidebarConfig = SidebarGroup[];
