import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { listLpos, updateLpo, listDeliveries, createDelivery, listInvoices, createInvoice } from "@/lib/api";
import { LPO, Delivery, Invoice } from "@/types";
import { StatusBadge } from "@/components/StatusBadge";
import { CreateLPODialog } from "@/components/CreateLPODialog";
import { CheckCircle, Download, FileText } from "lucide-react";
import { toast } from "sonner";
import { generateLPOPDF } from "@/lib/pdf";
import { responsiveTypography, responsiveSpacing } from "@/lib/responsive";

export default function LPOs() {
  const [lpos, setLpos] = useState<LPO[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Normalize LPO data to ensure all required fields are present
  const normalizeLpo = (lpo: Record<string, unknown>): LPO => ({
    ...(lpo as unknown as LPO),
    totalAmount: Number(lpo.totalAmount) || 0,
    amountPaid: Number(lpo.amountPaid) || 0,
    balance: Number(lpo.balance) || 0,
    subtotal: Number(lpo.subtotal) || 0,
    vat: Number(lpo.vat) || 0,
    paymentStatus: ((lpo.paymentStatus as string) || "unpaid") as "paid" | "partial" | "unpaid",
    status: ((lpo.status as string) || "pending") as "pending" | "delivered",
  });

  const loadLPOs = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await listLpos();
      // Normalize and sort by date descending (most recent first), with ID as tiebreaker for same-day entries
      const normalized = (data || []).map(normalizeLpo);
      const sorted = normalized.sort((a, b) => {
        const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime();
        if (dateCompare !== 0) return dateCompare;
        // If dates are the same, use id (Firebase key) as tiebreaker - newer entries have higher timestamps
        return (b.id || '').localeCompare(a.id || '');
      });
      setLpos(sorted);
    } catch (error) {
      console.error("Failed to load LPOs:", error);
      toast.error("Failed to load LPOs");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLPOs();
  }, [loadLPOs]);

  const handleMarkDelivered = async (lpo: LPO) => {
    try {
      setIsLoading(true);
      // Update LPO status
      await updateLpo(lpo.id, { status: "delivered" });

      // Create delivery record
      await createDelivery({
        lpoId: lpo.id,
        lpoNumber: lpo.lpoNumber,
        companyId: lpo.companyId,
        companyName: lpo.companyName,
        items: lpo.items,
        date: new Date().toISOString().split("T")[0],
        status: "delivered",
      });

      toast.success("LPO marked as delivered");
      await loadLPOs();
    } catch (error) {
      console.error("Failed to mark as delivered:", error);
      toast.error("Failed to mark LPO as delivered");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateInvoice = async (lpo: LPO) => {
    try {
      setIsLoading(true);
      
      // Check if invoice already exists for this LPO
      const invoices = await listInvoices();
      const existingInvoice = invoices?.find((inv: Invoice) => inv.lpoId === lpo.id);
      
      if (existingInvoice) {
        toast.error(`Invoice already exists for this LPO: ${existingInvoice.invoiceNo}`);
        setIsLoading(false);
        return;
      }
      
      await createInvoice({
        companyId: lpo.companyId,
        companyName: lpo.companyName,
        lpoId: lpo.id,
        lpoNumber: lpo.lpoNumber,
        // Generate invoice number to match LPO number
        // e.g., LPO-2025-00001 → INV-2025-00001
        invoiceNo: lpo.lpoNumber ? lpo.lpoNumber.replace('LPO', 'INV') : undefined,
        date: new Date().toISOString().split("T")[0],
        items: lpo.items,
        subtotal: lpo.subtotal,
        vat: lpo.vat,
        totalAmount: lpo.totalAmount,
        amountPaid: 0,
        balance: lpo.totalAmount,
        status: "unpaid",
      });

      toast.success(`Invoice created from LPO ${lpo.lpoNumber}`);
      await loadLPOs(); // Reload to refresh state
    } catch (error) {
      console.error("Failed to create invoice:", error);
      toast.error("Failed to create invoice");
    } finally {
      setIsLoading(false);
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-success text-success-foreground";
      case "partial":
        return "bg-warning text-warning-foreground";
      case "unpaid":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className={responsiveSpacing.pageGap}>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
        <div>
          <h2 className={responsiveTypography.pageTitle}>Local Purchase Orders</h2>
          <p className={`${responsiveTypography.small} text-muted-foreground`}>Manage LPOs for goods delivery</p>
        </div>
        <CreateLPODialog onLPOCreated={loadLPOs} />
      </div>

      <Card>
        <CardContent className="overflow-x-auto p-2 sm:p-4">
          {lpos.length > 0 ? (
            <div className="min-w-full overflow-x-auto">
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className={`${responsiveTypography.tableHeader} whitespace-nowrap`}>LPO Number</TableHead>
                  <TableHead className={`${responsiveTypography.tableHeader} whitespace-nowrap`}>Company</TableHead>
                  <TableHead className={`${responsiveTypography.tableHeader} whitespace-nowrap`}>Date</TableHead>
                  <TableHead className={`${responsiveTypography.tableHeader} whitespace-nowrap text-right`}>Total Amount</TableHead>
                  <TableHead className={`${responsiveTypography.tableHeader} whitespace-nowrap text-right`}>Amount Paid</TableHead>
                  <TableHead className={`${responsiveTypography.tableHeader} whitespace-nowrap text-right`}>Balance</TableHead>
                  <TableHead className={`${responsiveTypography.tableHeader} whitespace-nowrap`}>Payment Status</TableHead>
                  <TableHead className={`${responsiveTypography.tableHeader} whitespace-nowrap`}>Delivery</TableHead>
                  <TableHead className={`${responsiveTypography.tableHeader} whitespace-nowrap`}>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lpos.map((lpo) => (
                  <TableRow key={lpo.id}>
                    <TableCell className={`${responsiveTypography.tableCell} font-medium whitespace-nowrap`}>{lpo.lpoNumber}</TableCell>
                    <TableCell className={`${responsiveTypography.tableCell} whitespace-nowrap`}>{lpo.companyName}</TableCell>
                    <TableCell className={`${responsiveTypography.tableCell} whitespace-nowrap`}>{new Date(lpo.date).toLocaleDateString()}</TableCell>
                    <TableCell className={`${responsiveTypography.tableCell} text-right whitespace-nowrap`}>KES {lpo.totalAmount.toLocaleString()}</TableCell>
                    <TableCell className={`${responsiveTypography.tableCell} text-right whitespace-nowrap`}>KES {lpo.amountPaid.toLocaleString()}</TableCell>
                    <TableCell className={`${responsiveTypography.tableCell} text-right whitespace-nowrap`}>KES {lpo.balance.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge className={`${getPaymentStatusColor(lpo.paymentStatus)} ${responsiveTypography.badge}`}>
                        {lpo.paymentStatus.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={lpo.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="whitespace-nowrap text-xs"
                          onClick={() => handleCreateInvoice(lpo)}
                        >
                          <FileText className="h-3 w-3 mr-1" />
                          Create Invoice
                        </Button>
                        {lpo.status === "pending" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="whitespace-nowrap text-xs"
                            onClick={() => handleMarkDelivered(lpo)}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Delivered
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => generateLPOPDF(lpo)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          PDF
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No LPOs created yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
