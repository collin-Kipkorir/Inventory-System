import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Product } from "@/types";
import { createProduct, listProducts, updateProduct, deleteProduct } from "@/lib/api";
import { toast } from "sonner";
import { responsiveTypography, responsiveSpacing } from "@/lib/responsive";

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    unit: "",
    unitPrice: "",
    vatInclusive: false,
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const data = await listProducts();
      setProducts(data || []);
    } catch (error) {
      console.error("Failed to load products:", error);
      toast.error("Failed to load products");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (editingProduct) {
        // Update product
        await updateProduct(editingProduct.id, {
          ...formData,
          unitPrice: parseFloat(formData.unitPrice),
        });
        toast.success("Product updated successfully");
      } else {
        // Create new product
        await createProduct({
          ...formData,
          unitPrice: parseFloat(formData.unitPrice),
        });
        toast.success("Product added successfully");
      }

      setIsOpen(false);
      resetForm();
      await loadProducts(); // Reload from Firebase
    } catch (error) {
      console.error("Failed to save product:", error);
      toast.error("Failed to save product");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    // Ask for confirmation before deleting
    const product = products.find((p) => p.id === id);
    const name = product?.name || "this product";
    const confirmMsg = `Are you sure you want to delete ${name}? This action cannot be undone.`;
    if (!window.confirm(confirmMsg)) return;

    try {
      setIsLoading(true);
      await deleteProduct(id);
      toast.success("Product deleted successfully");
      await loadProducts(); // Reload from Firebase
    } catch (error) {
      console.error("Failed to delete product:", error);
      toast.error("Failed to delete product");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      unit: product.unit,
      unitPrice: product.unitPrice.toString(),
      vatInclusive: product.vatInclusive || false,
    });
    setIsOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      unit: "",
      unitPrice: "",
      vatInclusive: false,
    });
    setEditingProduct(null);
  };

  return (
    <div className={responsiveSpacing.pageGap}>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
        <div>
          <h2 className={responsiveTypography.pageTitle}>Products</h2>
          <p className={`${responsiveTypography.small} text-muted-foreground`}>Manage your product catalog</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className={responsiveTypography.cardTitle}>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className={responsiveTypography.label}>Product Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className={responsiveTypography.body}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit (kg, pcs, litre, etc.)</Label>
                <Input
                  id="unit"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unitPrice">Unit Price (KES)</Label>
                <Input
                  id="unitPrice"
                  type="number"
                  step="0.01"
                  value={formData.unitPrice}
                  onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="vatInclusive"
                  checked={formData.vatInclusive}
                  onChange={(e) => setFormData({ ...formData, vatInclusive: e.target.checked })}
                  className="h-4 w-4 rounded border-input"
                />
                <Label htmlFor="vatInclusive" className="text-sm font-normal cursor-pointer">
                  VAT Inclusive (16%)
                </Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingProduct ? "Update" : "Add"} Product
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="overflow-x-auto p-2 sm:p-4">
          {products.length > 0 ? (
            <div className="min-w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className={`${responsiveTypography.tableHeader} whitespace-nowrap`}>Product Name</TableHead>
                    <TableHead className={`${responsiveTypography.tableHeader} whitespace-nowrap`}>Unit</TableHead>
                    <TableHead className={`${responsiveTypography.tableHeader} text-right whitespace-nowrap`}>Unit Price</TableHead>
                    <TableHead className={`${responsiveTypography.tableHeader} whitespace-nowrap`}>VAT</TableHead>
                    <TableHead className={`${responsiveTypography.tableHeader} whitespace-nowrap`}>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className={`${responsiveTypography.tableCell} font-medium whitespace-nowrap`}>{product.name}</TableCell>
                      <TableCell className={`${responsiveTypography.tableCell} whitespace-nowrap`}>{product.unit}</TableCell>
                      <TableCell className={`${responsiveTypography.tableCell} text-right whitespace-nowrap`}>KES {product.unitPrice.toFixed(2)}</TableCell>
                      <TableCell>
                        {product.vatInclusive ? (
                          <span className={`${responsiveTypography.small} text-success`}>Inclusive</span>
                        ) : (
                          <span className={`${responsiveTypography.small} text-muted-foreground`}>Not Included</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col sm:flex-row gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => handleEdit(product)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="text-xs"
                            onClick={() => handleDelete(product.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No products added yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
