import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getInvoices } from "@/lib/storage";
import { Invoice } from "@/types";
import { StatusBadge } from "@/components/StatusBadge";

export default function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    setInvoices(getInvoices());
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Invoices</h2>
        <p className="text-muted-foreground">Manage customer invoices</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice No</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Amount Paid</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoiceNo}</TableCell>
                    <TableCell>{invoice.companyName}</TableCell>
                    <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                    <TableCell>KES {invoice.totalAmount.toLocaleString()}</TableCell>
                    <TableCell>KES {invoice.amountPaid.toLocaleString()}</TableCell>
                    <TableCell>KES {invoice.balance.toLocaleString()}</TableCell>
                    <TableCell>
                      <StatusBadge status={invoice.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-8">No invoices created yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
