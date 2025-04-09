
import { cn } from "@/lib/utils";
import React from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: {
    value: string | number;
    positive?: boolean;
  };
  className?: string;
  iconClassName?: string;
}

export function StatCard({ 
  title, 
  value, 
  icon, 
  change, 
  className,
  iconClassName
}: StatCardProps) {
  return (
    <div className={cn("stat-card", className)}>
      <div className="flex justify-between items-start mb-4">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className={cn("p-2 rounded-md", iconClassName)}>
          {icon}
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <h3 className="text-2xl font-bold">{value}</h3>
          {change && (
            <p className={cn(
              "text-xs font-medium flex items-center gap-1 mt-1",
              change.positive ? "text-success" : "text-destructive"
            )}>
              {change.positive ? "↑" : "↓"} {change.value}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
