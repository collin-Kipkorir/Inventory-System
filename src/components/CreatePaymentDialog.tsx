import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  listCompanies,
  listInvoices,
  createPayment,
  updateInvoice,
  updateLpo,
  listLpos,
} from "@/lib/api";
import { Company, Invoice, Payment, LPO } from "@/types";
import { Plus } from "lucide-react";
import { toast } from "sonner";

interface CreatePaymentDialogProps {
  onPaymentCreated: () => void;
}

const formatCurrency = (amount: number) => {
  return amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export function CreatePaymentDialog({ onPaymentCreated }: CreatePaymentDialogProps) {
  const [open, setOpen] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [lpos, setLpos] = useState<LPO[]>([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedReference, setSelectedReference] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [amountPaid, setAmountPaid] = useState("");
  const [mode, setMode] = useState<"cash" | "mpesa" | "bank">("cash");
  const [remarks, setRemarks] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [companiesData, invoicesData, lposData] = await Promise.all([
        listCompanies(),
        listInvoices(),
        listLpos(),
      ]);
      setCompanies(companiesData || []);
      setInvoices(invoicesData || []);
      setLpos(lposData || []);
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error("Failed to load payment data");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredReferences = invoices.filter((inv) => inv.companyId === selectedCompany && inv.balance > 0);

  const getMaxAmount = () => {
    if (!selectedReference) return 0;
    const invoice = invoices.find((inv) => inv.id === selectedReference);
    return invoice?.balance || 0;
  };

  const handleSubmit = async () => {
    if (!selectedCompany) {
      toast.error("Please select a company");
      return;
    }

    const amount = parseFloat(amountPaid);
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    const maxAmount = getMaxAmount();
    // Add small tolerance for floating-point precision (0.01 cents)
    if (selectedReference && amount > maxAmount + 0.01) {
      toast.error(`Amount exceeds outstanding balance (KES ${formatCurrency(maxAmount)})`);
      return;
    }

    const company = companies.find((c) => c.id === selectedCompany);
    if (!company) return;

    try {
      setIsLoading(true);

      // Create payment
      await createPayment({
        companyId: company.id,
        companyName: company.name,
        amountPaid: amount,
        mode,
        date,
        remarks,
        ...(selectedReference
          ? {
              invoiceId: selectedReference,
              invoiceNo: invoices.find((inv) => inv.id === selectedReference)?.invoiceNo,
            }
          : {}),
      });

      // Update invoice balance
      if (selectedReference) {
        const invoice = invoices.find((inv) => inv.id === selectedReference);
        if (invoice) {
          const newBalance = invoice.balance - amount;
          // Use small tolerance for floating-point precision
          const isFullyPaid = Math.abs(newBalance) < 0.01;
          const newStatus = isFullyPaid ? "paid" : newBalance > 0 ? "partial" : "unpaid";
          await updateInvoice(invoice.id, {
            amountPaid: invoice.amountPaid + amount,
            balance: isFullyPaid ? 0 : newBalance,
            status: newStatus,
          });

          // Update corresponding LPO payment status if it exists
          if (invoice.lpoId) {
            console.log('💳 Payment for invoice linked to LPO ID:', invoice.lpoId, 'LPO Number:', invoice.lpoNumber);
            const lpo = lpos.find((l) => l.id === invoice.lpoId);
            if (lpo) {
              console.log('✅ Found LPO:', lpo.lpoNumber, 'Current status:', lpo.paymentStatus);
              
              // Calculate total invoiced amount for this LPO from all related invoices
              const relatedInvoices = invoices.filter((inv) => inv.lpoId === invoice.lpoId);
              console.log('📋 Related invoices for this LPO:', relatedInvoices.length);
              
              const totalInvoiced = relatedInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
              
              // Calculate total paid for all invoices related to this LPO
              let totalPaidForLpo = 0;
              for (const inv of relatedInvoices) {
                if (inv.id === invoice.id) {
                  // Use the updated amount paid for the current invoice
                  totalPaidForLpo += invoice.amountPaid + amount;
                  console.log(`  Invoice ${inv.invoiceNo} (current): ${invoice.amountPaid} + ${amount} = ${invoice.amountPaid + amount}`);
                } else {
                  totalPaidForLpo += inv.amountPaid;
                  console.log(`  Invoice ${inv.invoiceNo}: ${inv.amountPaid}`);
                }
              }

              // Determine LPO payment status
              let lpoPaymentStatus: "paid" | "partial" | "unpaid";
              if (totalPaidForLpo === 0) {
                lpoPaymentStatus = "unpaid";
              } else if (totalPaidForLpo >= totalInvoiced) {
                lpoPaymentStatus = "paid";
              } else {
                lpoPaymentStatus = "partial";
              }

              console.log(`💰 Totals - Invoiced: ${totalInvoiced}, Paid: ${totalPaidForLpo}, Status: ${lpoPaymentStatus}`);

              // Update LPO with new payment status and amounts
              const lpoNewBalance = totalInvoiced - totalPaidForLpo;
              await updateLpo(lpo.id, {
                paymentStatus: lpoPaymentStatus,
                amountPaid: totalPaidForLpo,
                balance: lpoNewBalance,
              });

              console.log(
                `✅ Updated LPO ${lpo.lpoNumber}: paymentStatus=${lpoPaymentStatus}, amountPaid=${totalPaidForLpo}, balance=${lpoNewBalance}`
              );
            } else {
              console.warn('❌ LPO not found with ID:', invoice.lpoId);
            }
          } else {
            console.log('ℹ️ Invoice not linked to any LPO');
          }
        }
      }

      toast.success("Payment recorded successfully");
      setOpen(false);
      onPaymentCreated();
      
      // Reload invoices and LPOs to show updated payment status
      await Promise.all([
        loadData(),
      ]);
      
      resetForm();
    } catch (error) {
      console.error("Failed to record payment:", error);
      toast.error("Failed to record payment");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedCompany("");
    setSelectedReference("");
    setDate(new Date().toISOString().split("T")[0]);
    setAmountPaid("");
    setMode("cash");
    setRemarks("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Record Payment
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Company</Label>
              <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                <SelectTrigger>
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Invoice (Optional)</Label>
            <Select
              value={selectedReference}
              onValueChange={setSelectedReference}
              disabled={!selectedCompany}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select invoice" />
              </SelectTrigger>
              <SelectContent>
                {filteredReferences.map((ref: Invoice) => (
                  <SelectItem key={ref.id} value={ref.id}>
                    {ref.invoiceNo} - Balance: KES{" "}
                    {formatCurrency(ref.balance)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Amount Paid</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                min="0"
                step="0.01"
              />
              {selectedReference && (
                <p className="text-sm text-muted-foreground">Max: KES {formatCurrency(getMaxAmount())}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Payment Mode</Label>
              <Select value={mode} onValueChange={(value: "cash" | "mpesa" | "bank") => setMode(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="mpesa">M-Pesa</SelectItem>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Remarks (Optional)</Label>
            <Textarea
              placeholder="Add any notes about this payment"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Record Payment</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
