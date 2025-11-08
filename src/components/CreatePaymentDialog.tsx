import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  getCompanies,
  getInvoices,
  getLPOs,
  getPayments,
  savePayments,
  saveInvoices,
  saveLPOs,
  generatePaymentNumber,
  generateId,
} from "@/lib/storage";
import { Company, Invoice, LPO, Payment } from "@/types";
import { Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface CreatePaymentDialogProps {
  onPaymentCreated: () => void;
}

export function CreatePaymentDialog({ onPaymentCreated }: CreatePaymentDialogProps) {
  const [open, setOpen] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [lpos, setLpos] = useState<LPO[]>([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [referenceType, setReferenceType] = useState<"invoice" | "lpo">("invoice");
  const [selectedReference, setSelectedReference] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [amountPaid, setAmountPaid] = useState("");
  const [mode, setMode] = useState<"cash" | "mpesa" | "bank">("cash");
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    if (open) {
      setCompanies(getCompanies());
      setInvoices(getInvoices());
      setLpos(getLPOs());
    }
  }, [open]);

  const filteredReferences = referenceType === "invoice"
    ? invoices.filter((inv) => inv.companyId === selectedCompany && inv.balance > 0)
    : lpos.filter((lpo) => lpo.companyId === selectedCompany && lpo.balance > 0);

  const getMaxAmount = () => {
    if (!selectedReference) return 0;
    if (referenceType === "invoice") {
      const invoice = invoices.find((inv) => inv.id === selectedReference);
      return invoice?.balance || 0;
    } else {
      const lpo = lpos.find((l) => l.id === selectedReference);
      return lpo?.balance || 0;
    }
  };

  const handleSubmit = () => {
    if (!selectedCompany) {
      toast({ title: "Error", description: "Please select a company", variant: "destructive" });
      return;
    }

    const amount = parseFloat(amountPaid);
    if (!amount || amount <= 0) {
      toast({ title: "Error", description: "Please enter a valid amount", variant: "destructive" });
      return;
    }

    const maxAmount = getMaxAmount();
    if (selectedReference && amount > maxAmount) {
      toast({
        title: "Error",
        description: `Amount exceeds outstanding balance (KES ${maxAmount.toLocaleString()})`,
        variant: "destructive",
      });
      return;
    }

    const company = companies.find((c) => c.id === selectedCompany);
    if (!company) return;

    const newPayment: Payment = {
      id: generateId(),
      paymentNo: generatePaymentNumber(),
      companyId: company.id,
      companyName: company.name,
      date,
      amountPaid: amount,
      mode,
      remarks,
      createdAt: new Date().toISOString(),
    };

    if (referenceType === "invoice" && selectedReference) {
      const invoice = invoices.find((inv) => inv.id === selectedReference);
      if (invoice) {
        newPayment.invoiceId = invoice.id;
        newPayment.invoiceNo = invoice.invoiceNo;

        const updatedInvoice = {
          ...invoice,
          amountPaid: invoice.amountPaid + amount,
          balance: invoice.balance - amount,
        };
        updatedInvoice.status =
          updatedInvoice.balance === 0 ? "paid" : updatedInvoice.balance < updatedInvoice.totalAmount ? "partial" : "unpaid";

        const allInvoices = getInvoices();
        saveInvoices(allInvoices.map((inv) => (inv.id === invoice.id ? updatedInvoice : inv)));
      }
    } else if (referenceType === "lpo" && selectedReference) {
      const lpo = lpos.find((l) => l.id === selectedReference);
      if (lpo) {
        newPayment.lpoId = lpo.id;
        newPayment.lpoNumber = lpo.lpoNumber;

        const updatedLPO = {
          ...lpo,
          amountPaid: lpo.amountPaid + amount,
          balance: lpo.balance - amount,
        };
        updatedLPO.paymentStatus =
          updatedLPO.balance === 0 ? "paid" : updatedLPO.balance < updatedLPO.totalAmount ? "partial" : "unpaid";

        const allLPOs = getLPOs();
        saveLPOs(allLPOs.map((l) => (l.id === lpo.id ? updatedLPO : l)));
      }
    }

    const payments = getPayments();
    savePayments([...payments, newPayment]);

    toast({ title: "Success", description: "Payment recorded successfully" });
    setOpen(false);
    onPaymentCreated();
    resetForm();
  };

  const resetForm = () => {
    setSelectedCompany("");
    setReferenceType("invoice");
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
            <Label>Reference Type</Label>
            <Select value={referenceType} onValueChange={(value: "invoice" | "lpo") => setReferenceType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="invoice">Invoice</SelectItem>
                <SelectItem value="lpo">LPO</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{referenceType === "invoice" ? "Invoice" : "LPO"} (Optional)</Label>
            <Select
              value={selectedReference}
              onValueChange={setSelectedReference}
              disabled={!selectedCompany}
            >
              <SelectTrigger>
                <SelectValue placeholder={`Select ${referenceType}`} />
              </SelectTrigger>
              <SelectContent>
                {filteredReferences.map((ref: any) => (
                  <SelectItem key={ref.id} value={ref.id}>
                    {referenceType === "invoice" ? ref.invoiceNo : ref.lpoNumber} - Balance: KES{" "}
                    {ref.balance.toLocaleString()}
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
                <p className="text-sm text-muted-foreground">Max: KES {getMaxAmount().toLocaleString()}</p>
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
