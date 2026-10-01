import { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
  contentClassName?: string;
}

export function SectionCard({
  title,
  subtitle,
  children,
  actions,
  className,
  contentClassName,
}: SectionCardProps) {
  const hasHeader = title || subtitle || actions;

  return (
    <Card className={cn("overflow-hidden border border-border/60 shadow-2xs bg-card", className)}>
      {hasHeader && (
        <CardHeader className="flex flex-row items-center justify-between gap-4 p-6 pb-4">
          <div className="space-y-1">
            {title && <CardTitle className="text-base font-bold tracking-tight text-foreground">{title}</CardTitle>}
            {subtitle && (
              <CardDescription className="text-xs text-muted-foreground">
                {subtitle}
              </CardDescription>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </CardHeader>
      )}
      <CardContent className={cn("p-6", hasHeader && "pt-0", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}
