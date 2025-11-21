import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { responsiveTypography } from "@/lib/responsive";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
}

export function StatCard({ title, value, icon: Icon, trend, trendUp }: StatCardProps) {
  return (
    <Card className="p-3 sm:p-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
        <CardTitle className={`${responsiveTypography.label} text-muted-foreground`}>
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="p-0">
        <div className="text-lg sm:text-xl md:text-2xl font-bold">{value}</div>
        {trend && (
          <p className={`${responsiveTypography.small} mt-1 ${trendUp ? "text-success" : "text-destructive"}`}>
            {trend}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
