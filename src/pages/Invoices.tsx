import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download } from "lucide-react";
import { listInvoices } from "@/lib/api";
import { Invoice } from "@/types";
import { StatusBadge } from "@/components/StatusBadge";
import { generateInvoicePDF } from "@/lib/pdf";
import { toast } from "sonner";
import { responsiveTypography, responsiveSpacing } from "@/lib/responsive";

export default function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Normalize invoice data to ensure all required fields are present
  const normalizeInvoice = (invoice: Record<string, unknown>): Invoice => ({
    ...(invoice as unknown as Invoice),
    totalAmount: Number(invoice.totalAmount) || 0,
    amountPaid: Number(invoice.amountPaid) || 0,
    balance: Number(invoice.balance) || 0,
    subtotal: Number(invoice.subtotal) || 0,
    vat: Number(invoice.vat) || 0,
    status: ((invoice.status as string) || "unpaid") as "paid" | "partial" | "unpaid",
  });

  const loadInvoices = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await listInvoices();
      // Normalize and sort by date descending (most recent first), with ID as tiebreaker for same-day entries
      const normalized = (data || []).map(normalizeInvoice);
      const sorted = normalized.sort((a, b) => {
        const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime();
        if (dateCompare !== 0) return dateCompare;
        // If dates are the same, use id (Firebase key) as tiebreaker - newer entries have higher timestamps
        return (b.id || '').localeCompare(a.id || '');
      });
      setInvoices(sorted);
    } catch (error) {
      console.error("Failed to load invoices:", error);
      toast.error("Failed to load invoices");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  return (
    <div className={responsiveSpacing.pageGap}>
      <div>
        <h2 className={responsiveTypography.pageTitle}>Invoices</h2>
        <p className={`${responsiveTypography.small} text-muted-foreground`}>Manage customer invoices</p>
      </div>

      <Card>
        <CardContent className="overflow-x-auto p-2 sm:p-4">
          {invoices.length > 0 ? (
            <div className="min-w-full overflow-x-auto">
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className={`${responsiveTypography.tableHeader} whitespace-nowrap`}>Invoice No</TableHead>
                  <TableHead className={`${responsiveTypography.tableHeader} whitespace-nowrap`}>LPO Reference</TableHead>
                  <TableHead className={`${responsiveTypography.tableHeader} whitespace-nowrap`}>Company</TableHead>
                  <TableHead className={`${responsiveTypography.tableHeader} whitespace-nowrap`}>Date</TableHead>
                  <TableHead className={`${responsiveTypography.tableHeader} whitespace-nowrap text-right`}>Total Amount</TableHead>
                  <TableHead className={`${responsiveTypography.tableHeader} whitespace-nowrap text-right`}>Amount Paid</TableHead>
                  <TableHead className={`${responsiveTypography.tableHeader} whitespace-nowrap text-right`}>Balance</TableHead>
                  <TableHead className={`${responsiveTypography.tableHeader} whitespace-nowrap`}>Status</TableHead>
                  <TableHead className={`${responsiveTypography.tableHeader} whitespace-nowrap`}>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className={`${responsiveTypography.tableCell} font-medium whitespace-nowrap`}>{invoice.invoiceNo}</TableCell>
                    <TableCell className={responsiveTypography.tableCell}>
                      {invoice.lpoNumber ? (
                        <Badge variant="outline" className={`${responsiveTypography.badge} whitespace-nowrap`}>
                          {invoice.lpoNumber}
                        </Badge>
                      ) : (
                        <span className={`${responsiveTypography.small} text-muted-foreground`}>-</span>
                      )}
                    </TableCell>
                    <TableCell className={`${responsiveTypography.tableCell} whitespace-nowrap`}>{invoice.companyName}</TableCell>
                    <TableCell className={`${responsiveTypography.tableCell} whitespace-nowrap`}>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                    <TableCell className={`${responsiveTypography.tableCell} text-right whitespace-nowrap`}>KES {formatCurrency(invoice.totalAmount)}</TableCell>
                    <TableCell className={`${responsiveTypography.tableCell} text-right whitespace-nowrap`}>KES {formatCurrency(invoice.amountPaid)}</TableCell>
                    <TableCell className={`${responsiveTypography.tableCell} text-right whitespace-nowrap`}>KES {formatCurrency(invoice.balance)}</TableCell>
                    <TableCell>
                      <StatusBadge status={invoice.status} />
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        className="whitespace-nowrap text-xs"
                        onClick={() => generateInvoicePDF(invoice)}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        PDF
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No invoices created yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
