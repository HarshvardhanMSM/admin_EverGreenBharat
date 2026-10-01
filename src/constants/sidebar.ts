import {
  LayoutDashboard,
  Users,
  Flag,
  Bell,
  ShieldCheck,
  Shield,
  Key,
  FileText,
  History,
  Laptop,
  Settings,
  FileSearch,
  Image,
  HelpCircle,
  Megaphone,
  Sprout,
  Store,
  ShoppingBag,
  Building2,
  Mail,
  CreditCard,
  Sparkles,
  Layers,
} from "lucide-react";
import { SidebarConfig } from "@/types/sidebar";

export const SIDEBAR_CONFIG: SidebarConfig = [
  {
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    groupTitle: "Ever Green Bharat",
    items: [
      {
        title: "Master Catalog",
        href: "/nursery-master-catalog",
        icon: Sprout,
      },
      {
        title: "Category & Attributes",
        href: "/nursery-categories",
        icon: Layers,
      },
      {
        title: "Nursery Stores",
        href: "/nursery-vendors",
        icon: Store,
      },
      {
        title: "Orders & OTP",
        href: "/nursery-orders",
        icon: ShoppingBag,
      },
      {
        title: "B2B Inquiries",
        href: "/nursery-inquiries",
        icon: Building2,
      },
      {
        title: "Green Army",
        href: "/green-army",
        icon: Sparkles,
      },
      {
        title: "Email Templates",
        href: "/nursery-templates",
        icon: Mail,
      },
    ],
  },
  {
    groupTitle: "User Management",
    items: [
      {
        title: "Customers & Users",
        href: "/user-management/users",
        icon: Users,
        permissions: ["users:read"],
      },
      {
        title: "User Reports",
        href: "/user-management/reports",
        icon: Flag,
        permissions: ["audit:read"],
      },
    ],
  },
  {
    groupTitle: "Content & Marketing",
    items: [
      {
        title: "Banners & Promos",
        href: "/content/banners",
        icon: Image,
      },
      {
        title: "CMS Pages",
        href: "/content/cms",
        icon: FileText,
      },
      {
        title: "FAQ & Plant Care",
        href: "/content/faq",
        icon: HelpCircle,
      },
      {
        title: "Announcements",
        href: "/content/announcements",
        icon: Megaphone,
      },
    ],
  },
  {
    groupTitle: "Administration",
    items: [
      {
        title: "Staff Management",
        href: "/administration/admins",
        icon: ShieldCheck,
      },
      {
        title: "Roles",
        href: "/administration/roles",
        icon: Shield,
      },
      {
        title: "Permissions",
        href: "/administration/permissions",
        icon: Key,
      },
      {
        title: "Audit Logs",
        href: "/administration/audit-logs",
        icon: FileSearch,
      },
      {
        title: "Login History",
        href: "/administration/login-history",
        icon: History,
      },
      {
        title: "Active Sessions",
        href: "/administration/sessions",
        icon: Laptop,
      },
    ],
  },
  {
    groupTitle: "Platform Settings",
    items: [
      {
        title: "General Settings",
        href: "/settings/general",
        icon: Settings,
      },
      {
        title: "Payment Settings",
        href: "/settings/payments",
        icon: CreditCard,
      },
      {
        title: "Notification Settings",
        href: "/settings/notifications",
        icon: Bell,
      },
    ],
  },
];
