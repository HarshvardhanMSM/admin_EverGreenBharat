"use client";

import { LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Line, LineChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface SparklinePoint {
  val: number;
}

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  chartColor?: string;
  sparklineData?: SparklinePoint[];
  trend?: {
    value: string | number;
    isPositive?: boolean;
    label?: string;
  };
  description?: string;
  className?: string;
}

const DEFAULT_SPARKLINE: SparklinePoint[] = [
  { val: 80 },
  { val: 20 },
  { val: 190 },
  { val: 270 },
  { val: 150 },
  { val: 620 },
  { val: 380 },
];

export function StatsCard({
  title,
  value,
  icon: Icon,
  iconColor = "text-primary",
  iconBg = "bg-primary/10",
  chartColor = "#6366f1",
  sparklineData = DEFAULT_SPARKLINE,
  trend,
  description,
  className,
}: StatsCardProps) {
  return (
    <Card
      className={cn(
        "overflow-hidden border border-border/60 shadow-2xs hover:shadow-xs transition-all bg-card flex flex-col justify-between",
        className
      )}
    >
      <CardContent className="p-3.5 flex flex-col justify-between h-full">
        {/* Top Section: Icon & Title */}
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-lg shrink-0",
                iconBg,
                iconColor
              )}
            >
              <Icon className="h-3.5 w-3.5" />
            </div>
          )}
          <span className="text-[11px] font-semibold text-muted-foreground truncate">
            {title}
          </span>
        </div>

        {/* Middle Section: Value & Mini Sparkline Chart */}
        <div className="mt-2 flex items-end justify-between gap-2">
          <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-xl shrink-0">
            {value}
          </h2>

          {/* Mini Sparkline Chart under each card */}
          <div className="h-9 w-60 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData}>
                <Line
                  type="natural"
                  dataKey="val"
                  stroke={chartColor}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 3, strokeWidth: 0 }}
                />
                <Tooltip
                  cursor={false}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded border bg-popover px-1.5 py-0.5 text-[10px] font-mono font-bold text-popover-foreground shadow-2xs">
                          {payload[0].value}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom Section: Subtext & Trend Badge */}
        <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/30">
          <span className="truncate text-[10px]">
            {description || trend?.label || ""}
          </span>
          {trend && (
            <Badge
              variant="outline"
              className={cn(
                "gap-0.5 px-1 py-0 text-[10px] font-bold border-transparent rounded-sm",
                trend.isPositive !== false
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
              )}
            >
              {trend.isPositive !== false ? (
                <ArrowUpRight className="h-2.5 w-2.5" />
              ) : (
                <ArrowDownRight className="h-2.5 w-2.5" />
              )}
              <span>{trend.value}</span>
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
