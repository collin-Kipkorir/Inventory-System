import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getLPOs, saveLPOs, getDeliveries, saveDeliveries, generateDeliveryNumber, generateId, getInvoices, saveInvoices, generateInvoiceNumber } from "@/lib/storage";
import { LPO, Delivery, Invoice } from "@/types";
import { StatusBadge } from "@/components/StatusBadge";
import { CreateLPODialog } from "@/components/CreateLPODialog";
import { CheckCircle, Download, FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { generateLPOPDF } from "@/lib/pdf";

export default function LPOs() {
  const [lpos, setLpos] = useState<LPO[]>([]);

  const loadLPOs = () => {
    setLpos(getLPOs());
  };

  useEffect(() => {
    loadLPOs();
  }, []);

  const handleMarkDelivered = (lpo: LPO) => {
    const updatedLPO = { ...lpo, status: "delivered" as const };
    const allLPOs = getLPOs();
    saveLPOs(allLPOs.map((l) => (l.id === lpo.id ? updatedLPO : l)));

    const newDelivery: Delivery = {
      id: generateId(),
      deliveryNo: generateDeliveryNumber(),
      lpoId: lpo.id,
      lpoNumber: lpo.lpoNumber,
      companyId: lpo.companyId,
      companyName: lpo.companyName,
      items: lpo.items,
      date: new Date().toISOString().split("T")[0],
      status: "delivered",
      createdAt: new Date().toISOString(),
    };

    const deliveries = getDeliveries();
    saveDeliveries([...deliveries, newDelivery]);

    toast({ title: "Success", description: "LPO marked as delivered" });
    loadLPOs();
  };

  const handleCreateInvoice = (lpo: LPO) => {
    const newInvoice: Invoice = {
      id: generateId(),
      invoiceNo: generateInvoiceNumber(),
      companyId: lpo.companyId,
      companyName: lpo.companyName,
      date: new Date().toISOString().split("T")[0],
      items: lpo.items,
      subtotal: lpo.totalAmount,
      totalAmount: lpo.totalAmount,
      amountPaid: 0,
      balance: lpo.totalAmount,
      status: "unpaid",
      createdAt: new Date().toISOString(),
    };

    const invoices = getInvoices();
    saveInvoices([...invoices, newInvoice]);

    toast({ 
      title: "Success", 
      description: `Invoice ${newInvoice.invoiceNo} created from LPO ${lpo.lpoNumber}` 
    });
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Local Purchase Orders</h2>
          <p className="text-muted-foreground">Manage LPOs for goods delivery</p>
        </div>
        <CreateLPODialog onLPOCreated={loadLPOs} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All LPOs</CardTitle>
        </CardHeader>
        <CardContent>
          {lpos.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>LPO Number</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Amount Paid</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead>Delivery Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lpos.map((lpo) => (
                  <TableRow key={lpo.id}>
                    <TableCell className="font-medium">{lpo.lpoNumber}</TableCell>
                    <TableCell>{lpo.companyName}</TableCell>
                    <TableCell>{new Date(lpo.date).toLocaleDateString()}</TableCell>
                    <TableCell>KES {lpo.totalAmount.toLocaleString()}</TableCell>
                    <TableCell>KES {lpo.amountPaid.toLocaleString()}</TableCell>
                    <TableCell>KES {lpo.balance.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge className={getPaymentStatusColor(lpo.paymentStatus)}>
                        {lpo.paymentStatus.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={lpo.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCreateInvoice(lpo)}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Create Invoice
                        </Button>
                        {lpo.status === "pending" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMarkDelivered(lpo)}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Mark Delivered
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
          ) : (
            <p className="text-center text-muted-foreground py-8">No LPOs created yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
