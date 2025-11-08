import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getPayments } from "@/lib/storage";
import { Payment } from "@/types";

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    setPayments(getPayments());
  }, []);

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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Payments</h2>
        <p className="text-muted-foreground">Track all payment transactions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Payments</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment No</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Invoice No</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount Paid</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.paymentNo}</TableCell>
                    <TableCell>{payment.companyName}</TableCell>
                    <TableCell>{payment.invoiceNo || "N/A"}</TableCell>
                    <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                    <TableCell>KES {payment.amountPaid.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge className={getModeColor(payment.mode)}>
                        {payment.mode.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>{payment.remarks || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-8">No payments recorded yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
