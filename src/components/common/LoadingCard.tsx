import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface LoadingCardProps {
  title?: boolean;
  lines?: number;
  className?: string;
}

export function LoadingCard({
  title = true,
  lines = 3,
  className,
}: LoadingCardProps) {
  return (
    <Card className={cn("overflow-hidden p-6 space-y-4", className)}>
      {title && <Skeleton className="h-6 w-1/3 rounded-md" />}
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full rounded-md" />
        ))}
      </div>
    </Card>
  );
}
