import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { Company } from "@/types";
import { createCompany, listCompanies, updateCompany, deleteCompany } from "@/lib/api";
import { toast } from "sonner";
import { responsiveTypography, responsiveSpacing } from "@/lib/responsive";
import ConfirmDialog from "@/components/ConfirmDialog";

export default function Companies() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<{ id: string; name?: string } | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
    kraPin: "",
  });

  // Load companies from Firebase on mount
  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setIsLoading(true);
      const data = await listCompanies();
      setCompanies(data || []);
    } catch (error) {
      console.error("Failed to load companies:", error);
      toast.error("Failed to load companies");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (editingCompany) {
        // Update company
        await updateCompany(editingCompany.id, formData);
        toast.success("Company updated successfully");
      } else {
        // Create new company
        await createCompany(formData);
        toast.success("Company added successfully");
      }

      setIsOpen(false);
      resetForm();
      await loadCompanies(); // Reload from Firebase
    } catch (error) {
      console.error("Failed to save company:", error);
      toast.error("Failed to save company");
    } finally {
      setIsLoading(false);
    }
  };

  const performDelete = async (id: string) => {
    try {
      setIsLoading(true);
      await deleteCompany(id);
      toast.success("Company deleted successfully");
      await loadCompanies(); // Reload from Firebase
    } catch (error) {
      console.error("Failed to delete company:", error);
      toast.error("Failed to delete company");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    const company = companies.find((c) => c.id === id);
    setConfirmTarget({ id, name: company?.name });
    setConfirmOpen(true);
  };

  const handleEdit = (company: Company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name,
      contactPerson: company.contactPerson,
      phone: company.phone,
      email: company.email,
      address: company.address,
      kraPin: company.kraPin || "",
    });
    setIsOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      contactPerson: "",
      phone: "",
      email: "",
      address: "",
      kraPin: "",
    });
    setEditingCompany(null);
  };

  return (
    <div className={responsiveSpacing.pageGap}>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
        <div>
          <h4 className={responsiveTypography.pageTitle}>Companies</h4>
          <p className={`${responsiveTypography.small} text-muted-foreground`}>Manage your business partners</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Add Company
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className={responsiveTypography.cardTitle}>{editingCompany ? "Edit Company" : "Add New Company"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Company Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPerson">Contact Person</Label>
                  <Input
                    id="contactPerson"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="kraPin">KRA PIN</Label>
                <Input
                  id="kraPin"
                  value={formData.kraPin}
                  onChange={(e) => setFormData({ ...formData, kraPin: e.target.value })}
                  placeholder="e.g., A001234567X"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingCompany ? "Update" : "Add"} Company
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

          <Card>
       
        <CardContent className="overflow-x-auto p-2 sm:p-4">
          {companies.length > 0 ? (
            <div className="min-w-full overflow-x-auto">
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className={`${responsiveTypography.tableHeader} whitespace-nowrap`}>Company Name</TableHead>
                  <TableHead className={`${responsiveTypography.tableHeader} whitespace-nowrap`}>Contact Person</TableHead>
                  <TableHead className={`${responsiveTypography.tableHeader} whitespace-nowrap`}>Phone</TableHead>
                  <TableHead className={`${responsiveTypography.tableHeader} whitespace-nowrap`}>Email</TableHead>
                  <TableHead className={`${responsiveTypography.tableHeader} whitespace-nowrap`}>Address</TableHead>
                  <TableHead className={`${responsiveTypography.tableHeader} whitespace-nowrap`}>KRA PIN</TableHead>
                  <TableHead className={`${responsiveTypography.tableHeader} whitespace-nowrap`}>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell className={`${responsiveTypography.tableCell} font-medium whitespace-nowrap`}>{company.name}</TableCell>
                    <TableCell className={`${responsiveTypography.tableCell} whitespace-nowrap`}>{company.contactPerson}</TableCell>
                    <TableCell className={`${responsiveTypography.tableCell} whitespace-nowrap`}>{company.phone}</TableCell>
                    <TableCell className={`${responsiveTypography.tableCell} whitespace-nowrap max-w-xs truncate`}>{company.email}</TableCell>
                    <TableCell className={`${responsiveTypography.tableCell} whitespace-nowrap max-w-xs truncate`}>{company.address}</TableCell>
                    <TableCell className={`${responsiveTypography.tableCell} whitespace-nowrap`}>{company.kraPin || "-"}</TableCell>
                    <TableCell>
                      <div className="flex flex-col sm:flex-row gap-1 sm:gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => navigate(`/companies/${company.id}`)}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => handleEdit(company)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="text-xs"
                          onClick={() => handleDelete(company.id)}
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
            <p className="text-center text-muted-foreground py-8">No companies added yet</p>
          )}
        </CardContent>
      </Card>
      {/* Confirmation dialog */}
      {confirmTarget && (
        <>
          <ConfirmDialog
            open={confirmOpen}
            onOpenChange={(open) => {
              setConfirmOpen(open);
              if (!open) setConfirmTarget(null);
            }}
            title={`Delete ${confirmTarget.name || "company"}`}
            description={`Are you sure you want to delete ${confirmTarget.name || "this company"}? This action cannot be undone.`}
            confirmLabel="Delete"
            onConfirm={async () => {
              await performDelete(confirmTarget.id);
            }}
          />
        </>
      )}
    </div>
  );
}
