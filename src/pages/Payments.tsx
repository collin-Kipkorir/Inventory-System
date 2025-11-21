import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { listPayments } from "@/lib/api";
import { Payment } from "@/types";
import { CreatePaymentDialog } from "@/components/CreatePaymentDialog";
import { toast } from "sonner";
import { responsiveTypography, responsiveSpacing } from "@/lib/responsive";

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Normalize payment data to ensure all required fields are present
  const normalizePayment = (payment: Record<string, unknown>): Payment => ({
    ...(payment as unknown as Payment),
    amountPaid: Number(payment.amountPaid) || 0,
  });

  const loadPayments = useCallback(async () => {
    try {
      setIsLoading(true);
      const allPayments = await listPayments();
      // Normalize and sort by date descending (most recent first)
      const normalized = (allPayments || []).map(normalizePayment);
      const sorted = normalized.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setPayments(sorted);
    } catch (error) {
      console.error("Failed to load payments:", error);
      toast.error("Failed to load payments");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const getModeColor = (mode: string) => {
    switch (mode) {
      case "cash":
        return "bg-success text-success-foreground";
      case "mpesa":
        return "bg-primary text-primary-foreground";
      case "bank":
        return "bg-secondary text-secondary-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className={responsiveSpacing.pageGap}>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
        <div>
          <h2 className={responsiveTypography.pageTitle}>Payments</h2>
          <p className={`${responsiveTypography.small} text-muted-foreground`}>Track all payment transactions</p>
        </div>
        <CreatePaymentDialog onPaymentCreated={loadPayments} />
      </div>

      <Card>
        <CardContent className="overflow-x-auto p-2 sm:p-4">
          {payments.length > 0 ? (
            <div className="min-w-full overflow-x-auto">
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className={`${responsiveTypography.tableHeader} whitespace-nowrap`}>Payment No</TableHead>
                  <TableHead className={`${responsiveTypography.tableHeader} whitespace-nowrap`}>Company</TableHead>
                  <TableHead className={`${responsiveTypography.tableHeader} whitespace-nowrap`}>Reference</TableHead>
                  <TableHead className={`${responsiveTypography.tableHeader} whitespace-nowrap`}>Date</TableHead>
                  <TableHead className={`${responsiveTypography.tableHeader} whitespace-nowrap text-right`}>Amount Paid</TableHead>
                  <TableHead className={`${responsiveTypography.tableHeader} whitespace-nowrap`}>Mode</TableHead>
                  <TableHead className={`${responsiveTypography.tableHeader} whitespace-nowrap`}>Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className={`${responsiveTypography.tableCell} font-medium whitespace-nowrap`}>{payment.paymentNo}</TableCell>
                    <TableCell className={`${responsiveTypography.tableCell} whitespace-nowrap`}>{payment.companyName}</TableCell>
                    <TableCell className={`${responsiveTypography.tableCell} whitespace-nowrap`}>
                      {payment.invoiceNo || payment.lpoNumber || "N/A"}
                    </TableCell>
                    <TableCell className={`${responsiveTypography.tableCell} whitespace-nowrap`}>{new Date(payment.date).toLocaleDateString()}</TableCell>
                    <TableCell className={`${responsiveTypography.tableCell} text-right whitespace-nowrap`}>KES {formatCurrency(payment.amountPaid)}</TableCell>
                    <TableCell>
                      <Badge className={`${getModeColor(payment.mode)} ${responsiveTypography.badge}`}>
                        {payment.mode.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className={`${responsiveTypography.small} max-w-xs truncate`}>{payment.remarks || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          ) : (
            <p className={`${responsiveTypography.body} text-center text-muted-foreground py-8`}>No payments recorded yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
