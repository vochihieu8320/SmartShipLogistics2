import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: string | number;
  trend?: {
    value: string;
    positive?: boolean;
  };
  icon: ReactNode;
  iconColor: string;
  iconBgColor: string;
}

export function KpiCard({
  title,
  value,
  trend,
  icon,
  iconColor,
  iconBgColor,
}: KpiCardProps) {
  return (
    <Card className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-neutral-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold">{value}</h3>
          {trend && (
            <p className={cn(
              "text-xs flex items-center mt-1",
              trend.positive ? "text-green-600" : "text-red-600"
            )}>
              <span className="material-icons text-sm mr-1">
                {trend.positive ? "arrow_upward" : "arrow_downward"}
              </span>
              {trend.value}
            </p>
          )}
        </div>
        <div className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center",
          iconBgColor
        )}>
          <div className={cn("h-6 w-6", iconColor)}>
            {icon}
          </div>
        </div>
      </div>
    </Card>
  );
}
