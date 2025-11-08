import { Badge } from "@/components/ui/badge";

type Status = "paid" | "partial" | "unpaid" | "pending" | "delivered";

interface StatusBadgeProps {
  status: Status;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const variants: Record<Status, { label: string; className: string }> = {
    paid: { label: "Paid", className: "bg-success text-success-foreground hover:bg-success/90" },
    partial: { label: "Partially Paid", className: "bg-warning text-warning-foreground hover:bg-warning/90" },
    unpaid: { label: "Unpaid", className: "bg-destructive text-destructive-foreground hover:bg-destructive/90" },
    pending: { label: "Pending", className: "bg-muted text-muted-foreground hover:bg-muted/90" },
    delivered: { label: "Delivered", className: "bg-success text-success-foreground hover:bg-success/90" },
  };

  const { label, className } = variants[status];

  return <Badge className={className}>{label}</Badge>;
}
