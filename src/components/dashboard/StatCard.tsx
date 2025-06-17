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
    <div className={cn("rounded-lg p-5 border border-gray-100/30 glass-card", className)}>
      <div className="flex justify-between items-start mb-3">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <div className={cn("flex items-center justify-center text-white rounded-full p-1.5 backdrop-blur-sm", iconClassName || "bg-primary/80")}>
          {icon}
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
          {change && (
            <p className={cn(
              "text-xs font-medium flex items-center gap-1 mt-1",
              change.positive ? "text-accent" : "text-red-500"
            )}>
              {change.positive ? "↑" : "↓"} {change.value}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}