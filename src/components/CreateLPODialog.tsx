import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getCompanies, getProducts, getLPOs, saveLPOs, generateLPONumber, generateId } from "@/lib/storage";
import { Company, Product, LPO, InvoiceItem } from "@/types";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface CreateLPODialogProps {
  onLPOCreated: () => void;
}

export function CreateLPODialog({ onLPOCreated }: CreateLPODialogProps) {
  const [open, setOpen] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [manualLPONumber, setManualLPONumber] = useState("");
  const [useAutoLPONumber, setUseAutoLPONumber] = useState(true);
  const [items, setItems] = useState<InvoiceItem[]>([
    { productId: "", productName: "", quantity: 1, unit: "", unitPrice: 0, total: 0 },
  ]);

  useEffect(() => {
    if (open) {
      setCompanies(getCompanies());
      setProducts(getProducts());
    }
  }, [open]);

  const addItem = () => {
    setItems([...items, { productId: "", productName: "", quantity: 1, unit: "", unitPrice: 0, total: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    if (field === "productId") {
      const product = products.find((p) => p.id === value);
      if (product) {
        newItems[index].productName = product.name;
        newItems[index].unit = product.unit;
        newItems[index].unitPrice = product.unitPrice;
        newItems[index].total = newItems[index].quantity * product.unitPrice;
      }
    } else if (field === "quantity" || field === "unitPrice") {
      newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
    }

    setItems(newItems);
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateVAT = () => {
    const subtotal = calculateSubtotal();
    return subtotal * 0.16;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateVAT();
  };

  const handleSubmit = () => {
    if (!selectedCompany) {
      toast({ title: "Error", description: "Please select a company", variant: "destructive" });
      return;
    }

    if (!useAutoLPONumber && !manualLPONumber.trim()) {
      toast({ title: "Error", description: "Please enter an LPO number", variant: "destructive" });
      return;
    }

    if (items.some((item) => !item.productId || item.quantity <= 0)) {
      toast({ title: "Error", description: "Please fill all item details", variant: "destructive" });
      return;
    }

    const company = companies.find((c) => c.id === selectedCompany);
    if (!company) return;

    const subtotal = calculateSubtotal();
    const vat = calculateVAT();
    const totalAmount = calculateTotal();

    const newLPO: LPO = {
      id: generateId(),
      lpoNumber: useAutoLPONumber ? generateLPONumber() : manualLPONumber.trim(),
      companyId: company.id,
      companyName: company.name,
      items,
      subtotal,
      vat,
      totalAmount,
      amountPaid: 0,
      balance: totalAmount,
      date,
      status: "pending",
      paymentStatus: "unpaid",
      createdAt: new Date().toISOString(),
    };

    const lpos = getLPOs();
    saveLPOs([...lpos, newLPO]);

    toast({ title: "Success", description: "LPO created successfully" });
    setOpen(false);
    onLPOCreated();
    resetForm();
  };

  const resetForm = () => {
    setSelectedCompany("");
    setDate(new Date().toISOString().split("T")[0]);
    setManualLPONumber("");
    setUseAutoLPONumber(true);
    setItems([{ productId: "", productName: "", quantity: 1, unit: "", unitPrice: 0, total: 0 }]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create LPO
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New LPO</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="autoLPO"
                checked={useAutoLPONumber}
                onChange={(e) => setUseAutoLPONumber(e.target.checked)}
                className="h-4 w-4 rounded border-input"
              />
              <Label htmlFor="autoLPO" className="text-sm font-normal cursor-pointer">
                Auto-generate LPO Number
              </Label>
            </div>
            {!useAutoLPONumber && (
              <div className="space-y-2">
                <Label>LPO Number</Label>
                <Input
                  placeholder="Enter LPO number"
                  value={manualLPONumber}
                  onChange={(e) => setManualLPONumber(e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Items</Label>
              <Button type="button" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
            {items.map((item, index) => (
              <div key={index} className="flex flex-col md:flex-row gap-2 items-end">
                <div className="flex-1 w-full">
                  <Label className="text-xs md:text-sm">Product</Label>
                  <Select
                    value={item.productId}
                    onValueChange={(value) => updateItem(index, "productId", value)}
                  >
                    <SelectTrigger className="text-xs md:text-sm">
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id} className="text-xs md:text-sm">
                          {product.name} - KES {product.unitPrice}/{product.unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full md:w-24">
                  <Label className="text-xs md:text-sm">Quantity</Label>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 0)}
                    className="text-xs md:text-sm"
                  />
                </div>
                <div className="w-full md:w-32">
                  <Label className="text-xs md:text-sm">Unit Price</Label>
                  <Input type="number" value={item.unitPrice} readOnly className="bg-muted text-xs md:text-sm" />
                </div>
                <div className="w-full md:w-32">
                  <Label className="text-xs md:text-sm">Total</Label>
                  <Input type="number" value={item.total} readOnly className="bg-muted text-xs md:text-sm" />
                </div>
                {items.length > 1 && (
                  <Button type="button" variant="destructive" size="icon" onClick={() => removeItem(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center pt-4 border-t gap-4">
            <div className="text-sm md:text-base space-y-1">
              <div>Subtotal: KES {calculateSubtotal().toLocaleString()}</div>
              <div className="text-muted-foreground">VAT (16%): KES {calculateVAT().toLocaleString()}</div>
              <div className="font-semibold text-lg">Total: KES {calculateTotal().toLocaleString()}</div>
            </div>
            <div className="flex space-x-2 w-full md:w-auto">
              <Button variant="outline" onClick={() => setOpen(false)} className="flex-1 md:flex-none">
                Cancel
              </Button>
              <Button onClick={handleSubmit} className="flex-1 md:flex-none">Create LPO</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
