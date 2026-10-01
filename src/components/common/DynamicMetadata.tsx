"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { settingsService } from "@/services/api/settings-service";

const ROUTE_TITLES: Record<string, string> = {
  "/": "Console",
  "/dashboard": "Dashboard",
  "/nursery-vendors": "Nursery Vendors",
  "/nursery-master-catalog": "Master Botanical Catalog",
  "/nursery-orders": "Orders & Delivery OTP",
  "/nursery-inquiries": "Corporate B2B Inquiries",
  "/nursery-templates": "Notification Templates",
  "/green-army": "Green Army Creators",
  "/settings/general": "General Platform Settings",
  "/settings/notifications": "Notification Settings",
  "/settings/payments": "Payment Gateways",
  "/settings/profile": "Admin Profile",
  "/user-management/users": "User Directory",
  "/user-management/reports": "User Reports",
  "/administration/admins": "Admin Accounts",
  "/administration/roles": "Roles & Permissions",
  "/administration/permissions": "System Permissions",
  "/administration/audit-logs": "Audit Logs",
  "/administration/login-history": "Login History",
  "/administration/sessions": "Active Sessions",
  "/content/announcements": "Announcements",
  "/content/banners": "Promotional Banners",
  "/content/faq": "FAQ Management",
  "/content/cms": "CMS Content Pages",
  "/content/home-sections": "Home Dynamic Sections",
  "/profile": "My Profile",
  "/login": "Sign In",
};

function resolvePageTitle(pathname: string | null): string {
  if (!pathname) return "";
  if (ROUTE_TITLES[pathname]) {
    return ROUTE_TITLES[pathname];
  }
  // Dynamic vendor edit route: /nursery-vendors/[vendorId]/edit
  if (pathname.startsWith("/nursery-vendors/") && pathname.endsWith("/edit")) {
    return "Edit Nursery Vendor";
  }
  if (pathname.startsWith("/nursery-vendors/")) {
    return "Vendor Details";
  }
  if (pathname.startsWith("/nursery-orders/")) {
    return "Order Details";
  }
  // Fallback: convert path segments to Title Case
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length > 0) {
    const last = segments[segments.length - 1];
    return last
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }
  return "";
}

function upsertMeta(key: "name" | "property", keyValue: string, content: string) {
  if (!content || typeof document === "undefined") return;
  try {
    let el = document.querySelector(`meta[${key}="${keyValue}"]`) as HTMLMetaElement | null;
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute(key, keyValue);
      document.head.appendChild(el);
    }
    el.setAttribute("content", content);
  } catch (err) {
    console.warn("Failed to set meta tag", keyValue, err);
  }
}

function upsertLink(rel: string, href: string) {
  if (!href || typeof document === "undefined") return;
  try {
    let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
    if (!el) {
      el = document.createElement("link");
      el.setAttribute("rel", rel);
      document.head.appendChild(el);
    }
    el.setAttribute("href", href);
  } catch (err) {
    console.warn("Failed to set link tag", rel, err);
  }
}

export function DynamicMetadata() {
  const pathname = usePathname();

  useEffect(() => {
    const applyDynamicMetadata = () => {
      if (typeof document === "undefined") return;

      const settings = settingsService.getPlatformSettings();
      const projectName = settings?.projectName?.trim() || "Ever Green Bharat";
      const projectDescription =
        settings?.projectDescription?.trim() ||
        "Administrative operations, botanical catalog taxonomy, nursery stores, and doorstep delivery.";
      const websiteUrl = settings?.websiteUrl?.trim() || "";
      const logoUrl = settings?.logoUrl?.trim() || "";

      // 1. Compute and update document title
      const pageSub = resolvePageTitle(pathname);
      const documentTitle = pageSub
        ? `${pageSub} | ${projectName}`
        : `${projectName} — Nursery Marketplace Admin Console`;

      document.title = documentTitle;

      // 2. Standard Meta Tags
      upsertMeta("name", "description", projectDescription);
      upsertMeta("name", "application-name", projectName);
      upsertMeta("name", "apple-mobile-web-app-title", projectName);
      upsertMeta("name", "author", projectName);

      // 3. OpenGraph Tags
      upsertMeta("property", "og:title", documentTitle);
      upsertMeta("property", "og:description", projectDescription);
      upsertMeta("property", "og:site_name", projectName);
      upsertMeta("property", "og:type", "website");
      if (websiteUrl) {
        upsertMeta("property", "og:url", websiteUrl);
      } else if (typeof window !== "undefined") {
        upsertMeta("property", "og:url", window.location.href);
      }

      // 4. Twitter Card Tags
      upsertMeta("name", "twitter:card", "summary_large_image");
      upsertMeta("name", "twitter:title", documentTitle);
      upsertMeta("name", "twitter:description", projectDescription);

      // 5. Dynamic Favicon & Social Image from logoUrl
      if (logoUrl) {
        upsertMeta("property", "og:image", logoUrl);
        upsertMeta("name", "twitter:image", logoUrl);
        upsertLink("icon", logoUrl);
        upsertLink("shortcut icon", logoUrl);
        upsertLink("apple-touch-icon", logoUrl);
      }
    };

    applyDynamicMetadata();

    window.addEventListener("platform_settings_updated", applyDynamicMetadata);
    window.addEventListener("storage", applyDynamicMetadata);

    return () => {
      window.removeEventListener("platform_settings_updated", applyDynamicMetadata);
      window.removeEventListener("storage", applyDynamicMetadata);
    };
  }, [pathname]);

  return null;
}
