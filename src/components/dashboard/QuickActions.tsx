import Link from "next/link";
import {
  UserPlus,
  Flag,
  Coins,
  Bell,
  ArrowDownToLine,
  Settings,
  ChevronRight,
} from "lucide-react";
import { SectionCard } from "@/components/common/SectionCard";
import { useAuth } from "@/hooks/useAuth";

const ACTIONS = [
  {
    title: "Add Creator",
    description: "Verify or onboard a creator",
    icon: UserPlus,
    href: "/creator-management/creators",
    color: "text-blue-600 bg-blue-500/10 dark:text-blue-400",
    permission: undefined as string | undefined,
  },
  {
    title: "View Reports",
    description: "Review moderation flags",
    icon: Flag,
    href: "/user-management/reports",
    color: "text-rose-600 bg-rose-500/10 dark:text-rose-400",
    permission: "audit:read" as string | undefined,
  },
  {
    title: "Manage Coins",
    description: "Update packages & rates",
    icon: Coins,
    href: "/finance/coin-packages",
    color: "text-amber-600 bg-amber-500/10 dark:text-amber-400",
    permission: "coin_packages:read",
  },
  {
    title: "Send Notification",
    description: "Broadcast announcement",
    icon: Bell,
    href: "/content/announcements",
    color: "text-purple-600 bg-purple-500/10 dark:text-purple-400",
    permission: undefined as string | undefined,
  },
  {
    title: "Review Wallets",
    description: "Inspect balances & frozen holds",
    icon: ArrowDownToLine,
    href: "/finance/wallets",
    color: "text-emerald-600 bg-emerald-500/10 dark:text-emerald-400",
    permission: "wallet:read",
  },
  {
    title: "System Settings",
    description: "Configure platform options",
    icon: Settings,
    href: "/settings/general",
    color: "text-slate-600 bg-slate-500/10 dark:text-slate-400",
    permission: undefined as string | undefined,
  },
];

export function QuickActions() {
  const { user, hasPermission } = useAuth();
  const isAdmin = user?.roles?.includes("SUPER_ADMIN") || user?.isAdmin;
  const visibleActions = ACTIONS.filter(
    (action) => isAdmin || !action.permission || hasPermission(action.permission)
  );

  return (
    <SectionCard title="Quick Actions" subtitle="Frequently performed management tasks">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        {visibleActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.title}
              href={action.href}
              className="flex items-center justify-between p-3.5 rounded-xl border border-border/50 bg-card hover:bg-accent/50 hover:border-border transition-all duration-150 group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${action.color} shrink-0`}
                >
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <div className="flex flex-col text-left min-w-0">
                  <span className="text-xs font-bold text-foreground truncate">
                    {action.title}
                  </span>
                  <span className="text-[10px] text-muted-foreground truncate">
                    {action.description}
                  </span>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground/60 group-hover:text-foreground group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
            </Link>
          );
        })}
      </div>
    </SectionCard>
  );
}
