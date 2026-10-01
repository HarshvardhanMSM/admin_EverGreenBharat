import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SectionCard } from "@/components/common/SectionCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ActivityItem {
  id: string;
  user: string;
  avatar: string;
  action: string;
  target: string;
  time: string;
}

const ACTIVITIES: ActivityItem[] = [
  {
    id: "1",
    user: "Alex Rivera",
    avatar: "AR",
    action: "started live stream",
    target: "Pro Gaming Tournament Finals",
    time: "2 mins ago",
  },
  {
    id: "2",
    user: "Sarah Chen",
    avatar: "SC",
    action: "requested withdrawal of",
    target: "$450.00",
    time: "15 mins ago",
  },
  {
    id: "3",
    user: "Michael Scott",
    avatar: "MS",
    action: "purchased coin pack",
    target: "10,000 Coins",
    time: "42 mins ago",
  },
  {
    id: "4",
    user: "Elena Rostova",
    avatar: "ER",
    action: "was verified as",
    target: "Official Creator",
    time: "1 hour ago",
  },
  {
    id: "5",
    user: "System Security",
    avatar: "SS",
    action: "flagged stream",
    target: "#ST-8842 for review",
    time: "2 hours ago",
  },
];

export function RecentActivityList() {
  return (
    <SectionCard
      title="Recent Activity"
      subtitle="Real-time log of platform events"
      actions={
        <Button variant="ghost" size="sm" render={<Link href="/user-management/reports" />}>
          View All
        </Button>
      }
    >
      <div className="space-y-4">
        {ACTIVITIES.map((activity) => (
          <div
            key={activity.id}
            className="flex items-center justify-between gap-3 rounded-lg p-2 hover:bg-muted/40 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                  {activity.avatar}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 text-xs">
                <p className="font-medium text-foreground truncate">
                  <span className="font-semibold">{activity.user}</span>{" "}
                  <span className="text-muted-foreground">{activity.action}</span>{" "}
                  <span className="font-medium text-foreground">{activity.target}</span>
                </p>
                <p className="text-[10px] text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
