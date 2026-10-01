import { Clock } from "lucide-react";
import { PageContainer } from "@/components/common/PageContainer";
import { SectionCard } from "@/components/common/SectionCard";

interface ComingSoonProps {
  title: string;
  description: string;
}

export function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <PageContainer>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
      </div>

      <SectionCard title={title} subtitle="Module not implemented yet">
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border bg-muted/40">
            <Clock className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="text-sm font-semibold text-foreground">Coming Soon</p>
          <p className="max-w-md text-xs text-muted-foreground">
            This section is part of the new business architecture and will be
            implemented in an upcoming sprint once the supporting backend module
            is available.
          </p>
        </div>
      </SectionCard>
    </PageContainer>
  );
}
