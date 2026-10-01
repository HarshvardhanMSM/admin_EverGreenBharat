"use client";

import React from "react";

interface FinanceStatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  variant?: "default" | "primary" | "warning" | "danger" | "success";
}

export const FinanceStatCard: React.FC<FinanceStatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = "default",
}) => {
  const variantStyles = {
    default: "bg-card border-border text-card-foreground",
    primary: "bg-primary/10 border-primary/20 text-primary-foreground",
    warning: "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400",
    danger: "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400",
    success: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400",
  };

  return (
    <div className={`p-5 rounded-xl border shadow-sm transition-all duration-200 hover:shadow-md ${variantStyles[variant]}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</span>
        {icon && <div className="p-2 rounded-lg bg-background/50 text-muted-foreground">{icon}</div>}
      </div>
      <div className="mt-3 flex items-baseline justify-between">
        <span className="text-2xl font-bold tracking-tight text-foreground">{value}</span>
        {trend && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${trend.isPositive ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-red-500/15 text-red-600 dark:text-red-400"}`}>
            {trend.isPositive ? "+" : ""}{trend.value}
          </span>
        )}
      </div>
      {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
    </div>
  );
};
