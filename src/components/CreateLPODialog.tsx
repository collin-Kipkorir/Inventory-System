import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { listCompanies, listProducts, createLpo } from "@/lib/api";
import { Company, Product, LPO, InvoiceItem } from "@/types";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

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
  const [isLoading, setIsLoading] = useState(false);
  const [items, setItems] = useState<InvoiceItem[]>([
    { productId: "", productName: "", quantity: 1, unit: "", unitPrice: 0, total: 0 },
  ]);

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [companiesData, productsData] = await Promise.all([
        listCompanies(),
        listProducts(),
      ]);
      setCompanies(companiesData || []);
      setProducts(productsData || []);
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error("Failed to load companies and products");
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleSubmit = async () => {
    if (!selectedCompany) {
      toast.error("Please select a company");
      return;
    }

    if (items.some((item) => !item.productId || item.quantity <= 0)) {
      toast.error("Please fill all item details");
      return;
    }
    
    // Validate manual LPO number if not using auto-generation
    if (!useAutoLPONumber && !manualLPONumber.trim()) {
      toast.error("Please enter an LPO number");
      return;
    }

    const company = companies.find((c) => c.id === selectedCompany);
    if (!company) return;

    const subtotal = calculateSubtotal();
    const vat = calculateVAT();
    const totalAmount = calculateTotal();

    try {
      setIsLoading(true);
      
      // Prepare LPO data
      const lpoData: Record<string, unknown> = {
        companyId: company.id,
        companyName: company.name,
        items,
        subtotal,
        vat,
        totalAmount,
        date,
        status: "pending",
      };
      
      // Add manual LPO number if not using auto-generation
      // Send as 'manualLPONumber' for backend to process and store as 'lpoNumber'
      if (!useAutoLPONumber) {
        const trimmedNumber = manualLPONumber.trim();
        if (trimmedNumber) {
          lpoData.manualLPONumber = trimmedNumber;
          console.log('✋ Frontend: Sending MANUAL LPO number:', trimmedNumber);
        } else {
          throw new Error("Manual LPO number cannot be empty");
        }
      } else {
        console.log('✨ Frontend: Backend will AUTO-generate LPO number');
      }
      
      await createLpo(lpoData);

      toast.success("LPO created successfully");
      setOpen(false);
      onLPOCreated();
      resetForm();
    } catch (error) {
      console.error("Failed to create LPO:", error);
      toast.error("Failed to create LPO");
    } finally {
      setIsLoading(false);
    }
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
